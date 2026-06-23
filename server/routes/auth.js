import express from "express";
import { verifyToken } from "../middleware/auth.js";
import authService from "../services/authService.js";
import { asyncHandler, AppError } from "../utils/errorHandler.js";
import twoFactorState from "../utils/2faState.js";

const router = express.Router();

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const validation = authService.validateCredentials(username, password);

    if (!validation.valid) {
      throw new AppError(validation.error, 401);
    }

    // Development modunda 2FA'yı bypass et
    if (process.env.NODE_ENV === "development") {
      const token = authService.generateToken(username);
      const user = authService.getUserInfo(username);

      res.json({
        message: "Giriş başarılı (Development mode - 2FA disabled)",
        token,
        user,
        requires2FA: false,
      });
      return;
    }

    res.json({
      message: "Kullanıcı adı ve şifre doğrulandı",
      requires2FA: true,
    });
  })
);

router.post(
  "/verify-2fa",
  asyncHandler(async (req, res) => {
    const { username, password, twoFactorCode } = req.body;

    const validation = authService.validateCredentials(username, password);
    if (!validation.valid) {
      throw new AppError(validation.error, 401);
    }

    const isValid = authService.verify2FAToken(twoFactorCode);
    if (!isValid) {
      throw new AppError("Geçersiz doğrulama kodu", 401);
    }

    const token = authService.generateToken(username);
    const user = authService.getUserInfo(username);

    res.json({
      message: "Giriş başarılı",
      token,
      user,
    });
  })
);

router.post(
  "/2fa/setup",
  asyncHandler(async (req, res) => {
    if (twoFactorState.isSetupCompleted()) {
      throw new AppError(
        "2FA setup already completed. To regenerate, delete server/.2fa-state.json and restart the server.",
        403
      );
    }

    const { username, password } = req.body;

    const validation = authService.validateCredentials(username, password);
    if (!validation.valid) {
      throw new AppError("Unauthorized: Invalid credentials", 401);
    }

    const setupData = await authService.generate2FASetup(req);

    twoFactorState.markSetupCompleted(setupData.secretHash);

    const { secretHash, ...safeSetupData } = setupData;

    res.json({
      ...safeSetupData,
      message: {
        en: "2FA setup completed successfully! This endpoint is now disabled. Save your QR code immediately.",
        tr: "2FA kurulumu başarıyla tamamlandı! Bu endpoint artık devre dışı. QR kodunuzu hemen kaydedin.",
      },
      notice: {
        en: "To reset 2FA setup: Delete server/.2fa-state.json and restart the server, then regenerate ADMIN_2FA_SECRET in .env",
        tr: "2FA kurulumunu sıfırlamak için: server/.2fa-state.json dosyasını silin ve sunucuyu yeniden başlatın, ardından .env'deki ADMIN_2FA_SECRET'ı yenileyin",
      },
    });
  })
);

router.get(
  "/2fa/status",
  asyncHandler(async (req, res) => {
    const state = twoFactorState.getState();
    res.json({
      setupCompleted: state.setupCompleted,
      completedAt: state.completedAt,
      canSetup: !state.setupCompleted,
    });
  })
);

router.get("/verify", verifyToken, (req, res) => {
  res.json({
    valid: true,
    user: authService.getUserInfo(req.user.username),
  });
});

router.get("/me", verifyToken, (req, res) => {
  res.json(authService.getUserInfo(req.user.username));
});

export default router;
