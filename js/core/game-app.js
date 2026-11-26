import * as pc from "playcanvas";
import { GAME_CONFIG } from "./config.js";
import { Pitch } from "../world/pitch.js";
import { Goal } from "../world/goal.js";
import { Player } from "../entities/player.js";
import { Ball } from "../entities/ball.js";
import { CameraRig } from "../world/camera-rig.js";
import { InputManager } from "./input-manager.js";
import { HudController } from "../ui/hud.js";

export class MiniSoccerApp {
  constructor(canvas) {
    this.canvas = canvas;
    this.app = new pc.Application(this.canvas, {
      mouse: new pc.Mouse(this.canvas),
      touch: new pc.TouchDevice(this.canvas)
    });

    this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    this.app.setCanvasResolution(pc.RESOLUTION_AUTO);

    this.app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    this._goalScoredLock = false;
    this._goalResetTimer = 0;

    this._setupLighting();
    this._setupWorldAndEntities();
    this._setupInputAndHud();
    this._bindResize();
    this._startLoop();
  }

  _setupLighting() {
    this.app.scene.ambientLight = new pc.Color(0.45, 0.48, 0.52, 1);

    const sun = new pc.Entity("DirectionalSun");
    sun.addComponent("light", {
      type: "directional",
      color: new pc.Color(1, 0.98, 0.94, 1),
      intensity: 1.45,
      castShadows: false
    });
    sun.setEulerAngles(48, 32, 0);
    this.app.root.addChild(sun);
  }

  _setupWorldAndEntities() {
    this.pitch = new Pitch(this.app, GAME_CONFIG.pitch);
    this.goal = new Goal(this.app, GAME_CONFIG.goal);
    const goalBounds = this.goal.getBounds();

    this.ball = new Ball(this.app, GAME_CONFIG.ball, GAME_CONFIG.pitch, goalBounds);
    this.player = new Player(this.app, GAME_CONFIG.player, GAME_CONFIG.pitch);
    this.cameraRig = new CameraRig(this.app, GAME_CONFIG.camera);

    this.cameraRig.snapToTarget(this.player.getPosition(), this.ball.getPosition());
  }

  _setupInputAndHud() {
    this.hud = new HudController({
      goalCountEl: document.getElementById("goal-count"),
      shotCountEl: document.getElementById("shot-count"),
      resetBtn: document.getElementById("btn-reset"),
      goalBannerEl: document.getElementById("goal-banner"),
      statusToastEl: document.getElementById("status-toast"),
      onReset: () => this.resetPositions()
    });

    this.input = new InputManager({
      joystickZone: document.getElementById("joystick-zone"),
      joystickKnob: document.getElementById("joystick-knob"),
      sprintBtn: document.getElementById("btn-sprint"),
      shootBtn: document.getElementById("btn-shoot"),
      onShootPressed: () => this._handleShoot()
    });
  }

  _handleShoot() {
    if (this._goalScoredLock) return;
    const kicked = this.player.tryKickBall(this.ball);
    if (kicked) {
      this.hud.incrementShots();
    }
  }

  resetPositions() {
    this._goalScoredLock = false;
    this._goalResetTimer = 0;
    this.player.reset();
    this.ball.reset();
    this.cameraRig.snapToTarget(this.player.getPosition(), this.ball.getPosition());
    this.hud.showToast("Posisi direset", 1200);
  }

  _bindResize() {
    const handleResize = () => {
      this.app.resizeCanvas();
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", () => {
      setTimeout(handleResize, 120);
    });
  }

  _startLoop() {
    this.app.start();

    this.app.on("update", (dt) => {
      const clampedDt = Math.min(dt, 0.05);

      if (this._goalScoredLock) {
        this._goalResetTimer -= clampedDt;
        this.ball.update(clampedDt);
        this.cameraRig.update(clampedDt, this.player.getPosition(), this.ball.getPosition());
        if (this._goalResetTimer <= 0) {
          this._goalScoredLock = false;
          this.player.reset();
          this.ball.reset();
          this.cameraRig.snapToTarget(this.player.getPosition(), this.ball.getPosition());
        }
        return;
      }

      this.player.update(
        clampedDt,
        this.input.moveVector,
        this.input.isSprinting,
        this.ball
      );
      this.ball.update(clampedDt);
      this.cameraRig.update(clampedDt, this.player.getPosition(), this.ball.getPosition());

      if (this.ball.isInsideGoal()) {
        this._goalScoredLock = true;
        this._goalResetTimer = 1.6;
        this.hud.incrementGoals();
      }
    });
  }
}
