import * as pc from "playcanvas";

export class Player {
  constructor(app, config, pitchConfig) {
    this.app = app;
    this.config = config;
    this.pitchConfig = pitchConfig;

    this.root = new pc.Entity("Player");
    this.app.root.addChild(this.root);

    this._buildMesh();
    this.reset();

    this.facingYaw = 0;
    this.kickCooldownTimer = 0;
    this._kickAnimTimer = 0;
    this._forwardVec = new pc.Vec3(0, 0, -1);
  }

  _buildMesh() {
    const { bodyRadius, bodyHeight, jerseyColor, skinColor } = this.config;

    const jerseyMat = new pc.StandardMaterial();
    jerseyMat.diffuse = new pc.Color(jerseyColor[0], jerseyColor[1], jerseyColor[2], 1);
    jerseyMat.shininess = 35;
    jerseyMat.update();

    const shortsMat = new pc.StandardMaterial();
    shortsMat.diffuse = new pc.Color(0.14, 0.18, 0.24, 1);
    shortsMat.update();

    const skinMat = new pc.StandardMaterial();
    skinMat.diffuse = new pc.Color(skinColor[0], skinColor[1], skinColor[2], 1);
    skinMat.update();

    const indicatorMat = new pc.StandardMaterial();
    indicatorMat.diffuse = new pc.Color(1.0, 0.85, 0.15, 1);
    indicatorMat.emissive = new pc.Color(0.35, 0.28, 0.04, 1);
    indicatorMat.update();

    const torso = new pc.Entity("PlayerTorso");
    torso.addComponent("render", { type: "cylinder", material: jerseyMat });
    torso.setLocalScale(bodyRadius * 1.5, bodyHeight * 0.55, bodyRadius * 1.1);
    torso.setLocalPosition(0, 0.05, 0);
    this.root.addChild(torso);

    const head = new pc.Entity("PlayerHead");
    head.addComponent("render", { type: "sphere", material: skinMat });
    head.setLocalScale(bodyRadius * 0.95, bodyRadius * 0.95, bodyRadius * 0.95);
    head.setLocalPosition(0, bodyHeight * 0.45, 0);
    this.root.addChild(head);

    const frontMarker = new pc.Entity("PlayerFrontMarker");
    frontMarker.addComponent("render", { type: "box", material: indicatorMat });
    frontMarker.setLocalScale(0.28, 0.12, 0.36);
    frontMarker.setLocalPosition(0, -0.05, -(bodyRadius * 0.72));
    this.root.addChild(frontMarker);

    this._kickLeg = new pc.Entity("PlayerKickLeg");
    const legMesh = new pc.Entity("LegMesh");
    legMesh.addComponent("render", { type: "box", material: shortsMat });
    legMesh.setLocalScale(0.18, 0.55, 0.22);
    legMesh.setLocalPosition(0.18, -0.25, -0.05);
    this._kickLeg.addChild(legMesh);
    this._kickLeg.setLocalPosition(0, -0.22, 0);
    this.root.addChild(this._kickLeg);
  }

  reset() {
    const [sx, sy, sz] = this.config.spawnPos;
    this.root.setPosition(sx, sy, sz);
    this.facingYaw = 0;
    this.root.setEulerAngles(0, 0, 0);
    this.kickCooldownTimer = 0;
    this._kickAnimTimer = 0;
    if (this._kickLeg) {
      this._kickLeg.setLocalEulerAngles(0, 0, 0);
    }
  }

  getPosition() {
    return this.root.getPosition();
  }

  getForwardVector(out = new pc.Vec3()) {
    const rad = (this.facingYaw * Math.PI) / 180;
    out.set(-Math.sin(rad), 0, -Math.cos(rad)).normalize();
    return out;
  }

  triggerKickAnimation() {
    this._kickAnimTimer = 0.22;
  }

