class PollingService {
  constructor() {
    this.intervalId = null;
    this.currentInterval = 5000;
    this.attemptCount = 0;
    this.isPaused = false;
    this.callback = null;

    this.intervals = [5000, 10000, 15000, 20000, 30000];
    this.maxAttempts = 20;
  }

  start(callback) {
    if (this.intervalId) {
      this.stop();
    }

    this.callback = callback;
    this.attemptCount = 0;
    this.currentInterval = this.intervals[0];
    this.isPaused = false;

    this._poll();
    this._setupInterval();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.attemptCount = 0;
    this.isPaused = false;
    this.callback = null;
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPaused = true;
  }

  resume() {
    if (this.isPaused && this.callback) {
      this.isPaused = false;
      this._setupInterval();
    }
  }

  reset() {
    this.attemptCount = 0;
    this.currentInterval = this.intervals[0];
    if (!this.isPaused && this.callback) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      this._setupInterval();
    }
  }

  async _poll() {
    if (this.callback && !this.isPaused) {
      try {
        await this.callback();
      } catch (error) {
        console.error("Polling error:", error);
      }
    }
  }

  _setupInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.attemptCount++;

      if (this.attemptCount >= this.maxAttempts) {
        console.log("Max polling attempts reached, stopping...");
        this.stop();
        return;
      }

      const intervalIndex = Math.min(
        Math.floor(this.attemptCount / 5),
        this.intervals.length - 1
      );
      const newInterval = this.intervals[intervalIndex];

      if (newInterval !== this.currentInterval) {
        this.currentInterval = newInterval;
        this._setupInterval();
        return;
      }

      this._poll();
    }, this.currentInterval);
  }

  isActive() {
    return this.intervalId !== null;
  }

  getState() {
    return {
      isActive: this.isActive(),
      isPaused: this.isPaused,
      attemptCount: this.attemptCount,
      currentInterval: this.currentInterval,
    };
  }
}

export default PollingService;
