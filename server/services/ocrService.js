const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const OpenAI = require('openai');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

let pdfLib;

/**
 * Preprocess image for better OCR accuracy
 */
const preprocessImage = async (buffer) => {
    try {
        return await sharp(buffer)
            .grayscale()
            .normalize()
            .modulate({ brightness: 1.2, saturation: 1.1 })
            .toBuffer();
    } catch (err) {
        console.error('Sharp preprocessing failed, using original buffer:', err);
        return buffer;
    }
};

/**
 * Extract raw text from image/PDF buffer using Tesseract
 */
const extractTextFromBuffer = async (buffer, mimeType = 'image/jpeg') => {
    try {
        let imageBuffers = [];

        if (mimeType.includes('pdf')) {
            console.log('[OCR] PDF detected, loading converter...');
            if (!pdfLib) {
                const module = await import('pdf-img-convert');
                pdfLib = module.default || module;
            }

            const images = await pdfLib.convert(buffer, {
                width: 2000,
                density: 300
            });
            imageBuffers = images;
        } else {
            imageBuffers = [buffer];
        }

        let fullText = '';
        const Tesseract = require('tesseract.js');
        for (const [index, imgBuffer] of imageBuffers.entries()) {
            console.log(`[OCR] Processing page/image ${index + 1}/${imageBuffers.length}...`);
            const preprocessed = await preprocessImage(imgBuffer);

            const { data: { text } } = await Tesseract.recognize(
                preprocessed,
                'eng+hin',
                {
                    logger: m => console.log(`[Tesseract] ${m.status}: ${Math.round(m.progress * 100)}%`)
                }
            );
            fullText += text + '\n';
        }

        return fullText.trim();
    } catch (err) {
        console.error('Tesseract/PDF failed:', err);
        throw err;
    }
};

const analyzeWithGemini = async (rawText) => {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    // DIAGNOSTIC LOGS
    console.log(`[AI-DIAGNOSTIC] Gemini Key: ${geminiApiKey ? geminiApiKey.substring(0, 10) + '...' : 'MISSING'}`);
    console.log(`[AI-DIAGNOSTIC] OpenAI Key: ${openaiApiKey ? openaiApiKey.substring(0, 10) + '...' : 'MISSING'}`);

    const advancedPrompt = `
    You are a senior GST compliance expert with complete knowledge of the CGST Act 2017, IGST Act, all GST Council recommendations, CBIC notifications, circulars, and amendments up to February 2026 (including e-invoicing threshold ₹5 crore, QRMP scheme, ITC reversal rules, place of supply guidelines, blocked credits under Section 17(5), reverse charge mechanism, and GSTR-2B reconciliation logic).

    The following is RAW TEXT extracted via OCR from an Indian GST invoice or related document. The text may be messy, out of order, contain typos, extra spaces, line breaks, garbage characters, or mixed languages (mostly English, sometimes Hindi).

    RAW TEXT:
    """
    ${rawText.substring(0, 25000)}
    """

    Your tasks (perform them in this exact order):

    1. Clean the text: Remove garbage characters, fix common OCR errors (e.g., '0' → 'O', 'l' → '1'), normalize spacing, and reconstruct logical lines where possible.

    2. Identify the document type (choose one):
       - Tax Invoice
       - Bill of Supply
       - Debit Note
       - Credit Note
       - Receipt Voucher
       - Payment Voucher
       - Refund Voucher
       - E-Invoice (IRN present)
       - Export Invoice / LUT
       - Self-Invoice (RCM)
       - Other / Not Recognized

    3. Extract all available key fields as a flat JSON object. Use null or empty string if not found. Be conservative — only extract what is clearly present.
       Required fields (include even if missing):
       - document_type (from step 2)
       - invoice_number
       - invoice_date (convert to YYYY-MM-DD)
       - supplier_name
       - supplier_gstin
       - recipient_name
       - recipient_gstin
       - place_of_supply (state name or code, e.g., "Maharashtra" or "27")
       - currency (e.g., "INR", "USD", "EUR")
       - exchange_rate (if not INR, provide the conversion rate used to calculate INR values below. Use current approx market rate if not explicitly on invoice)
       - taxable_value (number in INR - convert if original is foreign)
       - cgst_amount (in INR)
       - sgst_amount (in INR)
       - igst_amount (in INR)
       - cess_amount (in INR)
       - total_amount (in INR - include all taxes)
       - original_total_amount (total in original currency)
       - hsn_codes (array of strings or objects if multiple)
       - reverse_charge (true/false)
       - irn (e-invoice reference number if present)
       - qr_code_present (true/false – if you detect QR code mention)

    **CRITICAL FOR FOREIGN CURRENCY**: If the invoice is in USD/EUR/etc., you MUST calculate the INR equivalent for all amount fields using a reasonable current rate (e.g. 1 USD = 83 INR) and set the 'currency' field accordingly. The 'total_amount' MUST be in INR for GST compliance in this system.

    4. Perform compliance checks. Return an array of issues. For each issue include:
       - issue (short title)
       - severity ("high", "medium", "low")
       - explanation (1-1 sentence, cite relevant section/notification if possible)
       - action_needed (what the CA or client should do)

       Common checks to run (but only flag if violation is clear):
       - Missing or invalid supplier GSTIN (15 chars, checksum)
       - Missing or invalid recipient GSTIN
       - Missing invoice number or date
       - Missing taxable value or total amount
       - No HSN/SAC for taxable supplies > ₹5 lakh (B2B)
       - Ineligible ITC (motor vehicle, food, health, Sec 17(5))
       - Wrong tax breakup (CGST+SGST vs IGST based on place of supply)
       - Date in future or unreasonably old
       - Possible duplicate invoice number (if pattern suggests)
       - Reverse charge not applied when required (e.g., GTA, advocate services)
       - E-invoice missing IRN when turnover threshold applies
       - Other obvious red flags (e.g., handwritten without proper format)

    5. Determine overall risk level:
       - "high" = at least one high-severity issue
       - "medium" = medium issues only
       - "low" = no or only low issues

    6. Suggest next action (one short sentence)

    7. Output **ONLY** valid JSON.

    The JSON MUST follow this exact structure:
    {
      "document_type": "...",
      "extracted_data": {
         "invoice_number": "...",
         "invoice_date": "...",
         "supplier_name": "...",
         "supplier_gstin": "...",
         "recipient_name": "...",
         "recipient_gstin": "...",
         "place_of_supply": "...",
         "currency": "...",
         "exchange_rate": 83.0,
         "taxable_value": 0,
         "cgst_amount": 0,
         "sgst_amount": 0,
         "igst_amount": 0,
         "cess_amount": 0,
         "total_amount": 0,
         "original_total_amount": 0,
         "hsn_codes": [],
         "reverse_charge": false,
         "irn": "...",
         "qr_code_present": false
      },
      "compliance_flags": [
        { "issue": "...", "severity": "...", "explanation": "...", "action_needed": "..." }
      ],
      "risk_level": "...",
      "suggested_action": "..."
    }
    `;

    // 1. Try Gemini Models
    if (geminiApiKey) {
        const modelsToTry = [
            "gemini-2.5-flash",
            "gemini-flash-latest",
            "gemini-pro-latest",
            "gemini-2.0-flash",
            "gemini-1.5-pro-latest"
        ];
        for (const modelName of modelsToTry) {
            try {
                console.log(`[Gemini] Attempting analysis with ${modelName}...`);
                const genAI = new GoogleGenerativeAI(geminiApiKey);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
                    ]
                });

                const result = await model.generateContent(advancedPrompt);
                const responseText = result.response.text();
                const parsed = parseAIResponse(responseText);
                if (parsed) {
                    console.log(`[Gemini] Success with ${modelName}`);
                    return parsed;
                }
            } catch (err) {
                console.warn(`[Gemini] ${modelName} failed:`, err.message);
                // If the error message is a 404, we definitely want to try the next model.
                // If it's a 429, we also try the next model.
            }
        }
    }

    // 2. Try OpenAI Fallback
    if (openaiApiKey) {
        try {
            console.log(`[OpenAI] Attempting fallback analysis with GPT-4o...`);
            const openai = new OpenAI({ apiKey: openaiApiKey });
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: advancedPrompt }],
                response_format: { type: "json_object" }
            });

            const parsed = JSON.parse(response.choices[0].message.content);
            console.log('[OpenAI] Success with GPT-4o');
            return parsed;
        } catch (err) {
            console.error('[OpenAI] Fallback failed:', err.message);
        }
    }

    // 3. Regex Fallback (Last Resort)
    return regexFallback(rawText);
};

