"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const authRouter = () => {
    const router = (0, express_1.Router)();
    const authController = new auth_controller_1.AuthController();
    router.post("/register", authController.register);
    router.post("/login", authController.login);
    router.post("/logout", authController.logout);
    router.get("/me", authController.me);
    return router;
};
exports.authRouter = authRouter;
//# sourceMappingURL=auth.routes.js.map