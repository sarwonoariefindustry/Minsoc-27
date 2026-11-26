import * as pc from "playcanvas";

function makeColor(rgb) {
  return new pc.Color(rgb[0], rgb[1], rgb[2], 1);
}

function createMaterial(color) {
  const mat = new pc.StandardMaterial();
  mat.diffuse = color;
  mat.shininess = 18;
  mat.update();
  return mat;
}

export class Pitch {
  constructor(app, config) {
    this.app = app;
    this.config = config;
    this.root = new pc.Entity("SoccerPitch");
    this.app.root.addChild(this.root);

    this._buildSurround();
    this._buildStripes();
    this._buildLines();
  }

  _buildSurround() {
    const { width, length, boundaryPadding, surroundColor } = this.config;
    const totalW = width + boundaryPadding * 2 + 12;
    const totalL = length + boundaryPadding * 2 + 12;

    const ground = new pc.Entity("OuterGround");
    ground.addComponent("render", {
      type: "box",
      material: createMaterial(makeColor(surroundColor))
    });
    ground.setLocalScale(totalW, 0.5, totalL);
    ground.setPosition(0, -0.25, 0);
    this.root.addChild(ground);
  }

  _buildStripes() {
    const { width, length, stripeCount, grassPrimary, grassSecondary } = this.config;
    const stripeLen = length / stripeCount;
    const startZ = -length / 2 + stripeLen / 2;

    const matPrimary = createMaterial(makeColor(grassPrimary));
    const matSecondary = createMaterial(makeColor(grassSecondary));

    for (let i = 0; i < stripeCount; i++) {
      const stripe = new pc.Entity(`GrassStripe_${i}`);
      stripe.addComponent("render", {
        type: "box",
        material: i % 2 === 0 ? matPrimary : matSecondary
      });
      stripe.setLocalScale(width, 0.04, stripeLen);
      stripe.setPosition(0, -0.02, startZ + i * stripeLen);
      this.root.addChild(stripe);
    }
  }

  _addLine(name, x, z, sx, sz) {
    const { lineHeight, lineColor } = this.config;
    const line = new pc.Entity(name);
    line.addComponent("render", {
      type: "box",
      material: createMaterial(makeColor(lineColor))
    });
    line.setLocalScale(sx, lineHeight, sz);
    line.setPosition(x, lineHeight / 2, z);
    this.root.addChild(line);
  }

  _buildLines() {
    const { width, length, lineWidth } = this.config;
    const halfW = width / 2;
    const halfL = length / 2;

    this._addLine("Line_Left", -halfW, 0, lineWidth, length);
    this._addLine("Line_Right", halfW, 0, lineWidth, length);
    this._addLine("Line_Top", 0, -halfL, width + lineWidth, lineWidth);
    this._addLine("Line_Bottom", 0, halfL, width + lineWidth, lineWidth);
    this._addLine("Line_Halfway", 0, 0, width, lineWidth);

    const circleRadius = 3.4;
    const segments = 16;
    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * Math.PI * 2;
      const a1 = ((i + 1) / segments) * Math.PI * 2;
      const x0 = Math.cos(a0) * circleRadius;
      const z0 = Math.sin(a0) * circleRadius;
      const x1 = Math.cos(a1) * circleRadius;
      const z1 = Math.sin(a1) * circleRadius;
      const mx = (x0 + x1) * 0.5;
      const mz = (z0 + z1) * 0.5;
      const segLen = Math.hypot(x1 - x0, z1 - z0) + 0.04;
      const angleDeg = (Math.atan2(x1 - x0, z1 - z0) * 180) / Math.PI;

      const seg = new pc.Entity(`CenterCircleSeg_${i}`);
      seg.addComponent("render", {
        type: "box",
        material: createMaterial(makeColor(this.config.lineColor))
      });
      seg.setLocalScale(lineWidth, this.config.lineHeight, segLen);
      seg.setPosition(mx, this.config.lineHeight / 2, mz);
      seg.setEulerAngles(0, angleDeg, 0);
      this.root.addChild(seg);
    }

    const boxW = 11.0;
    const boxD = 5.5;
    const boxFrontZ = -halfL + boxD;
    this._addLine("PenaltyBox_Front", 0, boxFrontZ, boxW, lineWidth);
    this._addLine("PenaltyBox_Left", -boxW / 2, -halfL + boxD / 2, lineWidth, boxD);
    this._addLine("PenaltyBox_Right", boxW / 2, -halfL + boxD / 2, lineWidth, boxD);
  }
}
