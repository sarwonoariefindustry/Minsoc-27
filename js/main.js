
import { createScene } from "./scene.js";
import { setupControls } from "./controls.js";

const canvas = document.getElementById("application");
const loading = document.getElementById("loading");
const hint = document.getElementById("hint");

let hintTimeout = null;

try {
  const game = await createScene(canvas);

  function showActionHint(success, actionName) {
    if (hintTimeout) clearTimeout(hintTimeout);

    hint.textContent = success
      ? `${actionName} berhasil!`
      : "Dekati bola untuk melakukan aksi.";

    if (success) {
      hintTimeout = setTimeout(() => {
        hint.textContent =
          "Joystick kiri: bergerak | Geser kanan: kamera";
      }, 1200);
    }
  }

  const controls = setupControls({
    onMove: (x, z) => {
      game.setMovement(x, z);
    },

    onCamera: (dx, dy) => {
      game.setCameraInput(dx, dy);
    },

    onSprint: (active) => {
      game.setSprint(active);
    },

    onPass: () => {
      showActionHint(game.pass(), "PASS");
    },

    onThroughPass: () => {
      showActionHint(game.throughPass(), "THROUGH PASS");
    },

    onShoot: () => {
      showActionHint(game.shoot(), "SHOOT");
    }
  });

  document.getElementById("reset").addEventListener("click", () => {
    game.resetBall();
    hint.textContent = "Bola dikembalikan ke tengah";
  });

  // One update loop only.
  game.app.on("update", (dt) => {
    game.update(dt);
  });

  loading.classList.add("hidden");

  setTimeout(() => {
    loading.remove();
  }, 400);

  window.addEventListener(
    "pagehide",
    () => {
      controls.destroy();
      game.app.destroy();

      if (hintTimeout) clearTimeout(hintTimeout);
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
