
import { createScene } from "./scene.js";
import { setupControls } from "./controls.js";

const canvas = document.getElementById("application");
const loading = document.getElementById("loading");
const hint = document.getElementById("hint");

const homeScoreElement = document.getElementById("home-score");
const awayScoreElement = document.getElementById("away-score");
const clockElement = document.getElementById("match-clock");

const overlay = document.getElementById("match-overlay");
const matchMessage = document.getElementById("match-message");
const matchSubmessage = document.getElementById("match-submessage");
const restartButton = document.getElementById("restart-match");

let hintTimeout = null;
let lastHudState = "";

function formatTime(seconds) {
  const total = Math.ceil(seconds);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

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

  restartButton.addEventListener("click", () => {
    game.restartMatch();
    hint.textContent = "Pertandingan dimulai kembali!";
  });

  // One update loop only.
  game.app.on("update", (dt) => {
    game.update(dt);

    const info = game.getMatchInfo();
    const clock = formatTime(info.timeRemaining);

    const hudState = [
      info.homeScore,
      info.awayScore,
      clock,
      info.state
    ].join("|");

    if (hudState !== lastHudState) {
      homeScoreElement.textContent = info.homeScore;
      awayScoreElement.textContent = info.awayScore;
      clockElement.textContent = clock;
      lastHudState = hudState;
    }

    if (info.state === "goal") {
      matchMessage.textContent = "GOAL!";
      matchSubmessage.textContent = "Kick-off sebentar lagi";
      restartButton.classList.add("hidden");
      overlay.classList.remove("hidden");
    } else if (info.state === "finished") {
      matchMessage.textContent = "FULL TIME";
      matchSubmessage.textContent =
        `HOME ${info.homeScore} — ${info.awayScore} AWAY`;

      restartButton.classList.remove("hidden");
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
    }
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
