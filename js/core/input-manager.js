export class InputManager {
  constructor(options = {}) {
    this.joystickZone = options.joystickZone;
    this.joystickKnob = options.joystickKnob;
    this.sprintBtn = options.sprintBtn;
    this.shootBtn = options.shootBtn;
    this.onShootPressed = options.onShootPressed || (() => {});

    this.moveVector = { x: 0, y: 0 };
    this.isSprinting = false;
    this.isShootingHeld = false;

    this._keys = new Set();

    this._joystickPointerId = null;
    this._sprintPointerId = null;
    this._shootPointerId = null;
    this._joystickCenter = { x: 0, y: 0 };
    this._maxRadius = 44;

    this._bindEvents();
  }

  _bindEvents() {
    if (this.joystickZone) {
      this.joystickZone.addEventListener("pointerdown", this._onJoystickDown, { passive: false });
      window.addEventListener("pointermove", this._onJoystickMove, { passive: false });
      window.addEventListener("pointerup", this._onJoystickUp, { passive: false });
      window.addEventListener("pointercancel", this._onJoystickUp, { passive: false });
    }

    if (this.sprintBtn) {
      this.sprintBtn.addEventListener("pointerdown", this._onSprintDown, { passive: false });
      window.addEventListener("pointerup", this._onSprintUp, { passive: false });
      window.addEventListener("pointercancel", this._onSprintUp, { passive: false });
    }

    if (this.shootBtn) {
      this.shootBtn.addEventListener("pointerdown", this._onShootDown, { passive: false });
      window.addEventListener("pointerup", this._onShootUp, { passive: false });
      window.addEventListener("pointercancel", this._onShootUp, { passive: false });
    }

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
    window.addEventListener("blur", this._resetAll);
  }

  _onJoystickDown = (e) => {
    if (this._joystickPointerId !== null) return;
    e.preventDefault();
    this._joystickPointerId = e.pointerId;

    const rect = this.joystickZone.getBoundingClientRect();
    this._joystickCenter.x = rect.left + rect.width / 2;
    this._joystickCenter.y = rect.top + rect.height / 2;
    this._maxRadius = Math.max(28, rect.width * 0.31);

    this.joystickZone.classList.add("active");
    this._updateJoystickFromPoint(e.clientX, e.clientY);
  };

  _onJoystickMove = (e) => {
    if (e.pointerId !== this._joystickPointerId) return;
    e.preventDefault();
    this._updateJoystickFromPoint(e.clientX, e.clientY);
  };

  _onJoystickUp = (e) => {
    if (e.pointerId !== this._joystickPointerId) return;
    e.preventDefault();
    this._joystickPointerId = null;
    this.joystickZone.classList.remove("active");
    this.moveVector.x = 0;
    this.moveVector.y = 0;
    this._setKnobPosition(0, 0);
  };

  _updateJoystickFromPoint(clientX, clientY) {
    let dx = clientX - this._joystickCenter.x;
    let dy = clientY - this._joystickCenter.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this._maxRadius && dist > 0) {
      dx = (dx / dist) * this._maxRadius;
      dy = (dy / dist) * this._maxRadius;
    }

    this._setKnobPosition(dx, dy);

    const nx = dx / this._maxRadius;
    const ny = -dy / this._maxRadius;
    const mag = Math.hypot(nx, ny);

    if (mag < 0.12) {
      this.moveVector.x = 0;
      this.moveVector.y = 0;
    } else {
      const clampedMag = Math.min(1, mag);
      this.moveVector.x = (nx / mag) * clampedMag;
      this.moveVector.y = (ny / mag) * clampedMag;
    }
  }

  _setKnobPosition(dx, dy) {
    if (!this.joystickKnob) return;
    this.joystickKnob.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
  }

  _onSprintDown = (e) => {
    if (this._sprintPointerId !== null) return;
    e.preventDefault();
    this._sprintPointerId = e.pointerId;
    this.isSprinting = true;
    this.sprintBtn.classList.add("active");
  };

  _onSprintUp = (e) => {
    if (e.pointerId !== this._sprintPointerId) return;
    e.preventDefault();
    this._sprintPointerId = null;
    this.isSprinting = false;
    this.sprintBtn.classList.remove("active");
  };

  _onShootDown = (e) => {
    if (this._shootPointerId !== null) return;
    e.preventDefault();
    this._shootPointerId = e.pointerId;
    this.isShootingHeld = true;
    this.shootBtn.classList.add("active");
    this.onShootPressed();
  };

  _onShootUp = (e) => {
    if (e.pointerId !== this._shootPointerId) return;
    e.preventDefault();
    this._shootPointerId = null;
    this.isShootingHeld = false;
    this.shootBtn.classList.remove("active");
  };

  _onKeyDown = (e) => {
    const code = e.code;
    this._keys.add(code);
    if (code === "ShiftLeft" || code === "ShiftRight") {
      this.isSprinting = true;
      if (this.sprintBtn) this.sprintBtn.classList.add("active");
    }
    if (code === "Space" || code === "KeyJ" || code === "KeyK") {
      if (!this.isShootingHeld) {
        this.isShootingHeld = true;
        if (this.shootBtn) this.shootBtn.classList.add("active");
        this.onShootPressed();
      }
    }
    this._syncKeyboardMove();
  };

  _onKeyUp = (e) => {
    const code = e.code;
    this._keys.delete(code);
    if (code === "ShiftLeft" || code === "ShiftRight") {
      this.isSprinting = false;
      if (this.sprintBtn) this.sprintBtn.classList.remove("active");
    }
    if (code === "Space" || code === "KeyJ" || code === "KeyK") {
      this.isShootingHeld = false;
      if (this.shootBtn) this.shootBtn.classList.remove("active");
    }
    this._syncKeyboardMove();
  };

  _syncKeyboardMove() {
    if (this._joystickPointerId !== null) return;
    let x = 0;
    let y = 0;
    if (this._keys.has("KeyA") || this._keys.has("ArrowLeft")) x -= 1;
    if (this._keys.has("KeyD") || this._keys.has("ArrowRight")) x += 1;
    if (this._keys.has("KeyW") || this._keys.has("ArrowUp")) y += 1;
    if (this._keys.has("KeyS") || this._keys.has("ArrowDown")) y -= 1;

    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.SQRT2;
      x *= inv;
      y *= inv;
    }
    this.moveVector.x = x;
    this.moveVector.y = y;
  }

  _resetAll = () => {
    this._keys.clear();
    this._joystickPointerId = null;
    this._sprintPointerId = null;
    this._shootPointerId = null;
    this.moveVector.x = 0;
    this.moveVector.y = 0;
    this.isSprinting = false;
    this.isShootingHeld = false;
    this._setKnobPosition(0, 0);
    if (this.joystickZone) this.joystickZone.classList.remove("active");
    if (this.sprintBtn) this.sprintBtn.classList.remove("active");
    if (this.shootBtn) this.shootBtn.classList.remove("active");
  };

  destroy() {
    window.removeEventListener("pointermove", this._onJoystickMove);
    window.removeEventListener("pointerup", this._onJoystickUp);
    window.removeEventListener("pointercancel", this._onJoystickUp);
    window.removeEventListener("pointerup", this._onSprintUp);
    window.removeEventListener("pointercancel", this._onSprintUp);
    window.removeEventListener("pointerup", this._onShootUp);
    window.removeEventListener("pointercancel", this._onShootUp);
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    window.removeEventListener("blur", this._resetAll);
  }
}
