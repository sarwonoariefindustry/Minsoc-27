export class HudController {
  constructor(elements = {}) {
    this.goalCountEl = elements.goalCountEl;
    this.shotCountEl = elements.shotCountEl;
    this.resetBtn = elements.resetBtn;
    this.goalBannerEl = elements.goalBannerEl;
    this.statusToastEl = elements.statusToastEl;

    this.goals = 0;
    this.shots = 0;
    this._bannerTimeout = null;
    this._toastTimeout = null;

    if (this.resetBtn && elements.onReset) {
      this.resetBtn.addEventListener("click", elements.onReset);
    }
  }

  incrementShots() {
    this.shots += 1;
    if (this.shotCountEl) {
      this.shotCountEl.textContent = String(this.shots);
    }
  }

  incrementGoals() {
    this.goals += 1;
    if (this.goalCountEl) {
      this.goalCountEl.textContent = String(this.goals);
    }
    this.showGoalBanner();
  }

  resetStats() {
    this.goals = 0;
    this.shots = 0;
    if (this.goalCountEl) this.goalCountEl.textContent = "0";
    if (this.shotCountEl) this.shotCountEl.textContent = "0";
  }

  showGoalBanner(durationMs = 1400) {
    if (!this.goalBannerEl) return;
    this.goalBannerEl.classList.remove("hidden");
    if (this._bannerTimeout) clearTimeout(this._bannerTimeout);
    this._bannerTimeout = setTimeout(() => {
      this.goalBannerEl.classList.add("hidden");
    }, durationMs);
  }

  showToast(message, durationMs = 2400) {
    if (!this.statusToastEl) return;
    this.statusToastEl.textContent = message;
    this.statusToastEl.classList.remove("hidden");
    if (this._toastTimeout) clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      this.statusToastEl.classList.add("hidden");
    }, durationMs);
  }
}
