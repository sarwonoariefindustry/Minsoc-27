
import * as pc from "playcanvas";

const FIELD_W = 18;
const FIELD_L = 28;

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

  // ==================================
  // MATERIALS
  // ==================================

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

  // ==================================
  // FIELD
  // ==================================

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

  // FIELD LINES

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

  // ==================================
  // GOAL
  // ==================================

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

  // ==================================
  // PLAYER
  // ==================================

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

  const head = sphere(
    app,
    "player-head",
    [0, 1.9, 0],
    0.25,
    material([0.72, 0.54, 0.39])
  );

  player.addChild(head);

  const shorts = new pc.Entity("shorts");

  shorts.addComponent("render", {
    type: "box",
    material: shortsMat
  });

  shorts.setLocalScale(0.72, 0.42, 0.48);
  shorts.setLocalPosition(0, 0.55, 0);

  player.addChild(shorts);

  const marker = new pc.Entity("player-marker");

  marker.addComponent("render", {
    type: "box",
    material: accentMat
  });

  marker.setLocalScale(0.18, 0.06, 0.65);
  marker.setLocalPosition(0, 0.18, -0.32);

  player.addChild(marker);

  player.setPosition(0, 0, 7);

  // ==================================
  // BALL
  // ==================================

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

  // ==================================
  // LIGHT
  // ==================================

  const ambient = new pc.Entity("ambient-light");

  ambient.addComponent("light", {
    type: "directional",
    color: new pc.Color(1, 0.96, 0.86),
    intensity: 1.4
  });

  ambient.setEulerAngles(48, 25, 0);

  app.root.addChild(ambient);

  // ==================================
  // CAMERA
  // ==================================

  const camera = new pc.Entity("camera");

  camera.addComponent("camera", {
    clearColor: new pc.Color(0.035, 0.10, 0.075),
    fov: 58,
    nearClip: 0.1,
    farClip: 100
  });

  app.root.addChild(camera);

  // ==================================
  // GAME VARIABLES
  // ==================================

  let moveX = 0;
  let moveZ = 0;
  let sprint = false;
  let score = 0;

  // Player rotation
  let playerYaw = 0;

  // Independent camera rotation
  let cameraYaw = 0;
  let cameraPitch = 18;

  const CAMERA_DISTANCE = 8.0;
  const CAMERA_SENSITIVITY = 0.18;

  // Last movement direction
  let lastDirX = 0;
  let lastDirZ = -1;

  // Ball physics
  const ballVelocity = new pc.Vec3(0, 0, 0);

  let kickLock = 0;

  // ==================================
  // CAMERA INPUT
  // ==================================

  function setCameraInput(dx, dy) {
    cameraYaw -= dx * CAMERA_SENSITIVITY;

    cameraPitch += dy * CAMERA_SENSITIVITY;

    // Prevent camera from going too high or too low.
    cameraPitch = pc.math.clamp(
      cameraPitch,
      8,
      38
    );
  }

  // ==================================
  // PLAYER MOVEMENT
  // ==================================

  function updatePlayer(delta) {
    const inputLength = Math.hypot(moveX, moveZ);

    const inputActive = inputLength > 0.06;

    const inputScale = Math.min(1, inputLength);

    const speed = (
      sprint ? 7.0 : 4.4
    ) * inputScale;

    let directionX = lastDirX;
    let directionZ = lastDirZ;

    if (inputActive) {
      // Camera-relative movement basis.
      const yaw = cameraYaw * Math.PI / 180;

      const forwardX = -Math.sin(yaw);
      const forwardZ = -Math.cos(yaw);

      const rightX = Math.cos(yaw);
      const rightZ = -Math.sin(yaw);

      // Joystick up is negative Z.
      const forwardInput = -moveZ;

      const rawX =
        rightX * moveX +
        forwardX * forwardInput;

      const rawZ =
        rightZ * moveX +
        forwardZ * forwardInput;

      const rawLength = Math.hypot(rawX, rawZ);

      if (rawLength > 0.001) {
        directionX = rawX / rawLength;
        directionZ = rawZ / rawLength;
      }

      const p = player.getPosition();

      p.x += directionX * speed * delta;
      p.z += directionZ * speed * delta;

      // Character faces its movement direction.
      const targetYaw =
        Math.atan2(-directionX, -directionZ) *
        180 / Math.PI;

      playerYaw = pc.math.lerpAngle(
        playerYaw,
        targetYaw,
        Math.min(1, delta * 13)
      );

      player.setEulerAngles(0, playerYaw, 0);

      lastDirX = directionX;
      lastDirZ = directionZ;

      // Field boundaries.
      p.x = pc.math.clamp(p.x, -8.0, 8.0);
      p.z = pc.math.clamp(p.z, -12.3, 12.3);

      player.setPosition(p);
    }

    return {
      inputActive,
      inputScale,
      directionX,
      directionZ
    };
  }

  // ==================================
  // BALL PHYSICS
  // ==================================

  function updateBall(delta, movement) {
    kickLock = Math.max(0, kickLock - delta);

    const p = player.getPosition();
    const bp = ball.getPosition();

    const dx = bp.x - p.x;
    const dz = bp.z - p.z;

    const distance = Math.hypot(dx, dz);

    const directionX = movement.inputActive
      ? movement.directionX
      : lastDirX;

    const directionZ = movement.inputActive
      ? movement.directionZ
      : lastDirZ;

    const canDribble =
      movement.inputActive &&
      kickLock <= 0 &&
      distance < 1.55;

    if (canDribble) {
      const sprintFactor = sprint ? 1 : 0;

      const dribbleDistance =
        0.72 +
        sprintFactor * 0.28 +
        movement.inputScale * 0.08;

      const targetX =
        p.x + directionX * dribbleDistance;

      const targetZ =
        p.z + directionZ * dribbleDistance;

      const errorX = targetX - bp.x;
      const errorZ = targetZ - bp.z;

      const springStrength = 25;
      const damping = 8.5;

      ballVelocity.x += (
        errorX * springStrength -
        ballVelocity.x * damping
      ) * delta;

      ballVelocity.z += (
        errorZ * springStrength -
        ballVelocity.z * damping
      ) * delta;

    } else {
      // Preserve free-ball momentum.
      const friction = Math.pow(0.985, delta * 60);

      ballVelocity.x *= friction;
      ballVelocity.z *= friction;

      if (Math.abs(ballVelocity.x) < 0.035) {
        ballVelocity.x = 0;
      }

      if (Math.abs(ballVelocity.z) < 0.035) {
        ballVelocity.z = 0;
      }
    }

    // Integrate ball movement.
    bp.x += ballVelocity.x * delta;
    bp.z += ballVelocity.z * delta;

    // Ball boundaries.
    if (bp.x < -8.4 || bp.x > 8.4) {
      bp.x = pc.math.clamp(bp.x, -8.4, 8.4);
      ballVelocity.x *= -0.45;
    }

    if (bp.z > 13.1) {
      bp.z = 13.1;
      ballVelocity.z *= -0.45;
    }

    // Leave goal mouth open.
    if (bp.z < -13.25 && Math.abs(bp.x) > 2.55) {
      bp.z = -13.25;
      ballVelocity.z *= -0.45;
    }

    bp.z = pc.math.clamp(bp.z, -13.5, 13.1);

    ball.setPosition(bp);

    // Visual ball roll.
    const rollingSpeed = Math.hypot(
      ballVelocity.x,
      ballVelocity.z
    );

    ball.rotate(
      0,
      rollingSpeed * 65 * delta,
      0
    );

    shadow.setPosition(
      bp.x,
      0.025,
      bp.z
    );
  }

  // ==================================
  // CAMERA FOLLOW
  // ==================================

  function updateCamera(delta) {
    const p = player.getPosition();

    const yaw = cameraYaw * Math.PI / 180;
    const pitch = cameraPitch * Math.PI / 180;

    const horizontalDistance =
      CAMERA_DISTANCE * Math.cos(pitch);

    const verticalDistance =
      CAMERA_DISTANCE * Math.sin(pitch);

    // Camera stays behind the player,
    // but its rotation is controlled independently.
    const desiredX =
      p.x + Math.sin(yaw) * horizontalDistance;

    const desiredY =
      1.2 + verticalDistance;

    const desiredZ =
      p.z + Math.cos(yaw) * horizontalDistance;

    const desiredPosition = new pc.Vec3(
      desiredX,
      desiredY,
      desiredZ
    );

    const currentPosition = camera.getPosition();

    currentPosition.lerp(
      currentPosition,
      desiredPosition,
      1 - Math.exp(-8 * delta)
    );

    camera.setPosition(currentPosition);

    // Look toward the player's upper body.
    camera.lookAt(
      p.x,
      1.15,
      p.z
    );
  }

  // ==================================
  // MAIN UPDATE
  // ==================================

  function update(dt) {
    const delta = Math.min(dt, 0.05);

    const movement = updatePlayer(delta);

    updateBall(delta, movement);

    updateCamera(delta);
  }

  // ==================================
  // KICK
  // ==================================

  function kick() {
    const p = player.getPosition();
    const bp = ball.getPosition();

    const dx = bp.x - p.x;
    const dz = bp.z - p.z;

    const distance = Math.hypot(dx, dz);

    if (distance > 2.0) {
      return false;
    }

    // Kick in the direction the player faces.
    const yaw = playerYaw * Math.PI / 180;

    const dirX = -Math.sin(yaw);
    const dirZ = -Math.cos(yaw);

    ballVelocity.x = dirX * 14;
    ballVelocity.z = dirZ * 14;

    kickLock = 0.55;

    return true;
  }

  // ==================================
  // RESET BALL
  // ==================================

  function resetBall() {
    ball.setPosition(0, 0.28, 3);

    ballVelocity.set(0, 0, 0);

    kickLock = 0;
  }

  // ==================================
  // PUBLIC GAME INTERFACE
  // ==================================

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

    setCameraInput,

    kick,
    resetBall,
    update
  };
}
