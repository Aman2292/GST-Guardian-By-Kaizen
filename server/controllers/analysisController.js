exports.mockBankStatementAnalysis = () => {
    // Generate realistic looking data for the "Current Month" + past 2 months
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const prevMonth1 = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'short' });
    const prevMonth2 = new Date(new Date().setMonth(new Date().getMonth() - 2)).toLocaleString('default', { month: 'short' });

    return {
        // Spending Trend: Showing a 40% jump in the current month
        spendingTrend: [
            { month: prevMonth2, amount: 42000 },
            { month: prevMonth1, amount: 45000 },
            { month: currentMonth, amount: 63000 } // ~40% jump
        ],
        // Anomalies: Flagging the cause of the jump
        anomalies: [
            {
                date: new Date().toISOString().split('T')[0],
                description: 'Unusual High Value Transfer - Vendor Unknown',
                amount: 18000,
                severity: 'high'
            },
            {
                date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
                description: 'Duplicate Payment Detected',
                amount: 4500,
                severity: 'medium'
            }
        ],
        // Categorization for GST
        categories: [
            { name: 'Office Equipment', amount: 25000, gstInput: 'Eligible', color: '#10B981' },
            { name: 'Travel & Dining', amount: 12000, gstInput: 'Ineligible (Blocked)', color: '#EF4444' },
            { name: 'Utilities', amount: 8000, gstInput: 'Eligible', color: '#3B82F6' },
            { name: 'Miscellaneous', amount: 18000, gstInput: 'Review Required', color: '#F59E0B' }
        ],
        summary: "⚠️ Spending has increased by 40% this month. Large transfer of ₹18,000 to an unknown vendor requires verification."
    };
};
