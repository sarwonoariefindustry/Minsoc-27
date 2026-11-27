
import * as pc from "playcanvas";

const FIELD_W = 18;
const FIELD_L = 28;

function createMaterial(color, gloss = 0.3) {
  const m = new pc.StandardMaterial();
  m.diffuse = new pc.Color(...color);
  m.gloss = gloss;
  m.update();
  return m;
}

function createBox(app, name, position, scale, mat) {
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

function createSphere(app, name, radius, mat) {
  const e = new pc.Entity(name);
  e.addComponent("render", {
    type: "sphere",
    material: mat
  });
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

  // MATERIALS
  const grassA = createMaterial([0.10, 0.34, 0.19]);
  const grassB = createMaterial([0.12, 0.39, 0.21]);
  const lineMat = createMaterial([0.88, 0.94, 0.88]);
  const darkMat = createMaterial([0.035, 0.075, 0.06]);
  const playerMat = createMaterial([0.82, 0.88, 0.92], 0.5);
  const shortsMat = createMaterial([0.055, 0.10, 0.14]);
  const skinMat = createMaterial([0.72, 0.54, 0.39]);
  const ballMat = createMaterial([0.96, 0.96, 0.91], 0.65);
  const accentMat = createMaterial([0.72, 0.95, 0.23]);

  // FIELD
  createBox(
    app,
    "field-base",
    [0, -0.22, 0],
    [FIELD_W, 0.4, FIELD_L],
    grassA
  );

  for (let i = 0; i < 7; i++) {
    createBox(
      app,
      `grass-stripe-${i}`,
      [0, -0.008, -12 + i * 4],
      [FIELD_W - 0.15, 0.018, 2],
      grassB
    );
  }

  // FIELD LINES
  createBox(app, "touchline-left",
    [-8.88, 0.015, 0],
    [0.12, 0.025, FIELD_L - 0.2], lineMat);

  createBox(app, "touchline-right",
    [8.88, 0.015, 0],
    [0.12, 0.025, FIELD_L - 0.2], lineMat);

  createBox(app, "goal-line-far",
    [0, 0.015, -13.88],
    [FIELD_W - 0.2, 0.025, 0.12], lineMat);

  createBox(app, "goal-line-near",
    [0, 0.015, 13.88],
    [FIELD_W - 0.2, 0.025, 0.12], lineMat);

  createBox(app, "halfway-line",
    [0, 0.018, 0],
    [FIELD_W - 0.25, 0.025, 0.09], lineMat);

  // CENTER CIRCLE
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const b = ((i + 1) / 48) * Math.PI * 2;

    const x = Math.cos(a) * 2.2;
    const z = Math.sin(a) * 2.2;

    const dx = Math.cos(b) * 2.2 - x;
    const dz = Math.sin(b) * 2.2 - z;

    const seg = createBox(
      app,
      `circle-${i}`,
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
  createBox(app, "penalty-top",
    [0, 0.02, -10],
    [9, 0.025, 0.08], lineMat);

  createBox(app, "penalty-left",
    [-4.5, 0.02, -12],
    [0.08, 0.025, 4], lineMat);

  createBox(app, "penalty-right",
    [4.5, 0.02, -12],
    [0.08, 0.025, 4], lineMat);

  // GOAL
  const goalMat = createMaterial([0.88, 0.92, 0.90]);

  createBox(app, "goal-crossbar",
    [0, 1.45, -13.65],
    [5.2, 0.13, 0.13], goalMat);

  createBox(app, "goal-left",
    [-2.55, 0.73, -13.65],
    [0.13, 1.45, 0.13], goalMat);

  createBox(app, "goal-right",
    [2.55, 0.73, -13.65],
    [0.13, 1.45, 0.13], goalMat);

  // WALLS
  createBox(app, "back-wall",
    [0, 1.1, -15],
    [FIELD_W + 2, 2.2, 0.4], darkMat);

  createBox(app, "left-wall",
    [-9.3, 1, 0],
    [0.4, 2, FIELD_L + 1], darkMat);

  createBox(app, "right-wall",
    [9.3, 1, 0],
    [0.4, 2, FIELD_L + 1], darkMat);

  // PLAYER ROOT
  const player = new pc.Entity("player");
  app.root.addChild(player);
  player.setPosition(0, 0, 7);

  // TORSO
  const torso = new pc.Entity("torso");
  torso.addComponent("render", {
    type: "capsule",
    material: playerMat
  });
  torso.setLocalScale(0.72, 1, 0.48);
  torso.setLocalPosition(0, 1.15, 0);
  player.addChild(torso);

  // HEAD
  const head = new pc.Entity("head");
  head.addComponent("render", {
    type: "sphere",
    material: skinMat
  });
  head.setLocalScale(0.5, 0.5, 0.5);
  head.setLocalPosition(0, 1.9, 0);
  player.addChild(head);

  // SHORTS
  const shorts = new pc.Entity("shorts");
  shorts.addComponent("render", {
    type: "box",
    material: shortsMat
  });
  shorts.setLocalScale(0.72, 0.42, 0.48);
  shorts.setLocalPosition(0, 0.55, 0);
  player.addChild(shorts);

  // LEGS
  function makeLeg(name, x) {
    const pivot = new pc.Entity(name);
    pivot.setLocalPosition(x, 0.53, 0);
    player.addChild(pivot);

    const leg = new pc.Entity(`${name}-leg`);
    leg.addComponent("render", {
      type: "box",
      material: shortsMat
    });
    leg.setLocalScale(0.23, 0.65, 0.25);
    leg.setLocalPosition(0, -0.20, 0);
    pivot.addChild(leg);

    const foot = new pc.Entity(`${name}-foot`);
    foot.addComponent("render", {
      type: "box",
      material: darkMat
    });
    foot.setLocalScale(0.27, 0.14, 0.42);
    foot.setLocalPosition(0, -0.48, -0.10);
    pivot.addChild(foot);

    return pivot;
  }

  const leftLeg = makeLeg("left-leg", -0.22);
  const rightLeg = makeLeg("right-leg", 0.22);

  // PLAYER MARKER
  const marker = new pc.Entity("player-marker");
  marker.addComponent("render", {
    type: "box",
    material: accentMat
  });
  marker.setLocalScale(0.18, 0.06, 0.65);
  marker.setLocalPosition(0, 0.18, -0.32);
  player.addChild(marker);

  // BALL
  const ball = createSphere(app, "ball", 0.28, ballMat);
  ball.setPosition(0, 0.28, 3);

  const shadow = createBox(
    app,
    "ball-shadow",
    [0, 0.025, 3],
    [0.55, 0.025, 0.55],
    darkMat
  );

  // LIGHT
  const light = new pc.Entity("sun");
  light.addComponent("light", {
    type: "directional",
    color: new pc.Color(1, 0.96, 0.86),
    intensity: 1.4
  });
  light.setEulerAngles(48, 25, 0);
  app.root.addChild(light);

  // CAMERA
  const camera = new pc.Entity("camera");
  camera.addComponent("camera", {
    clearColor: new pc.Color(0.035, 0.10, 0.075),
    fov: 58,
    nearClip: 0.1,
    farClip: 100
  });
  app.root.addChild(camera);

  // INPUT
  let moveX = 0;
  let moveZ = 0;
  let sprint = false;

  // BALL PHYSICS
  const ballVelocity = new pc.Vec3(0, 0, 0);

  let hasPossession = false;
  let touchTimer = 0;
  let touchSide = 1;
  let kickLock = 0;

  // PLAYER ANIMATION
  let animationTime = 0;

  // GAME SCORE
  let score = 0;

  function clampMagnitude(x, z, max) {
    const length = Math.hypot(x, z);

    if (length > max) {
      return {
        x: x / length * max,
        z: z / length * max
      };
    }

    return { x, z };
  }

  function update(dt) {
    const delta = Math.min(dt, 0.04);

    kickLock = Math.max(0, kickLock - delta);

    // MOVEMENT INPUT
    const inputLength = Math.hypot(moveX, moveZ);
    const moving = inputLength > 0.08;

    let dirX = 0;
    let dirZ = -1;

    if (moving) {
      dirX = moveX / inputLength;
      dirZ = moveZ / inputLength;
    } else {
      const yaw = player.getEulerAngles().y *
        Math.PI / 180;

      dirX = -Math.sin(yaw);
      dirZ = -Math.cos(yaw);
    }

    const inputAmount = Math.min(1, inputLength);
    const speed = (sprint ? 6.8 : 4.2) * inputAmount;

    // PLAYER MOVEMENT
    if (moving) {
      const p = player.getPosition();

      p.x += dirX * speed * delta;
      p.z += dirZ * speed * delta;

      p.x = pc.math.clamp(p.x, -8, 8);
      p.z = pc.math.clamp(p.z, -12.3, 12.3);

      player.setPosition(p);

      // PLAYER ROTATION
      const targetYaw =
        Math.atan2(-dirX, -dirZ) * 180 / Math.PI;

      const currentYaw = player.getEulerAngles().y;

      const newYaw = pc.math.lerpAngle(
        currentYaw,
        targetYaw,
        Math.min(1, delta * 10)
      );

      player.setEulerAngles(0, newYaw, 0);
    }

    // PROCEDURAL LEG ANIMATION
    if (moving) {
      animationTime += delta * (sprint ? 13 : 8) *
        inputAmount;
    } else {
      animationTime *= Math.max(0, 1 - delta * 7);
    }

    const swing = moving
      ? Math.sin(animationTime) * (sprint ? 30 : 21)
      : 0;

    leftLeg.setLocalEulerAngles(swing, 0, 0);
    rightLeg.setLocalEulerAngles(-swing, 0, 0);

    // BALL POSITION
    const p = player.getPosition();
    const bp = ball.getPosition();

    const dx = bp.x - p.x;
    const dz = bp.z - p.z;
    const distance = Math.hypot(dx, dz);

    const forwardDot = dx * dirX + dz * dirZ;

    // BALL POSSESSION
    if (!hasPossession && moving && kickLock <= 0) {
      if (distance < 1.25 && forwardDot > -0.35) {
        hasPossession = true;
        touchTimer = 0.05;
      }
    }

    // RELEASE POSSESSION IF BALL GETS TOO FAR
    if (hasPossession && distance > 1.85) {
      hasPossession = false;
    }

    // TOUCH-BASED DRIBBLING
    if (hasPossession && moving && kickLock <= 0) {
      touchTimer -= delta;

      const touchInterval = sprint ? 0.30 : 0.23;

      if (touchTimer <= 0) {
        touchTimer = touchInterval;

        touchSide *= -1;

        // Target is slightly in front and to one side.
        const sideX = -dirZ;
        const sideZ = dirX;

        const frontDistance = sprint ? 1.02 : 0.72;
        const sideDistance = 0.13 * touchSide;

        const targetX =
          p.x + dirX * frontDistance +
          sideX * sideDistance;

        const targetZ =
          p.z + dirZ * frontDistance +
          sideZ * sideDistance;

        const errorX = targetX - bp.x;
        const errorZ = targetZ - bp.z;

        // Each touch gives the ball a small impulse.
        const correction = clampMagnitude(
          errorX * 2.0,
          errorZ * 2.0,
          sprint ? 2.0 : 1.5
        );

        ballVelocity.x += correction.x;
        ballVelocity.z += correction.z;

        // A little forward momentum from the foot.
        ballVelocity.x += dirX * (sprint ? 0.65 : 0.38);
        ballVelocity.z += dirZ * (sprint ? 0.65 : 0.38);
      }
    }

    // BALL ROLLING AND FRICTION
    if (!hasPossession || !moving || kickLock > 0) {
      const friction = Math.pow(0.982, delta * 60);

      ballVelocity.x *= friction;
      ballVelocity.z *= friction;
    }

    if (Math.abs(ballVelocity.x) < 0.025) {
      ballVelocity.x = 0;
    }

    if (Math.abs(ballVelocity.z) < 0.025) {
      ballVelocity.z = 0;
    }

    // INTEGRATE BALL MOVEMENT
    bp.x += ballVelocity.x * delta;
    bp.z += ballVelocity.z * delta;

    // BALL BOUNDARIES
    if (bp.x < -8.4 || bp.x > 8.4) {
      bp.x = pc.math.clamp(bp.x, -8.4, 8.4);
      ballVelocity.x *= -0.4;
      hasPossession = false;
    }

    if (bp.z > 13.1) {
      bp.z = 13.1;
      ballVelocity.z *= -0.4;
      hasPossession = false;
    }

    if (bp.z < -13.25 && Math.abs(bp.x) > 2.55) {
      bp.z = -13.25;
      ballVelocity.z *= -0.4;
      hasPossession = false;
    }

    bp.z = pc.math.clamp(bp.z, -13.5, 13.1);

    ball.setPosition(bp);

    // BALL ROTATION
    const rollSpeed = Math.hypot(
      ballVelocity.x,
      ballVelocity.z
    );

    ball.rotate(
      ballVelocity.z * 80 * delta,
      0,
      -ballVelocity.x * 80 * delta
    );

    // SHADOW
    shadow.setPosition(bp.x, 0.025, bp.z);

    // CAMERA FOLLOW
    const cameraTarget = new pc.Vec3(
      p.x,
      3.5,
      p.z + 6.2
    );

    const cameraPosition = camera.getPosition();

    cameraPosition.lerp(
      cameraPosition,
      cameraTarget,
      Math.min(1, delta * 4)
    );

    camera.setPosition(cameraPosition);
    camera.lookAt(p.x, 0.8, p.z - 2.5);
  }

  // SHOOTING
  function kick() {
    const p = player.getPosition();
    const bp = ball.getPosition();

    const dx = bp.x - p.x;
    const dz = bp.z - p.z;
    const distance = Math.hypot(dx, dz);

    if (distance > 1.9) {
      return false;
    }

    const yaw = player.getEulerAngles().y *
      Math.PI / 180;

    let dirX = -Math.sin(yaw);
    let dirZ = -Math.cos(yaw);

    // If moving, use joystick direction.
    const inputLength = Math.hypot(moveX, moveZ);

    if (inputLength > 0.08) {
      dirX = moveX / inputLength;
      dirZ = moveZ / inputLength;
    }

    const power = sprint ? 16 : 13;

    ballVelocity.x = dirX * power;
    ballVelocity.z = dirZ * power;

    hasPossession = false;
    kickLock = 0.65;
    touchTimer = 0;

    return true;
  }

  // RESET BALL
  function resetBall() {
    ball.setPosition(0, 0.28, 3);
    ballVelocity.set(0, 0, 0);

    hasPossession = false;
    touchTimer = 0;
    kickLock = 0;
  }

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
