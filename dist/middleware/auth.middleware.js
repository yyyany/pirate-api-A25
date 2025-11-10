"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authenticateAdmin = authenticateAdmin;
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../errors/AppError");
// ChatGPT pour l'idée de mettre l'utilisateur dans la requête et de next() l'erreur plutôt que throw.
// Je connaissais déjà pour le reste.
function authenticate(req, _res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return next(new AppError_1.AppError("Unauthorized", { statusCode: 401, code: "AUTH_REQUIRED", details: "You need to be logged in to access this resource." }));
    }
    const token = authHeader.split(' ')[1];
    try {
        req.user = (0, jwt_1.verifyToken)(token);
        return next();
    }
    catch (error) {
        return next(new AppError_1.AppError("Unauthorized", { statusCode: 401, code: "AUTH_REQUIRED", details: "Invalid or expired login token. Please log in and try again." }));
    }
}
function authenticateAdmin(req, _res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return next(new AppError_1.AppError("Unauthorized", { statusCode: 401, code: "AUTH_REQUIRED", details: "You need to be logged in to access this resource." }));
    }
    const token = authHeader.split(' ')[1];
    try {
        req.user = (0, jwt_1.verifyToken)(token);
        if (req.user.isAdmin !== true)
            return next(new AppError_1.AppError("Forbidden, no access to ressource", { statusCode: 403, code: "FORBIDDEN", details: "You do not have permission to access this resource." }));
        return next();
    }
    catch (error) {
        return next(new AppError_1.AppError("Unauthorized", { statusCode: 401, code: "AUTH_REQUIRED", details: "Invalid or expired login token. Please log in and try again." }));
    }
}
//# sourceMappingURL=auth.middleware.js.map