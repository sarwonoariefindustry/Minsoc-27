export function setupControls({ onMove, onSprint, onKick }) {
  const joystick = document.getElementById("joystick");
  const stick = document.getElementById("stick");
  const sprintButton = document.getElementById("sprint");
  const kickButton = document.getElementById("kick");
  const keys = new Set();
  let pointerId = null;
  let sprinting = false;

  function updateKeys() {
    let x = 0, z = 0;
    if (keys.has("ArrowLeft") || keys.has("a")) x -= 1;
    if (keys.has("ArrowRight") || keys.has("d")) x += 1;
    if (keys.has("ArrowUp") || keys.has("w")) z -= 1;
    if (keys.has("ArrowDown") || keys.has("s")) z += 1;
    onMove(x, z);
  }
  function keyDown(e) {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(key)) e.preventDefault();
    keys.add(key);
    if (key === " " || key === "j") onKick();
    if (key === "Shift") onSprint(true);
    updateKeys();
  }
  function keyUp(e) {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys.delete(key);
    if (key === "Shift") onSprint(false);
    updateKeys();
  }
  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);

  function moveStick(e) {
    const rect = joystick.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const max = rect.width * 0.34;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const len = Math.hypot(dx, dy);
    const scale = len > max ? max / len : 1;
    const sx = dx * scale, sy = dy * scale;
    stick.style.transform = `translate(${sx}px, ${sy}px)`;
    onMove(sx / max, sy / max);
  }
  function pointerDown(e) {
    e.preventDefault();
    pointerId = e.pointerId;
    joystick.setPointerCapture(pointerId);
    moveStick(e);
  }
  function pointerMove(e) {
    if (e.pointerId === pointerId) moveStick(e);
  }
  function pointerUp(e) {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    stick.style.transform = "translate(0, 0)";
    onMove(0, 0);
  }
  joystick.addEventListener("pointerdown", pointerDown);
  joystick.addEventListener("pointermove", pointerMove);
  joystick.addEventListener("pointerup", pointerUp);
  joystick.addEventListener("pointercancel", pointerUp);

  function sprintStart(e) { e.preventDefault(); sprinting = true; onSprint(true); }
  function sprintEnd() { sprinting = false; onSprint(false); }
  sprintButton.addEventListener("pointerdown", sprintStart);
  sprintButton.addEventListener("pointerup", sprintEnd);
  sprintButton.addEventListener("pointercancel", sprintEnd);
  sprintButton.addEventListener("pointerleave", sprintEnd);
  kickButton.addEventListener("pointerdown", (e) => { e.preventDefault(); onKick(); });

  return {
    destroy() {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      joystick.removeEventListener("pointerdown", pointerDown);
      joystick.removeEventListener("pointermove", pointerMove);
      joystick.removeEventListener("pointerup", pointerUp);
      joystick.removeEventListener("pointercancel", pointerUp);
      sprintButton.removeEventListener("pointerdown", sprintStart);
      sprintButton.removeEventListener("pointerup", sprintEnd);
      sprintButton.removeEventListener("pointercancel", sprintEnd);
      sprintButton.removeEventListener("pointerleave", sprintEnd);
    }
  };
}
