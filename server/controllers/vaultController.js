const Document = require('../models/Document');
const mongoose = require('mongoose');

// @desc    Perform Gap Analysis (Bank transactions vs Invoices)
// @route   GET /api/vault/gap-analysis/:clientId
exports.getGapAnalysis = async (req, res) => {
    try {
        const { clientId } = req.params;

        // 1. Get all Bank Statements
        const bankStatements = await Document.find({
            clientId,
            category: 'Bank Statement'
        });

        // 2. Get all Purchase Invoices
        const purchaseInvoices = await Document.find({
            clientId,
            category: 'Purchase Invoice'
        });

        // 3. Extract and Flatten Transactions
        let allTransactions = [];
        bankStatements.forEach(stmt => {
            if (stmt.transactions && stmt.transactions.length > 0) {
                stmt.transactions.forEach(tx => {
                    allTransactions.push({
                        ...tx.toObject(),
                        statementId: stmt._id,
                        statementName: stmt.originalName
                    });
                });
            }
        });

        // 4. Reconciliation Logic
        // Simple matching for demo: Match by exact amount
        const gaps = allTransactions.filter(tx => {
            if (tx.type !== 'debit') return false; // Only reconcile debits (purchases)

            // Check if any purchase invoice matches this amount
            const match = purchaseInvoices.find(inv =>
                Math.abs(inv.extractedData.totalAmount - tx.amount) < 0.1 // Exact-ish match
            );

            return !match; // It's a gap if NO match found
        });

        res.json({
            success: true,
            data: {
                totalTransactions: allTransactions.length,
                totalDebits: allTransactions.filter(t => t.type === 'debit').length,
                matchedInvoices: purchaseInvoices.length,
                missingInvoicesCount: gaps.length,
                gaps: gaps.slice(0, 50) // Limit to top 50 for UI
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get Vault Overview Stats
// @route   GET /api/vault/stats/:clientId
exports.getVaultStats = async (req, res) => {
    try {
        const { clientId } = req.params;

        const stats = await Document.aggregate([
            { $match: { clientId: new mongoose.Types.ObjectId(clientId) } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const riskStats = await Document.aggregate([
            { $match: { clientId: new mongoose.Types.ObjectId(clientId) } },
            { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                byCategory: stats,
                byRisk: riskStats
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