const parseAIResponse = (text) => {
    try {
        let jsonStr = text;
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) jsonStr = jsonMatch[1];
        const cleaned = jsonStr.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
        return JSON.parse(cleaned);
    } catch (e) {
        console.error('Failed to parse AI response:', e.message);
        return null;
    }
};

const regexFallback = (rawText) => {
    console.warn('AI analysis failed. Using pattern matching.');
    const gstinMatch = rawText.match(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/g);
    const amountRegex = /(?:Total|Amount|Value|₹|INR|Gross|Net|Payable)\s*[:.]?\s*(?:₹|INR)?\s*([\d,]+\.?\d*)/gi;
    let match, amounts = [];
    while ((match = amountRegex.exec(rawText)) !== null) amounts.push(parseFloat(match[1].replace(/,/g, '')));
    const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
    const dateMatch = rawText.match(/\d{2}[/-]\d{2}[/-]\d{4}/) || rawText.match(/\d{4}[/-]\d{2}[/-]\d{2}/);
    const invNoMatch = rawText.match(/(?:Inv(?:oice)?\s*(?:No|No\.|Number|#))\s*[:.]?\s*([A-Z0-9/-]+)/i);
    const businessNameMatch = rawText.match(/([A-Z\s]{3,40}(?:PVT\s?LTD|LTD|CORP|INC|LLP|SONS|INDUSTRIES|ENTERPRISES))/i);

    return {
        document_type: "Unknown (Fallback)",
        extracted_data: {
            invoice_number: invNoMatch ? invNoMatch[1] : '',
            invoice_date: dateMatch ? dateMatch[0] : '',
            supplier_name: businessNameMatch ? businessNameMatch[0].trim() : 'Extracted via OCR (AI failed)',
            supplier_gstin: gstinMatch ? gstinMatch[0] : '',
            recipient_name: '',
            recipient_gstin: gstinMatch && gstinMatch.length > 1 ? gstinMatch[1] : '',
            place_of_supply: '',
            taxable_value: maxAmount > 0 ? (maxAmount / 1.18).toFixed(2) : 0,
            cgst_amount: 0,
            sgst_amount: 0,
            igst_amount: 0,
            cess_amount: 0,
            total_amount: maxAmount,
            hsn_codes: [],
            reverse_charge: false,
            irn: '',
            qr_code_present: false
        },
        compliance_flags: [{
            issue: "AI Offline",
            severity: "high",
            explanation: "Could not reach Gemini or OpenAI. Basic data extracted from text patterns. Manual audit required.",
            action_needed: "Manual audit required."
        }],
        risk_level: "medium",
        suggested_action: "Audit required."
    };
};

module.exports = {
    extractTextFromBuffer,
    analyzeWithGemini
};
