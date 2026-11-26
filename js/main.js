import { createScene } from "./scene.js";
import { setupControls } from "./controls.js";

const canvas = document.getElementById("application");
const loading = document.getElementById("loading");
const hint = document.getElementById("hint");

try {
  const game = await createScene(canvas);
  const controls = setupControls({
    onMove: (x, z) => game.setMovement(x, z),
    onSprint: (active) => game.setSprint(active),
    onKick: () => {
      const kicked = game.kick();
      hint.textContent = kicked ? "Tendangan dilakukan!" : "Dekati bola untuk menendang.";
      if (kicked) {
        setTimeout(() => { hint.textContent = "Gerakkan pemain untuk mendekati bola"; }, 1400);
      }
    }
  });

  document.getElementById("reset").addEventListener("click", () => {
    game.resetBall();
    hint.textContent = "Bola dikembalikan ke tengah";
  });

  game.app.on("update", (dt) => {
    game.update(dt);
  });

  loading.classList.add("hidden");
  setTimeout(() => loading.remove(), 400);

  window.addEventListener("pagehide", () => {
    controls.destroy();
    game.app.destroy();
  }, { once: true });
} catch (error) {
  console.error(error);
  loading.textContent = "Gagal memuat 3D. Periksa koneksi internet lalu muat ulang.";
  hint.textContent = "Pastikan Safari mengizinkan konten WebGL.";
}
