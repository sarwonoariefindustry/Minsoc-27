import * as pc from "playcanvas";

export class Ball {
  constructor(app, config, pitchConfig, goalBounds) {
    this.app = app;
    this.config = config;
    this.pitchConfig = pitchConfig;
    this.goalBounds = goalBounds;
    this.radius = config.radius;

    this.root = new pc.Entity("SoccerBall");
    this.app.root.addChild(this.root);

    this._buildMesh();
    this.velocity = new pc.Vec3(0, 0, 0);
    this.reset();
  }

  _buildMesh() {
    const { radius, colorPrimary, colorAccent } = this.config;

    const sphereMat = new pc.StandardMaterial();
    sphereMat.diffuse = new pc.Color(colorPrimary[0], colorPrimary[1], colorPrimary[2], 1);
    sphereMat.shininess = 55;
    sphereMat.update();

    const bandMat = new pc.StandardMaterial();
    bandMat.diffuse = new pc.Color(colorAccent[0], colorAccent[1], colorAccent[2], 1);
    bandMat.shininess = 40;
    bandMat.update();

    const sphere = new pc.Entity("BallSphere");
    sphere.addComponent("render", { type: "sphere", material: sphereMat });
    sphere.setLocalScale(radius * 2, radius * 2, radius * 2);
    this.root.addChild(sphere);

    const ring = new pc.Entity("BallBand");
    ring.addComponent("render", { type: "box", material: bandMat });
    ring.setLocalScale(radius * 2.02, radius * 0.38, radius * 2.02);
    this.root.addChild(ring);
  }

  reset() {
    const [sx, sy, sz] = this.config.spawnPos;
    this.root.setPosition(sx, sy, sz);
    this.root.setEulerAngles(0, 0, 0);
    this.velocity.set(0, 0, 0);
  }

  getPosition() {
    return this.root.getPosition();
  }

  setVelocity(vx, vy, vz) {
    this.velocity.set(vx, vy, vz);
    this._clampSpeed();
  }

  addImpulse(ix, iy, iz) {
    this.velocity.x += ix;
    this.velocity.y += iy;
    this.velocity.z += iz;
    this._clampSpeed();
  }

  nudgePosition(dx, dy, dz) {
    const p = this.root.getPosition();
    this.root.setPosition(p.x + dx, p.y + dy, p.z + dz);
  }

  _clampSpeed() {
    const speed = this.velocity.length();
    if (speed > this.config.maxSpeed) {
      this.velocity.scale(this.config.maxSpeed / speed);
    }
  }

  update(dt) {
    const pos = this.root.getPosition().clone();

    this.velocity.y -= this.config.gravity * dt;

    pos.x += this.velocity.x * dt;
    pos.y += this.velocity.y * dt;
    pos.z += this.velocity.z * dt;

    if (pos.y <= this.radius) {
      pos.y = this.radius;
      if (this.velocity.y < 0) {
        this.velocity.y = -this.velocity.y * this.config.restitutionGround;
        if (Math.abs(this.velocity.y) < 0.8) {
          this.velocity.y = 0;
        }
      }
      const frictionFactor = Math.pow(this.config.groundFriction, dt * 60);
      this.velocity.x *= frictionFactor;
      this.velocity.z *= frictionFactor;
    } else {
      const airFactor = Math.pow(this.config.airDrag, dt * 60);
      this.velocity.x *= airFactor;
      this.velocity.z *= airFactor;
    }

    this._handleGoalCollisions(pos);

    const maxX = this.pitchConfig.width / 2 + this.pitchConfig.boundaryPadding - this.radius;
    const maxZ = this.pitchConfig.length / 2 + this.pitchConfig.boundaryPadding - this.radius;
    const minZ = Math.min(-maxZ, this.goalBounds.backZ - 0.6);

    if (pos.x < -maxX) {
      pos.x = -maxX;
      this.velocity.x = Math.abs(this.velocity.x) * 0.65;
    } else if (pos.x > maxX) {
      pos.x = maxX;
      this.velocity.x = -Math.abs(this.velocity.x) * 0.65;
    }

    if (pos.z > maxZ) {
      pos.z = maxZ;
      this.velocity.z = -Math.abs(this.velocity.z) * 0.65;
    } else if (pos.z < minZ) {
      pos.z = minZ;
      this.velocity.z = Math.abs(this.velocity.z) * 0.55;
    }

    if (this.velocity.lengthSq() < 0.008 && pos.y <= this.radius + 0.001) {
      this.velocity.set(0, 0, 0);
    }

    this.root.setPosition(pos);

    const horizSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (horizSpeed > 0.05 && pos.y <= this.radius + 0.05) {
      const rollAngle = ((horizSpeed * dt) / this.radius) * (180 / Math.PI);
      const axisX = -this.velocity.z / horizSpeed;
      const axisZ = this.velocity.x / horizSpeed;
      this.root.rotate(axisX * rollAngle, 0, axisZ * rollAngle);
    }
  }

  _handleGoalCollisions(pos) {
    const g = this.goalBounds;
    const r = this.radius + g.postRadius;

    const posts = [
      { x: g.minX, z: g.frontZ },
      { x: g.maxX, z: g.frontZ }
    ];

    for (const post of posts) {
      if (pos.y <= g.maxY + this.radius) {
        const dx = pos.x - post.x;
        const dz = pos.z - post.z;
        const dist = Math.hypot(dx, dz);
        if (dist < r && dist > 0.0001) {
          const nx = dx / dist;
          const nz = dz / dist;
          pos.x = post.x + nx * r;
          pos.z = post.z + nz * r;

          const vn = this.velocity.x * nx + this.velocity.z * nz;
          if (vn < 0) {
            const bounce = (1 + this.config.restitutionPost) * vn;
            this.velocity.x -= bounce * nx;
            this.velocity.z -= bounce * nz;
          }
        }
      }
    }

    if (pos.x >= g.minX && pos.x <= g.maxX) {
      const dy = pos.y - g.maxY;
      const dz = pos.z - g.frontZ;
      const dist = Math.hypot(dy, dz);
      if (dist < r && dist > 0.0001) {
        const ny = dy / dist;
        const nz = dz / dist;
        pos.y = g.maxY + ny * r;
        pos.z = g.frontZ + nz * r;

        const vn = this.velocity.y * ny + this.velocity.z * nz;
        if (vn < 0) {
          const bounce = (1 + this.config.restitutionPost) * vn;
          this.velocity.y -= bounce * ny;
          this.velocity.z -= bounce * nz;
        }
      }
    }

    if (pos.x >= g.minX + this.radius && pos.x <= g.maxX - this.radius && pos.y <= g.maxY) {
      if (pos.z - this.radius < g.backZ) {
        pos.z = g.backZ + this.radius;
        this.velocity.z = Math.abs(this.velocity.z) * 0.25;
        this.velocity.x *= 0.6;
      }
    }
  }

  isInsideGoal() {
    const pos = this.root.getPosition();
    const g = this.goalBounds;
    return (
      pos.x > g.minX + this.radius * 0.35 &&
      pos.x < g.maxX - this.radius * 0.35 &&
      pos.y < g.maxY - this.radius * 0.2 &&
      pos.z < g.frontZ - this.radius * 0.4 &&
      pos.z > g.backZ - 0.5
    );
  }
}
