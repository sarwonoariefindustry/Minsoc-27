export const GAME_CONFIG = Object.freeze({
  pitch: {
    width: 24,
    length: 36,
    boundaryPadding: 3,
    stripeCount: 12,
    lineWidth: 0.16,
    lineHeight: 0.02,
    grassPrimary: [0.16, 0.52, 0.22],
    grassSecondary: [0.13, 0.46, 0.19],
    surroundColor: [0.09, 0.28, 0.13],
    lineColor: [0.95, 0.97, 0.95]
  },

  goal: {
    width: 5.4,
    height: 2.2,
    depth: 1.8,
    postRadius: 0.08,
    zPosition: -15.5,
    postColor: [0.96, 0.97, 0.98],
    netColor: [0.88, 0.92, 0.90]
  },

  player: {
    spawnPos: [0, 0.9, 9],
    bodyRadius: 0.42,
    bodyHeight: 1.4,
    walkSpeed: 6.5,
    sprintSpeed: 11.2,
    turnSpeed: 12.0,
    kickReach: 2.1,
    kickCooldown: 0.35,
    shootForce: 16.5,
    shootUpwardBoost: 4.8,
    dribblePushForce: 5.2,
    dribbleDistance: 1.15,
    jerseyColor: [0.12, 0.47, 0.85],
    skinColor: [0.85, 0.65, 0.50]
  },

  ball: {
    spawnPos: [0, 0.32, 5.5],
    radius: 0.32,
    groundFriction: 0.965,
    airDrag: 0.994,
    gravity: 22.0,
    restitutionGround: 0.58,
    restitutionPost: 0.72,
    maxSpeed: 28.0,
    colorPrimary: [0.97, 0.97, 0.97],
    colorAccent: [0.15, 0.18, 0.22]
  },

  camera: {
    offset: [0, 7.2, 11.5],
    lookAheadBallWeight: 0.28,
    followLerp: 6.5,
    lookLerp: 9.0,
    fov: 52
  }
});
