import * as pc from "playcanvas";

const FIELD_W = 18;
const FIELD_L = 28;

function material(color, options = {}) {
  const m = new pc.StandardMaterial();
  m.diffuse = new pc.Color(color[0], color[1], color[2]);
  m.metalness = options.metalness ?? 0;
  m.gloss = options.gloss ?? 0.25;
  m.update();
  return m;
}

function box(app, name, position, scale, mat) {
  const e = new pc.Entity(name);
  e.addComponent("render", { type: "box", material: mat });
  e.setLocalPosition(...position);
  e.setLocalScale(...scale);
  app.root.addChild(e);
  return e;
}

function sphere(app, name, position, radius, mat) {
  const e = new pc.Entity(name);
  e.addComponent("render", { type: "sphere", material: mat });
  e.setLocalPosition(...position);
  e.setLocalScale(radius * 2, radius * 2, radius * 2);
  app.root.addChild(e);
  return e;
}

export async function createScene(canvas) {
  const app = new pc.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    touch: new pc.TouchDevice(canvas),
    keyboard: new pc.Keyboard(window)
  });
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);
  app.scene.ambientLight = new pc.Color(0.48, 0.55, 0.48);
  app.start();

  const grassA = material([0.10, 0.34, 0.19]);
  const grassB = material([0.12, 0.39, 0.21]);
  const lineMat = material([0.88, 0.94, 0.88]);
  const darkMat = material([0.035, 0.075, 0.06]);
  const playerMat = material([0.82, 0.88, 0.92], { gloss: 0.5 });
  const shortsMat = material([0.055, 0.10, 0.14]);
  const ballMat = material([0.96, 0.96, 0.91], { gloss: 0.65 });
  const accentMat = material([0.72, 0.95, 0.23]);

  // Stadium floor and alternating grass strips.
  box(app, "field-base", [0, -0.22, 0], [FIELD_W, 0.4, FIELD_L], grassA);
  for (let i = 0; i < 7; i++) {
    box(app, `grass-stripe-${i}`, [0, -0.008, -12 + i * 4], [FIELD_W - 0.15, 0.018, 2], grassB);
  }
  // White markings as thin boxes.
  box(app, "touchline-left", [-FIELD_W / 2 + 0.12, 0.015, 0], [0.12, 0.025, FIELD_L - 0.2], lineMat);
  box(app, "touchline-right", [FIELD_W / 2 - 0.12, 0.015, 0], [0.12, 0.025, FIELD_L - 0.2], lineMat);
  box(app, "goal-line-far", [0, 0.015, -FIELD_L / 2 + 0.12], [FIELD_W - 0.2, 0.025, 0.12], lineMat);
  box(app, "goal-line-near", [0, 0.015, FIELD_L / 2 - 0.12], [FIELD_W - 0.2, 0.025, 0.12], lineMat);
  box(app, "halfway-line", [0, 0.018, 0], [FIELD_W - 0.25, 0.025, 0.09], lineMat);
  // Center circle approximation using thin segmented bars.
  const segments = 48;
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const b = ((i + 1) / segments) * Math.PI * 2;
    const x = Math.cos(a) * 2.2, z = Math.sin(a) * 2.2;
    const dx = Math.cos(b) * 2.2 - x, dz = Math.sin(b) * 2.2 - z;
    const seg = box(app, `center-circle-${i}`, [x, 0.025, z], [Math.hypot(dx, dz), 0.022, 0.055], lineMat);
    seg.setEulerAngles(0, -Math.atan2(dz, dx) * 180 / Math.PI, 0);
  }
  // Penalty box and goal.
  box(app, "penalty-box-top", [0, 0.02, -10], [9, 0.025, 0.08], lineMat);
  box(app, "penalty-box-left", [-4.5, 0.02, -12], [0.08, 0.025, 4], lineMat);
  box(app, "penalty-box-right", [4.5, 0.02, -12], [0.08, 0.025, 4], lineMat);
  const goalMat = material([0.88, 0.92, 0.90], { metalness: 0.25 });
  box(app, "goal-crossbar", [0, 1.45, -13.65], [5.2, 0.13, 0.13], goalMat);
  box(app, "goal-post-left", [-2.55, 0.73, -13.65], [0.13, 1.45, 0.13], goalMat);
  box(app, "goal-post-right", [2.55, 0.73, -13.65], [0.13, 1.45, 0.13], goalMat);
  // Backdrop walls.
  box(app, "back-wall", [0, 1.1, -15], [FIELD_W + 2, 2.2, 0.4], darkMat);
  box(app, "side-wall-left", [-9.3, 1, 0], [0.4, 2, FIELD_L + 1], darkMat);
  box(app, "side-wall-right", [9.3, 1, 0], [0.4, 2, FIELD_L + 1], darkMat);

  // Player: capsule-like body made from primitive shapes.
  const player = new pc.Entity("player");
  app.root.addChild(player);
  const torso = new pc.Entity("torso");
  torso.addComponent("render", { type: "capsule", material: playerMat });
  torso.setLocalScale(0.72, 1.0, 0.48);
  torso.setLocalPosition(0, 1.15, 0);
  player.addChild(torso);
  const head = sphere(app, "player-head-temp", [0, 1.85, 0], 0.25, material([0.72, 0.54, 0.39]));
  player.addChild(head);
  head.setLocalPosition(0, 1.9, 0);
  head.setLocalPosition(0, 1.9, 0);
  const shorts = new pc.Entity("shorts");
  shorts.addComponent("render", { type: "box", material: shortsMat });
  shorts.setLocalScale(0.72, 0.42, 0.48);
  shorts.setLocalPosition(0, 0.55, 0);
  player.addChild(shorts);
  const marker = new pc.Entity("player-marker");
  marker.addComponent("render", { type: "box", material: accentMat });
  marker.setLocalScale(0.18, 0.06, 0.65);
  marker.setLocalPosition(0, 0.18, -0.32);
  player.addChild(marker);
  player.setPosition(0, 0, 7);

  const ball = sphere(app, "ball", [0, 0.28, 3], 0.28, ballMat);
  const shadow = box(app, "ball-shadow", [0, 0.025, 3], [0.55, 0.025, 0.55], material([0.025, 0.06, 0.035]));

  // Lighting.
  const ambient = new pc.Entity("ambient-light");
  ambient.addComponent("light", { type: "directional", color: new pc.Color(1, 0.96, 0.86), intensity: 1.4 });
  ambient.setEulerAngles(48, 25, 0);
  app.root.addChild(ambient);

  // Third-person camera.
  const camera = new pc.Entity("camera");
  camera.addComponent("camera", {
    clearColor: new pc.Color(0.035, 0.10, 0.075),
    fov: 58,
    nearClip: 0.1,
    farClip: 100
  });
  app.root.addChild(camera);

  let moveX = 0, moveZ = 0, sprint = false;
  let ballVelocity = new pc.Vec3(0, 0, 0);
  let score = 0;
  const temp = new pc.Vec3();

  function update(dt) {
    const speed = sprint ? 7.0 : 4.4;
    const length = Math.hypot(moveX, moveZ);
    if (length > 0.05) {
      const nx = moveX / Math.max(1, length);
      const nz = moveZ / Math.max(1, length);
      player.translate(nx * speed * dt, 0, nz * speed * dt);
      player.setEulerAngles(0, Math.atan2(nx, nz) * 180 / Math.PI, 0);
    }
    const p = player.getPosition();
    p.x = pc.math.clamp(p.x, -8.0, 8.0);
    p.z = pc.math.clamp(p.z, -12.3, 12.3);
    player.setPosition(p);

    // Simple ball friction and boundary response.
    const bp = ball.getPosition();
    bp.x += ballVelocity.x * dt;
    bp.z += ballVelocity.z * dt;
    const friction = Math.pow(0.985, dt * 60);
    ballVelocity.x *= friction;
    ballVelocity.z *= friction;
    if (Math.abs(ballVelocity.x) < 0.04) ballVelocity.x = 0;
    if (Math.abs(ballVelocity.z) < 0.04) ballVelocity.z = 0;
    if (bp.x < -8.4 || bp.x > 8.4) ballVelocity.x *= -0.55;
    if (bp.z > 13.1) ballVelocity.z *= -0.55;
    if (bp.z < -13.25 && Math.abs(bp.x) > 2.55) ballVelocity.z *= -0.55;
    bp.x = pc.math.clamp(bp.x, -8.4, 8.4);
    bp.z = pc.math.clamp(bp.z, -13.5, 13.5);
    ball.setPosition(bp);
    ball.rotate(0, (ballVelocity.x + ballVelocity.z) * 100 * dt, 0);
    shadow.setPosition(bp.x, 0.025, bp.z);

    // Soft player-ball collision / dribble nudge.
    const dx = bp.x - p.x, dz = bp.z - p.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 1.05 && distance > 0.01 && length > 0.05) {
      ballVelocity.x += (dx / distance) * 1.1 * dt;
      ballVelocity.z += (dz / distance) * 1.1 * dt;
    }

    const target = new pc.Vec3(p.x, 3.5, p.z + 6.2);
    const currentCameraPosition = camera.getPosition();
    currentCameraPosition.lerp(currentCameraPosition, target, Math.min(1, dt * 4));
    camera.setPosition(currentCameraPosition);
    camera.lookAt(p.x, 0.8, p.z - 2.5);
  }

  function kick() {
    const p = player.getPosition();
    const bp = ball.getPosition();
    const dx = bp.x - p.x, dz = bp.z - p.z;
    const d = Math.hypot(dx, dz);
    if (d > 2.2) return false;
    let dirX = dx / Math.max(0.2, d);
    let dirZ = dz / Math.max(0.2, d);
    // Aim generally toward the far goal when ball is in front.
    if (bp.z > p.z - 0.5) { dirX = 0; dirZ = -1; }
    ballVelocity.x = dirX * 11;
    ballVelocity.z = dirZ * 15;
    const goal = bp.z < -12.8 && Math.abs(bp.x) < 2.45;
    return goal;
  }

  function resetBall() {
    ball.setPosition(0, 0.28, 3);
    ballVelocity.set(0, 0, 0);
  }

  return {
    app,
    get score() { return score; },
    set score(value) { score = value; },
    setMovement(x, z) { moveX = x; moveZ = z; },
    setSprint(value) { sprint = value; },
    kick,
    resetBall,
    update
  };
}
