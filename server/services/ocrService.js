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
    You are a senior GST compliance expert and financial analyst with complete knowledge of the CGST Act 2017 and bank statement reconciliation logic.

    The following is RAW TEXT extracted via OCR from an Indian financial document (GST Invoice, Bank Statement, Form 16, etc.). The text may be messy.

    RAW TEXT:
    """
    ${rawText.substring(0, 25000)}
    """

    Your tasks (perform them in this exact order):

    1. Clean the text and identify the document type (choose one):
       - Purchase Invoice
       - Sale Invoice
       - Bank Statement
       - Form 16
       - GST Notice
       - Other

    2. Generate a "smart_label": A concise, descriptive string for a vault view. 
       - For invoices: "[Vendor Name] • [Amount] • [Month/Year]"
       - For bank statements: "[Bank Name] • [Account Last 4] • [Date Range]"
       - For others: "[Doc Type] • [Key Detail]"

    3. Extract all available key fields as a flat JSON object 'extracted_data'.
       If the document is a BANK STATEMENT, extract up to 20 recent transactions into a 'transactions' array with fields: { date, description, amount, type ('debit' or 'credit') }.

    4. Perform compliance checks (flag missing GSTINs, mismatch tax, etc.).

    5. Determine overall risk level ("high", "medium", "low").

    6. Suggest next action.

    7. Output **ONLY** valid JSON following this structure:
    {
      "document_type": "...",
      "smart_label": "...",
      "extracted_data": { ... },
      "transactions": [ { "date": "...", "description": "...", "amount": 0, "type": "debit/credit" } ],
      "compliance_flags": [ { "issue": "...", "severity": "...", "explanation": "...", "action_needed": "..." } ],
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
