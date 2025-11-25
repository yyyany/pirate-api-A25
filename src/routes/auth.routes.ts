import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";

export const authRouter = (): Router => {
  const router = Router();
  const authController = new AuthController();

  router.post("/register", authController.register);
  router.post("/login", authController.login);
  router.post("/logout", authController.logout);
  router.get("/me", authController.me);
  router.get("/check-admin", authenticateAdmin, authController.checkAdmin);

  return router;
};