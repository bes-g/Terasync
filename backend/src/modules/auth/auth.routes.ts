import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticateJwt } from "./auth.middleware.js";

const router: Router = Router();

router.post("/signup", (req, res, next) => authController.signup(req, res, next));
router.post("/verify-email", (req, res, next) => authController.verifyEmail(req, res, next));
router.post("/login", (req, res, next) => authController.login(req, res, next));
router.post("/login/verify", (req, res, next) => authController.verifyLogin(req, res, next));
router.post("/password/forgot", (req, res, next) => authController.forgotPassword(req, res, next));
router.post("/password/reset", (req, res, next) => authController.resetPassword(req, res, next));
router.post("/code/resend", (req, res, next) => authController.resendCode(req, res, next));
router.post("/refresh", (req, res, next) => authController.refreshToken(req, res, next));
router.post("/logout", (req, res, next) => authController.logout(req, res, next));
router.get("/me", authenticateJwt, (req, res, next) => authController.getMe(req, res, next));

export { router as authRouter };