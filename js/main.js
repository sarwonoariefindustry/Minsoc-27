
import { createScene } from "./scene.js";
import { setupControls } from "./controls.js";

const canvas = document.getElementById("application");
const loading = document.getElementById("loading");
const hint = document.getElementById("hint");

let hintTimeout = null;

try {
  const game = await createScene(canvas);

  const controls = setupControls({
    // Player movement
    onMove: (x, z) => {
      game.setMovement(x, z);
    },

    // Free camera rotation
    onCamera: (dx, dy) => {
      game.setCameraInput(dx, dy);
    },

    // Sprint
    onSprint: (active) => {
      game.setSprint(active);
    },

    // Kick
    onKick: () => {
      const kicked = game.kick();

      if (hintTimeout) {
        clearTimeout(hintTimeout);
      }

      hint.textContent = kicked
        ? "Tendangan dilakukan!"
        : "Dekati bola untuk menendang.";

      if (kicked) {
        hintTimeout = setTimeout(() => {
          hint.textContent =
            "Joystick kiri: bergerak | Geser kanan: kamera";
        }, 1400);
      }
    }
  });

  // Reset ball
  document.getElementById("reset").addEventListener(
    "click",
    () => {
      game.resetBall();

      hint.textContent = "Bola dikembalikan ke tengah";
    }
  );

  // One update loop only.
  game.app.on("update", (dt) => {
    game.update(dt);
  });

  loading.classList.add("hidden");

  setTimeout(() => {
    loading.remove();
  }, 400);

  // Cleanup
  window.addEventListener(
    "pagehide",
    () => {
      controls.destroy();
      game.app.destroy();

      if (hintTimeout) {
        clearTimeout(hintTimeout);
      }
    },
    { once: true }
  );

} catch (error) {
  console.error(error);

  loading.textContent =
    "Gagal memuat 3D. Periksa koneksi internet lalu muat ulang.";

  hint.textContent =
    "Pastikan Safari mengizinkan konten WebGL.";
}
