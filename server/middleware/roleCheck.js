const isFirmAdmin = (req, res, next) => {
    if (req.user.role === 'firms') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Firm Admin only.' });
    }
};

const isCA = (req, res, next) => {
    if (req.user.role === 'ca' || req.user.role === 'firms') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. CA only.' });
    }
};

const isClient = (req, res, next) => {
    if (req.user.role === 'client') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Client only.' });
    }
};

module.exports = { isFirmAdmin, isCA, isClient };
