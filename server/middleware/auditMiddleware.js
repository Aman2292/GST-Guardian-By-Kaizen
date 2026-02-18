const AuditLog = require('../models/AuditLog');

// Helper to determine resource type from endpoint
const getResourceFromEndpoint = (path) => {
    if (path.includes('/documents')) return 'Document';
    if (path.includes('/clients')) return 'Client';
    if (path.includes('/deadlines')) return 'Deadline';
    if (path.includes('/cas')) return 'CA';
    if (path.includes('/firm')) return 'Firm';
    return 'Unknown';
};

// Helper to map HTTP method to action
const getActionFromMethod = (method, path) => {
    if (path.includes('/upload')) return 'UPLOAD';
    if (path.includes('/verify')) return 'VERIFY';

    switch (method) {
        case 'POST': return 'CREATE';
        case 'PUT':
        case 'PATCH': return 'UPDATE';
        case 'DELETE': return 'DELETE';
        default: return 'OTHER';
    }
};

// Middleware to log all mutations
const auditMiddleware = async (req, res, next) => {
    // Only log mutation operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }

    // Skip sensitive routes
    const skipRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
    if (skipRoutes.some(route => req.path.startsWith(route))) {
        return next();
    }

    // Skip if no authenticated user - REMOVED EARLY CHECK
    // If auth happens downstream, we'll check req.user in the finish callback
    // if (!req.user || !req.user.firmId) {
    //     return next();
    // }

    // Capture original response methods
    const originalJson = res.json;
    const originalSend = res.send;

    let responseBody = null;

    // Override res.json to capture response
    res.json = function (body) {
        responseBody = body;
        return originalJson.call(this, body);
    };

    // Override res.send to capture response
    res.send = function (body) {
        responseBody = body;
        return originalSend.call(this, body);
    };

    // Wait for response to complete
    res.on('finish', async () => {
        try {
            // Only log successful operations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Check for user existence HERE, after auth middleware has run
                if (!req.user || !req.user.firmId) {
                    return;
                }

                const logEntry = {
                    firmId: req.user.firmId,
                    performedBy: req.user.userId,
                    performedByName: req.user.name || 'Unknown',
                    role: req.user.role,

                    action: getActionFromMethod(req.method, req.path),
                    httpMethod: req.method,
                    resource: getResourceFromEndpoint(req.path),
                    resourceId: req.params.id || req.params.clientId || req.params.deadlineId || null,

                    endpoint: req.path,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),

                    changes: {
                        before: null, // Could be enhanced to fetch existing data before mutation
                        after: req.body
                    },

                    // Legacy compatibility
                    targetId: req.params.id || null,
                    targetType: getResourceFromEndpoint(req.path),
                    details: {
                        method: req.method,
                        path: req.path,
                        body: req.body,
                        params: req.params
                    }
                };

                // Async log (non-blocking)
                await AuditLog.create(logEntry);
            }
        } catch (error) {
            // Silent fail - don't break the request if logging fails
            console.error('[Audit Middleware] Failed to log action:', error.message);
        }
    });

    next();
};

module.exports = auditMiddleware;
