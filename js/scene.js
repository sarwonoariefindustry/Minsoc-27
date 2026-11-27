
import * as pc from "playcanvas";

const FIELD_W = 18;
const FIELD_L = 28;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function material(color, options = {}) {
  const m = new pc.StandardMaterial();

  m.diffuse = new pc.Color(
    color[0],
    color[1],
    color[2]
  );

  m.metalness = options.metalness ?? 0;
  m.gloss = options.gloss ?? 0.25;

  m.update();
  return m;
}

function box(app, name, position, scale, mat) {
  const e = new pc.Entity(name);

  e.addComponent("render", {
    type: "box",
    material: mat
  });

  e.setLocalPosition(...position);
  e.setLocalScale(...scale);

  app.root.addChild(e);
  return e;
}

function sphere(app, name, position, radius, mat) {
  const e = new pc.Entity(name);

  e.addComponent("render", {
    type: "sphere",
    material: mat
  });

  e.setLocalPosition(...position);
  e.setLocalScale(
    radius * 2,
    radius * 2,
    radius * 2
  );

  app.root.addChild(e);
  return e;
}

// ==========================================
// CREATE SCENE
// ==========================================

export async function createScene(canvas) {
  const app = new pc.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    touch: new pc.TouchDevice(canvas),
    keyboard: new pc.Keyboard(window)
  });

  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);

  app.scene.ambientLight = new pc.Color(
    0.48,
    0.55,
    0.48
  );

  app.start();

  // ========================================
  // MATERIALS
  // ========================================

  const grassA = material([0.10, 0.34, 0.19]);
  const grassB = material([0.12, 0.39, 0.21]);
  const lineMat = material([0.88, 0.94, 0.88]);
  const darkMat = material([0.035, 0.075, 0.06]);

  const playerMat = material(
    [0.82, 0.88, 0.92],
    { gloss: 0.5 }
  );

  const shortsMat = material([0.055, 0.10, 0.14]);

  const ballMat = material(
    [0.96, 0.96, 0.91],
    { gloss: 0.65 }
  );

  const accentMat = material([0.72, 0.95, 0.23]);

  // ========================================
  // FIELD
  // ========================================

  box(
    app,
    "field-base",
    [0, -0.22, 0],
    [FIELD_W, 0.4, FIELD_L],
    grassA
  );

  for (let i = 0; i < 7; i++) {
    box(
      app,
      `grass-stripe-${i}`,
      [0, -0.008, -12 + i * 4],
      [FIELD_W - 0.15, 0.018, 2],
      grassB
    );
  }

  box(
    app,
    "touchline-left",
    [-FIELD_W / 2 + 0.12, 0.015, 0],
    [0.12, 0.025, FIELD_L - 0.2],
    lineMat
  );

  box(
    app,
    "touchline-right",
    [FIELD_W / 2 - 0.12, 0.015, 0],
    [0.12, 0.025, FIELD_L - 0.2],
    lineMat
  );

  box(
    app,
    "goal-line-far",
    [0, 0.015, -FIELD_L / 2 + 0.12],
    [FIELD_W - 0.2, 0.025, 0.12],
    lineMat
  );

  box(
    app,
    "goal-line-near",
    [0, 0.015, FIELD_L / 2 - 0.12],
    [FIELD_W - 0.2, 0.025, 0.12],
    lineMat
  );

  box(
    app,
    "halfway-line",
    [0, 0.018, 0],
    [FIELD_W - 0.25, 0.025, 0.09],
    lineMat
  );

  // CENTER CIRCLE

  const segments = 48;

  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const b = ((i + 1) / segments) * Math.PI * 2;

    const x = Math.cos(a) * 2.2;
    const z = Math.sin(a) * 2.2;

    const dx = Math.cos(b) * 2.2 - x;
    const dz = Math.sin(b) * 2.2 - z;

    const seg = box(
      app,
      `center-circle-${i}`,
      [x, 0.025, z],
      [Math.hypot(dx, dz), 0.022, 0.055],
      lineMat
    );

    seg.setEulerAngles(
      0,
      -Math.atan2(dz, dx) * 180 / Math.PI,
      0
    );
  }

  // PENALTY BOX

  box(
    app,
    "penalty-box-top",
    [0, 0.02, -10],
    [9, 0.025, 0.08],
    lineMat
  );

  box(
    app,
    "penalty-box-left",
    [-4.5, 0.02, -12],
    [0.08, 0.025, 4],
    lineMat
  );

  box(
    app,
    "penalty-box-right",
    [4.5, 0.02, -12],
    [0.08, 0.025, 4],
    lineMat
  );

  // ========================================
  // GOAL
  // ========================================

  const goalMat = material(
    [0.88, 0.92, 0.90],
    { metalness: 0.25 }
  );

  box(
    app,
    "goal-crossbar",
    [0, 1.45, -13.65],
    [5.2, 0.13, 0.13],
    goalMat
  );

  box(
    app,
    "goal-post-left",
    [-2.55, 0.73, -13.65],
    [0.13, 1.45, 0.13],
    goalMat
  );

  box(
    app,
    "goal-post-right",
    [2.55, 0.73, -13.65],
    [0.13, 1.45, 0.13],
    goalMat
  );

  // STADIUM WALLS

  box(
    app,
    "back-wall",
    [0, 1.1, -15],
    [FIELD_W + 2, 2.2, 0.4],
    darkMat
  );

  box(
    app,
    "side-wall-left",
    [-9.3, 1, 0],
    [0.4, 2, FIELD_L + 1],
    darkMat
  );

  box(
    app,
    "side-wall-right",
    [9.3, 1, 0],
    [0.4, 2, FIELD_L + 1],
    darkMat
  );

  // ========================================
  // PLAYER
  // ========================================

  const player = new pc.Entity("player");
  app.root.addChild(player);

  const torso = new pc.Entity("torso");

  torso.addComponent("render", {
    type: "capsule",
    material: playerMat
  });

  torso.setLocalScale(0.72, 1.0, 0.48);
  torso.setLocalPosition(0, 1.15, 0);

  player.addChild(torso);

  const head = new pc.Entity("player-head");

  head.addComponent("render", {
    type: "sphere",
    material: material([0.72, 0.54, 0.39])
  });

  head.setLocalScale(0.5, 0.5, 0.5);
  head.setLocalPosition(0, 1.9, 0);

  player.addChild(head);

  const shorts = new pc.Entity("shorts");

  shorts.addComponent("render", {
    type: "box",
    material: shortsMat
  });

  shorts.setLocalScale(0.72, 0.42, 0.48);
  shorts.setLocalPosition(0, 0.55, 0);

  player.addChild(shorts);

  // Direction marker on the ground.

  const marker = new pc.Entity("player-marker");

  marker.addComponent("render", {
    type: "box",
    material: accentMat
  });

  marker.setLocalScale(0.18, 0.06, 0.65);
  marker.setLocalPosition(0, 0.18, -0.32);

  player.addChild(marker);

  // Small front indicator on the chest.

  const frontIndicator = new pc.Entity("front-indicator");

  frontIndicator.addComponent("render", {
    type: "box",
    material: accentMat
  });

  frontIndicator.setLocalScale(0.34, 0.12, 0.035);
  frontIndicator.setLocalPosition(0, 1.3, -0.255);

  player.addChild(frontIndicator);

  player.setPosition(0, 0, 7);

  // ========================================
  // BALL
  // ========================================

  const ball = sphere(
    app,
    "ball",
    [0, 0.28, 3],
    0.28,
    ballMat
  );

  const shadow = box(
    app,
    "ball-shadow",
    [0, 0.025, 3],
    [0.55, 0.025, 0.55],
    material([0.025, 0.06, 0.035])
  );

  // ========================================
  // LIGHT
  // ========================================

  const ambient = new pc.Entity("ambient-light");

  ambient.addComponent("light", {
    type: "directional",
    color: new pc.Color(1, 0.96, 0.86),
    intensity: 1.4
  });

  ambient.setEulerAngles(48, 25, 0);
  app.root.addChild(ambient);

  // ========================================
  // THIRD-PERSON CAMERA
  // ========================================

  const camera = new pc.Entity("camera");

  camera.addComponent("camera", {
    clearColor: new pc.Color(0.035, 0.10, 0.075),
    fov: 58,
    nearClip: 0.1,
    farClip: 100
  });

  app.root.addChild(camera);

  // Camera settings.

  const CAMERA_DISTANCE = 8.5;
  const CAMERA_HEIGHT = 5.4;
  const CAMERA_LOOK_AHEAD = 2.5;

  // Camera yaw follows player yaw smoothly.

  let cameraYaw = 0;

  camera.setPosition(
    0,
    CAMERA_HEIGHT,
    15.5
  );

  camera.lookAt(0, 1, 4.5);

  // ========================================
  // GAME VARIABLES
  // ========================================

  let moveX = 0;
  let moveZ = 0;
  let sprint = false;

  let score = 0;

  let playerYaw = 0;

  // Input reference is captured when a new
  // joystick movement begins. This prevents
  // camera rotation from changing movement
  // direction while the player is turning.

  let inputReferenceYaw = 0;
  let wasInputActive = false;

  let lastDirX = 0;
  let lastDirZ = -1;

  // Ball physics.

  const ballVelocity = new pc.Vec3(0, 0, 0);

  let kickLock = 0;
  let touchCooldown = 0;
  let alternateFoot = 1;

  // ========================================
  // GAME UPDATE
  // ========================================

  function update(dt) {
    const delta = Math.min(dt, 0.05);

    kickLock = Math.max(0, kickLock - delta);
    touchCooldown = Math.max(0, touchCooldown - delta);

    // --------------------------------------
    // INPUT STATE
    // --------------------------------------

    const inputLength = Math.hypot(moveX, moveZ);
    const inputActive = inputLength > 0.05;

    const inputScale = Math.min(1, inputLength);

    // Capture camera direction when movement starts.

    if (inputActive && !wasInputActive) {
      inputReferenceYaw = cameraYaw;
    }

    wasInputActive = inputActive;

    let directionX = lastDirX;
    let directionZ = lastDirZ;

    if (inputActive) {
      const referenceRad =
        inputReferenceYaw * Math.PI / 180;

      // Camera-relative forward direction.

      const forwardX = -Math.sin(referenceRad);
      const forwardZ = -Math.cos(referenceRad);

      // Camera-relative right direction.

      const rightX = Math.cos(referenceRad);
      const rightZ = -Math.sin(referenceRad);

      // Screen joystick:
      // Up = negative Z
      // Down = positive Z

      const rawX =
        rightX * moveX +
        forwardX * (-moveZ);

      const rawZ =
        rightZ * moveX +
        forwardZ * (-moveZ);

      const rawLength = Math.hypot(rawX, rawZ);

      if (rawLength > 0.001) {
        directionX = rawX / rawLength;
        directionZ = rawZ / rawLength;
      }
    }

    // --------------------------------------
    // PLAYER MOVEMENT
    // --------------------------------------

    const normalSpeed = 4.4;
    const sprintSpeed = 7.0;

    const baseSpeed = sprint
      ? sprintSpeed
      : normalSpeed;

    const playerSpeed = baseSpeed * inputScale;

    const p = player.getPosition();

    if (inputActive) {
      // Move in world coordinates.

      p.x += directionX * playerSpeed * delta;
      p.z += directionZ * playerSpeed * delta;

      lastDirX = directionX;
      lastDirZ = directionZ;

      // Turn the player toward movement direction.

      const targetYaw =
        Math.atan2(-directionX, -directionZ) *
        180 / Math.PI;

      playerYaw = pc.math.lerpAngle(
        playerYaw,
        targetYaw,
        Math.min(1, delta * 12)
      );

      player.setEulerAngles(
        0,
        playerYaw,
        0
      );
    }

    // Keep player inside the field.

    p.x = pc.math.clamp(p.x, -8.0, 8.0);
    p.z = pc.math.clamp(p.z, -12.3, 12.3);

    player.setPosition(p);

    // ======================================
    // DRIBBLING PHYSICS
    // ======================================

    const bp = ball.getPosition();

    const relativeX = bp.x - p.x;
    const relativeZ = bp.z - p.z;

    const distance = Math.hypot(
      relativeX,
      relativeZ
    );

    const forwardDistance =
      relativeX * directionX +
      relativeZ * directionZ;

    const rightX = -directionZ;
    const rightZ = directionX;

    const sideDistance =
      relativeX * rightX +
      relativeZ * rightZ;

    const ballInFront =
      forwardDistance > 0.15 &&
      forwardDistance < 1.35;

    const ballNearFeet =
      Math.abs(sideDistance) < 0.68 &&
      distance < 1.55;

    const canTouchBall =
      inputActive &&
      kickLock <= 0 &&
      touchCooldown <= 0 &&
      ballInFront &&
      ballNearFeet;

    if (canTouchBall) {
      const ballForwardSpeed =
        ballVelocity.x * directionX +
        ballVelocity.z * directionZ;

      const desiredBallSpeed = sprint ? 7.8 : 5.2;

      const speedDifference =
        desiredBallSpeed - ballForwardSpeed;

      const pushStrength = pc.math.clamp(
        speedDifference * 0.72,
        1.6,
        3.2
      );

      ballVelocity.x += directionX * pushStrength;
      ballVelocity.z += directionZ * pushStrength;

      const sidePush = 0.08 * alternateFoot;

      ballVelocity.x += rightX * sidePush;
      ballVelocity.z += rightZ * sidePush;

      alternateFoot *= -1;

      touchCooldown = sprint ? 0.20 : 0.24;
    }

    // --------------------------------------
    // BALL FRICTION
    // --------------------------------------

    const friction = Math.pow(
      0.994,
      delta * 60
    );

    ballVelocity.x *= friction;
    ballVelocity.z *= friction;

    if (Math.abs(ballVelocity.x) < 0.025) {
      ballVelocity.x = 0;
    }

    if (Math.abs(ballVelocity.z) < 0.025) {
      ballVelocity.z = 0;
    }

    // Maximum ball speed.

    const ballSpeed = Math.hypot(
      ballVelocity.x,
      ballVelocity.z
    );

    const maxBallSpeed = 15;

    if (ballSpeed > maxBallSpeed) {
      const scale = maxBallSpeed / ballSpeed;

      ballVelocity.x *= scale;
      ballVelocity.z *= scale;
    }

    // --------------------------------------
    // BALL MOVEMENT
    // --------------------------------------

    bp.x += ballVelocity.x * delta;
    bp.z += ballVelocity.z * delta;

    // --------------------------------------
    // BALL BOUNDARIES
    // --------------------------------------

    if (bp.x < -8.4 || bp.x > 8.4) {
      bp.x = pc.math.clamp(bp.x, -8.4, 8.4);
      ballVelocity.x *= -0.45;
    }

    if (bp.z > 13.1) {
      bp.z = 13.1;
      ballVelocity.z *= -0.45;
    }

    if (
      bp.z < -13.25 &&
      Math.abs(bp.x) > 2.55
    ) {
      bp.z = -13.25;
      ballVelocity.z *= -0.45;
    }

    bp.z = pc.math.clamp(
      bp.z,
      -13.5,
      13.1
    );

    ball.setPosition(bp);

    // Ball rotation and shadow.

    const rollingSpeed = Math.hypot(
      ballVelocity.x,
      ballVelocity.z
    );

    ball.rotate(
      rollingSpeed * 45 * delta,
      0,
      rollingSpeed * 20 * delta
    );

    shadow.setPosition(
      bp.x,
      0.025,
      bp.z
    );

    // ======================================
    // CAMERA FOLLOW + ROTATION
    // ======================================

    // Camera smoothly follows the player's yaw.

    cameraYaw = pc.math.lerpAngle(
      cameraYaw,
      playerYaw,
      Math.min(1, delta * 3.0)
    );

    const cameraRad = cameraYaw * Math.PI / 180;

    // Player forward direction.

    const forwardX = -Math.sin(cameraRad);
    const forwardZ = -Math.cos(cameraRad);

    // Position camera behind player.

    const desiredCameraX =
      p.x + Math.sin(cameraRad) * CAMERA_DISTANCE;

    const desiredCameraZ =
      p.z + Math.cos(cameraRad) * CAMERA_DISTANCE;

    const desiredCameraPosition = new pc.Vec3(
      desiredCameraX,
      CAMERA_HEIGHT,
      desiredCameraZ
    );

    // Smooth camera position.

    const currentCameraPosition = camera.getPosition();

    currentCameraPosition.lerp(
      currentCameraPosition,
      desiredCameraPosition,
      1 - Math.exp(-4.0 * delta)
    );

    camera.setPosition(currentCameraPosition);

    // Camera looks slightly ahead of player.

    camera.lookAt(
      p.x + forwardX * CAMERA_LOOK_AHEAD,
      1.0,
      p.z + forwardZ * CAMERA_LOOK_AHEAD
    );
  }

  // ========================================
  // KICK
  // ========================================

  function kick() {
    const p = player.getPosition();
    const bp = ball.getPosition();

    const dx = bp.x - p.x;
    const dz = bp.z - p.z;

    const distance = Math.hypot(dx, dz);

    if (distance > 2.0) {
      return false;
    }

    // Kick in the direction player is facing.

    const yaw = playerYaw * Math.PI / 180;

    const dirX = -Math.sin(yaw);
    const dirZ = -Math.cos(yaw);

    ballVelocity.x = dirX * 14;
    ballVelocity.z = dirZ * 14;

    kickLock = 0.65;
    touchCooldown = 0.35;

    return true;
  }

  // ========================================
  // RESET BALL
  // ========================================

  function resetBall() {
    ball.setPosition(0, 0.28, 3);

    ballVelocity.set(0, 0, 0);

    kickLock = 0;
    touchCooldown = 0;
    alternateFoot = 1;

    shadow.setPosition(
      0,
      0.025,
      3
    );
  }

  // ========================================
  // GAME API
  // ========================================

  return {
    app,

    get score() {
      return score;
    },

    set score(value) {
      score = value;
    },

    setMovement(x, z) {
      moveX = x;
      moveZ = z;
    },

    setSprint(value) {
      sprint = value;
    },

    kick,
    resetBall,
    update
  };
}