  update(dt, inputMove, isSprinting, ball) {
    if (this.kickCooldownTimer > 0) {
      this.kickCooldownTimer = Math.max(0, this.kickCooldownTimer - dt);
    }

    const pos = this.root.getPosition().clone();
    const moveMag = Math.hypot(inputMove.x, inputMove.y);

    if (moveMag > 0.01) {
      const targetYaw = (Math.atan2(-inputMove.x, inputMove.y) * 180) / Math.PI;
      const diff = ((targetYaw - this.facingYaw + 540) % 360) - 180;
      const turnStep = Math.min(Math.abs(diff), this.config.turnSpeed * dt * 30);
      this.facingYaw += Math.sign(diff) * turnStep;
      this.root.setEulerAngles(0, this.facingYaw, 0);

      const speed = isSprinting ? this.config.sprintSpeed : this.config.walkSpeed;
      const dirX = inputMove.x;
      const dirZ = -inputMove.y;
      const norm = Math.hypot(dirX, dirZ) || 1;

      pos.x += (dirX / norm) * speed * dt;
      pos.z += (dirZ / norm) * speed * dt;
    }

    const maxX = this.pitchConfig.width / 2 + this.pitchConfig.boundaryPadding - this.config.bodyRadius;
    const maxZ = this.pitchConfig.length / 2 + this.pitchConfig.boundaryPadding - this.config.bodyRadius;
    pos.x = pc.math.clamp(pos.x, -maxX, maxX);
    pos.z = pc.math.clamp(pos.z, -maxZ, maxZ);

    this.root.setPosition(pos.x, this.config.spawnPos[1], pos.z);

    if (this._kickAnimTimer > 0) {
      this._kickAnimTimer = Math.max(0, this._kickAnimTimer - dt);
      const t = 1 - this._kickAnimTimer / 0.22;
      const swingAngle = Math.sin(t * Math.PI) * -68;
      this._kickLeg.setLocalEulerAngles(swingAngle, 0, 0);
    } else if (moveMag > 0.05) {
      const freq = isSprinting ? 18 : 11;
      const swing = Math.sin(performance.now() * 0.001 * freq) * 24;
      this._kickLeg.setLocalEulerAngles(swing, 0, 0);
    } else {
      this._kickLeg.setLocalEulerAngles(0, 0, 0);
    }

    if (ball) {
      this._handleDribbleContact(pos, ball);
    }
  }

  _handleDribbleContact(playerPos, ball) {
    const ballPos = ball.getPosition();
    const dx = ballPos.x - playerPos.x;
    const dz = ballPos.z - playerPos.z;
    const dist = Math.hypot(dx, dz);
    const minDist = this.config.bodyRadius + ball.radius + 0.14;

    if (dist < minDist && dist > 0.0001 && ballPos.y < ball.radius + 0.55) {
      const pushX = dx / dist;
      const pushZ = dz / dist;
      const overlap = minDist - dist;

      ball.nudgePosition(pushX * overlap * 0.85, 0, pushZ * overlap * 0.85);
      ball.addImpulse(pushX * this.config.dribblePushForce, 0.6, pushZ * this.config.dribblePushForce);
    }
  }

  tryKickBall(ball) {
    if (this.kickCooldownTimer > 0 || !ball) return false;

    const playerPos = this.root.getPosition();
    const ballPos = ball.getPosition();
    const dx = ballPos.x - playerPos.x;
    const dz = ballPos.z - playerPos.z;
    const dist = Math.hypot(dx, dz);

    if (dist <= this.config.kickReach) {
      this.kickCooldownTimer = this.config.kickCooldown;
      this.triggerKickAnimation();

      const forward = this.getForwardVector();
      let aimX = forward.x;
      let aimZ = forward.z;
      if (dist > 0.01) {
        aimX = pc.math.lerp(forward.x, dx / dist, 0.35);
        aimZ = pc.math.lerp(forward.z, dz / dist, 0.35);
        const len = Math.hypot(aimX, aimZ) || 1;
        aimX /= len;
        aimZ /= len;
      }

      ball.setVelocity(
        aimX * this.config.shootForce,
        this.config.shootUpwardBoost,
        aimZ * this.config.shootForce
      );
      return true;
    }

    this.kickCooldownTimer = 0.18;
    this.triggerKickAnimation();
    return false;
  }
}
