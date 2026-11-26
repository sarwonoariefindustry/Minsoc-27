import * as pc from "playcanvas";

export class CameraRig {
  constructor(app, config) {
    this.app = app;
    this.config = config;

    this.entity = new pc.Entity("ThirdPersonCamera");
    this.entity.addComponent("camera", {
      clearColor: new pc.Color(0.52, 0.74, 0.92, 1),
      fov: config.fov,
      nearClip: 0.2,
      farClip: 180
    });

    const [ox, oy, oz] = config.offset;
    this.entity.setPosition(ox, oy, oz);
    this.entity.lookAt(0, 0.8, config.lookTargetZ ?? -6);

    this.app.root.addChild(this.entity);

    this._desiredPos = new pc.Vec3();
    this._currentPos = new pc.Vec3(ox, oy, oz);
    this._lookTarget = new pc.Vec3();
    this._currentLook = new pc.Vec3(0, 0.8, -6);
  }

  snapToTarget(playerPos, ballPos) {
    const [ox, oy, oz] = this.config.offset;
    this._currentPos.set(playerPos.x * 0.55 + ox, oy, playerPos.z + oz);
    this.entity.setPosition(this._currentPos);

    const w = this.config.lookAheadBallWeight;
    this._currentLook.set(
      pc.math.lerp(playerPos.x, ballPos.x, w),
      0.8,
      pc.math.lerp(playerPos.z - 5, ballPos.z, w)
    );
    this.entity.lookAt(this._currentLook);
  }

  update(dt, playerPos, ballPos) {
    const [ox, oy, oz] = this.config.offset;
    const lerpFactor = 1 - Math.exp(-this.config.followLerp * dt);
    const lookFactor = 1 - Math.exp(-this.config.lookLerp * dt);

    this._desiredPos.set(
      playerPos.x * 0.55 + ox,
      oy,
      playerPos.z + oz
    );

    this._currentPos.lerp(this._currentPos, this._desiredPos, lerpFactor);
    this.entity.setPosition(this._currentPos);

    const w = this.config.lookAheadBallWeight;
    this._lookTarget.set(
      pc.math.lerp(playerPos.x, ballPos.x, w),
      0.85,
      pc.math.lerp(playerPos.z - 6.5, ballPos.z, w)
    );

    this._currentLook.lerp(this._currentLook, this._lookTarget, lookFactor);
    this.entity.lookAt(this._currentLook);
  }
}
