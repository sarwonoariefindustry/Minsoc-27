import { MiniSoccerApp } from "./core/game-app.js";

function boot() {
  const canvas = document.getElementById("application-canvas");
  if (!canvas) {
    console.error("Canvas #application-canvas tidak ditemukan.");
    return;
  }

  try {
    const game = new MiniSoccerApp(canvas);
    window.__MINI_SOCCER__ = game;
  } catch (err) {
    console.error("Gagal menjalankan Mini Soccer Prototype:", err);
    const toast = document.getElementById("status-toast");
    if (toast) {
      toast.textContent = "Terjadi kesalahan saat memuat engine 3D.";
      toast.classList.remove("hidden");
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
