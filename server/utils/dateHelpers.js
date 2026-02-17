// Returns the date object for a specific day of the CURRENT month (or next if day passed? logic depends on requirement)
// For simplicty, let's say we generate for a financial year, so we pass month/year explicitly.

exports.getDateObj = (day, month, year) => {
    // Month is 0-indexed in JS Date, but let's assume inputs are 1-12
    return new Date(year, month - 1, day);
};

exports.getFinancialYear = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();

    // If before April, we are in (Year-1)-Year
    // If after April, we are in Year-(Year+1)
    if (currentMonth < 4) {
        return { start: currentYear - 1, end: currentYear };
    } else {
        return { start: currentYear, end: currentYear + 1 };
    }
};
