import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATE_FILE = path.join(__dirname, "../.2fa-state.json");

class TwoFactorState {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = fs.readFileSync(STATE_FILE, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn("Could not load 2FA state, using defaults:", error.message);
    }

    return {
      setupCompleted: false,
      completedAt: null,
      secretHash: null,
    };
  }

  saveState() {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error("Could not save 2FA state:", error.message);
    }
  }

  isSetupCompleted() {
    return this.state.setupCompleted === true;
  }

  markSetupCompleted(secretHash) {
    this.state.setupCompleted = true;
    this.state.completedAt = new Date().toISOString();
    this.state.secretHash = secretHash;
    this.saveState();
  }

  getState() {
    return { ...this.state };
  }
}

export default new TwoFactorState();
