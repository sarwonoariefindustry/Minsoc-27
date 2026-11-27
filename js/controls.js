
export function setupControls({
  onMove,
  onCamera,
  onSprint,
  onPass,
  onThroughPass,
  onShoot
}) {
  const joystick = document.getElementById("joystick");
  const stick = document.getElementById("stick");
  const sprintButton = document.getElementById("sprint");
  const passButton = document.getElementById("pass");
  const throughButton = document.getElementById("through");
  const shootButton = document.getElementById("shoot");
  const canvas = document.getElementById("application");

  const keys = new Set();

  let movePointerId = null;
  let cameraPointerId = null;

  let lastCameraX = 0;
  let lastCameraY = 0;

  let keyboardSprint = false;
  let touchSprint = false;

  function updateKeys() {
    let x = 0;
    let z = 0;

    if (keys.has("ArrowLeft") || keys.has("a")) x -= 1;
    if (keys.has("ArrowRight") || keys.has("d")) x += 1;
    if (keys.has("ArrowUp") || keys.has("w")) z -= 1;
    if (keys.has("ArrowDown") || keys.has("s")) z += 1;

    onMove(x, z);
  }

  function updateSprint() {
    onSprint(keyboardSprint || touchSprint);
  }

  function keyDown(e) {
    const key = e.key.length === 1
      ? e.key.toLowerCase()
      : e.key;

    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "]
        .includes(key)
    ) {
      e.preventDefault();
    }

    if (keys.has(key)) return;
    keys.add(key);

    if (key === "k") onPass();
    if (key === "l") onThroughPass();
    if (key === " " || key === "j") onShoot();

    if (key === "Shift") {
      keyboardSprint = true;
      updateSprint();
    }

    updateKeys();
  }

  function keyUp(e) {
    const key = e.key.length === 1
      ? e.key.toLowerCase()
      : e.key;

    keys.delete(key);

    if (key === "Shift") {
      keyboardSprint = false;
      updateSprint();
    }

    updateKeys();
  }

  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);

  // MOBILE JOYSTICK
  function moveStick(e) {
    const rect = joystick.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const max = rect.width * 0.34;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const length = Math.hypot(dx, dy);
    const scale = length > max ? max / length : 1;

    const sx = dx * scale;
    const sy = dy * scale;

    stick.style.transform = `translate(${sx}px, ${sy}px)`;
    onMove(sx / max, sy / max);
  }

  function joystickDown(e) {
    e.preventDefault();
    if (movePointerId !== null) return;

    movePointerId = e.pointerId;
    joystick.setPointerCapture(e.pointerId);
    moveStick(e);
  }

  function joystickMove(e) {
    if (e.pointerId !== movePointerId) return;
    moveStick(e);
  }

  function joystickUp(e) {
    if (e.pointerId !== movePointerId) return;

    movePointerId = null;
    stick.style.transform = "translate(0, 0)";
    updateKeys();
  }

  joystick.addEventListener("pointerdown", joystickDown);
  joystick.addEventListener("pointermove", joystickMove);
  joystick.addEventListener("pointerup", joystickUp);
  joystick.addEventListener("pointercancel", joystickUp);

  // FREE CAMERA DRAG
  function cameraDown(e) {
    // Action buttons and match overlay must not rotate the camera.
    if (e.target.closest(".action, .reset, .match-overlay")) return;

    if (e.clientX < window.innerWidth * 0.42) return;
    if (cameraPointerId !== null) return;

    if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 2) {
      return;
    }

    e.preventDefault();

    cameraPointerId = e.pointerId;
    lastCameraX = e.clientX;
    lastCameraY = e.clientY;

    canvas.setPointerCapture(e.pointerId);
  }

  function cameraMove(e) {
    if (e.pointerId !== cameraPointerId) return;

    const dx = e.clientX - lastCameraX;
    const dy = e.clientY - lastCameraY;

    lastCameraX = e.clientX;
    lastCameraY = e.clientY;

    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;

    onCamera(dx, dy);
  }

  function cameraUp(e) {
    if (e.pointerId !== cameraPointerId) return;
    cameraPointerId = null;
  }

  canvas.addEventListener("pointerdown", cameraDown);
  canvas.addEventListener("pointermove", cameraMove);
  canvas.addEventListener("pointerup", cameraUp);
  canvas.addEventListener("pointercancel", cameraUp);

  function preventContextMenu(e) {
    e.preventDefault();
  }

  canvas.addEventListener("contextmenu", preventContextMenu);

  // SPRINT BUTTON
  function sprintStart(e) {
    e.preventDefault();
    e.stopPropagation();

    touchSprint = true;

    if (sprintButton.setPointerCapture) {
      sprintButton.setPointerCapture(e.pointerId);
    }

    updateSprint();
  }

  function sprintEnd() {
    touchSprint = false;
    updateSprint();
  }

  sprintButton.addEventListener("pointerdown", sprintStart);
  sprintButton.addEventListener("pointerup", sprintEnd);
  sprintButton.addEventListener("pointercancel", sprintEnd);
  sprintButton.addEventListener("pointerleave", sprintEnd);

  // ACTION BUTTONS
  function bindAction(button, callback) {
    function start(e) {
      e.preventDefault();
      e.stopPropagation();
      callback();
    }

    button.addEventListener("pointerdown", start);

    return () => {
      button.removeEventListener("pointerdown", start);
    };
  }

  const unbindPass = bindAction(passButton, onPass);
  const unbindThrough = bindAction(throughButton, onThroughPass);
  const unbindShoot = bindAction(shootButton, onShoot);

  // CLEANUP
  return {
    destroy() {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);

      joystick.removeEventListener("pointerdown", joystickDown);
      joystick.removeEventListener("pointermove", joystickMove);
      joystick.removeEventListener("pointerup", joystickUp);
      joystick.removeEventListener("pointercancel", joystickUp);

      canvas.removeEventListener("pointerdown", cameraDown);
      canvas.removeEventListener("pointermove", cameraMove);
      canvas.removeEventListener("pointerup", cameraUp);
      canvas.removeEventListener("pointercancel", cameraUp);
      canvas.removeEventListener("contextmenu", preventContextMenu);

      sprintButton.removeEventListener("pointerdown", sprintStart);
      sprintButton.removeEventListener("pointerup", sprintEnd);
      sprintButton.removeEventListener("pointercancel", sprintEnd);
      sprintButton.removeEventListener("pointerleave", sprintEnd);

      unbindPass();
      unbindThrough();
      unbindShoot();
    }
  };
}
