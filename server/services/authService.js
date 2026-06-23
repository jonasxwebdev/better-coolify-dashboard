import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";

class AuthService {
  validateCredentials(username, password) {
    if (!username || !password) {
      return {
        valid: false,
        error: "Kullanıcı adı ve şifre zorunludur",
      };
    }

    if (
      username.toLowerCase() !== process.env.ADMIN_USERNAME.toLowerCase() ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return {
        valid: false,
        error: "Geçersiz kullanıcı adı veya şifre",
      };
    }

    return { valid: true };
  }

  generateToken(username) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET yapılandırılmamış");
    }

    return jwt.sign({ username }, jwtSecret, {
      expiresIn: "24h",
    });
  }

  verifyToken(token) {
    if (!token) {
      throw new Error("Token zorunludur");
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET yapılandırılmamış");
    }

    try {
      return jwt.verify(token, jwtSecret);
    } catch (_error) {
      throw new Error("Geçersiz veya süresi dolmuş token");
    }
  }

  getUserInfo(username) {
    return {
      username,
    };
  }

  verify2FAToken(token) {
    const secret = process.env.ADMIN_2FA_SECRET;
    if (!secret) {
      throw new Error("2FA secret yapılandırılmamış");
    }

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: token,
      window: 2,
    });

    return verified;
  }

  async generate2FASetup(req) {
    const secret = process.env.ADMIN_2FA_SECRET;
    const username = process.env.ADMIN_USERNAME;

    if (!secret) {
      throw new Error("2FA secret yapılandırılmamış");
    }

    const protocol = req.protocol;
    const host = req.get("host");
    const logoUrl = `${protocol}://${host}/public/logo.svg`;

    let otpauthUrl = speakeasy.otpauthURL({
      secret: secret,
      label: `Coolify Dashboard (${username})`,
      issuer: "Coolify Dashboard",
      encoding: "base32",
    });

    otpauthUrl += `&image=${encodeURIComponent(logoUrl)}`;

    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);

    const secretHash = crypto
      .createHash("sha256")
      .update(secret)
      .digest("hex")
      .substring(0, 16);

    return {
      secret: secret,
      qrCode: qrCodeDataURL,
      otpauthUrl: otpauthUrl,
      secretHash: secretHash,
    };
  }
}

export default new AuthService();
