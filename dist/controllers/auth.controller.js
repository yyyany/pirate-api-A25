"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const AppError_1 = require("../errors/AppError");
const authService = new auth_service_1.AuthService();
class AuthController {
    register = async (req, res, next) => {
        try {
            if (req.user) {
                return next(new AppError_1.AppError("You are already logged in", {
                    statusCode: 403,
                    code: "CANNOT_REGISTER_WHEN_LOGGED_IN",
                    details: "You are already logged in. Please log out before registering"
                }));
            }
            const { username, password } = req.body;
            const token = await authService.registerUser({ username, password });
            res.status(200).json({ message: 'Register successful. You are now logged in.', token: token });
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const { username, password } = req.body;
            const token = await authService.loginUser({ username, password });
            res.status(200).json({ message: 'Login successful', token: token });
        }
        catch (error) {
            next(error);
        }
    };
    logout = async (req, res, next) => {
        return res.status(200).json({ message: "Logged out" });
    };
    me = async (req, res, next) => {
        try {
            if (!req.user) {
                return next(new AppError_1.AppError("You are not logged in", {
                    statusCode: 401,
                    code: "AUTH_REQUIRED",
                    details: "You need to be logged in to access this resource."
                }));
            }
            const user = await authService.getUserByUsername(req.user.username);
            const response = {
                message: 'You are logged in', user: {
                    id: user?.id,
                    username: user?.username,
                    createdAt: user?.createdAt,
                    updatedAt: user?.updatedAt
                }
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map