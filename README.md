# Mini Soccer Prototype 0.1

Prototype 3D browser game for iPad and desktop. Built with PlayCanvas Engine, HTML, CSS and JavaScript ES modules. No build step is required.

## Features
- 3D mini soccer pitch, player, ball and goal
- Third-person follow camera
- Touch joystick, sprint and kick buttons
- Keyboard controls: WASD / arrow keys, Shift to sprint, Space or J to kick
- Responsive landscape-first HUD
- Simple local ball movement and friction

## Run on GitHub Pages
1. Upload the **contents** of this folder to the root of your repository. `index.html` must be in the repository root.
2. Open repository **Settings → Pages**.
3. Under Build and deployment, choose **Deploy from a branch**.
4. Select branch `main` and folder `/(root)`, then Save.
5. Open `https://YOUR-USERNAME.github.io/mini-soccer-prototype/`.

## Important
- Internet access is required because PlayCanvas Engine is loaded from jsDelivr CDN.
- GitHub Pages serves static files only. This prototype is single-player/local and does not include online multiplayer yet.
- This is an initial gameplay prototype. 3D art, player animation, realistic physics, sound, AI teammates and multiplayer are planned for later versions.
- If the page is blank, check Safari's WebGL support and reload after confirming internet access.

## Project structure
```text
mini-soccer-prototype/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── scene.js
│   └── controls.js
├── assets/
│   ├── models/
│   ├── textures/
│   └── audio/
└── README.md
```
