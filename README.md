# Mini Soccer 3D — Prototype 0.1

Prototype mini soccer 3D berbasis **PlayCanvas Engine** (via CDN), **HTML5**, **CSS3**, dan **JavaScript ES Modules** tanpa build step, dirancang untuk kontrol sentuh iPad (landscape) dan siap di-*deploy* ke **GitHub Pages**.

## Struktur Folder

```text
.
├── index.html
├── css/
│   └── style.css
└── js/
    ├── main.js
    ├── core/
    │   ├── config.js
    │   ├── game-app.js
    │   └── input-manager.js
    ├── world/
    │   ├── pitch.js
    │   ├── goal.js
    │   └── camera-rig.js
    ├── entities/
    │   ├── player.js
    │   └── ball.js
    └── ui/
        └── hud.js
```

## Cara Upload & Deploy ke GitHub Pages

1. Ekstrak file ZIP proyek ini.
2. Upload seluruh isi folder ke repository GitHub Anda (pastikan `index.html` berada di folder root repository).
3. Di GitHub, buka **Settings → Pages**.
4. Pada bagian **Build and deployment → Source**, pilih **Deploy from a branch**.
5. Pilih branch `main` (atau branch aktif Anda) dan folder `/ (root)`, lalu simpan.
6. Buka URL GitHub Pages yang dihasilkan pada iPad dalam orientasi **landscape**.
