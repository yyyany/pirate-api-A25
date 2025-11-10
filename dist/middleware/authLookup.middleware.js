"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLookup = authLookup;
const jwt_1 = require("../utils/jwt");
//import { AppError } from '../errors/AppError';
// ChatGPT ici encore
// C'est un entre-deux entre aucun middleware et l'authentification.
// Il va mettre le user dans la requête si le token est là, mais ne va pas empêcher de continuer
// sans être connecté.
function authLookup(req, _res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return next();
    const token = authHeader.split(' ')[1];
    try {
        req.user = (0, jwt_1.verifyToken)(token);
    }
    catch (error) {
    }
    next();
}
//# sourceMappingURL=authLookup.middleware.js.map