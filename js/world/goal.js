import * as pc from "playcanvas";

export class Goal {
  constructor(app, config) {
    this.app = app;
    this.config = config;
    this.root = new pc.Entity("SoccerGoal");

    const zCenter = config.zPosition;
    this.root.setPosition(0, 0, zCenter);
    this.app.root.addChild(this.root);

    this._buildFrame();
    this._buildNet();
  }

  _buildFrame() {
    const { width, height, depth, postRadius, postColor } = this.config;
    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(postColor[0], postColor[1], postColor[2], 1);
    mat.shininess = 60;
    mat.update();

    const halfW = width / 2;

    const leftPost = new pc.Entity("GoalPost_Left");
    leftPost.addComponent("render", { type: "cylinder", material: mat });
    leftPost.setLocalScale(postRadius * 2, height, postRadius * 2);
    leftPost.setPosition(-halfW, height / 2, 0);
    this.root.addChild(leftPost);

    const rightPost = new pc.Entity("GoalPost_Right");
    rightPost.addComponent("render", { type: "cylinder", material: mat });
    rightPost.setLocalScale(postRadius * 2, height, postRadius * 2);
    rightPost.setPosition(halfW, height / 2, 0);
    this.root.addChild(rightPost);

    const crossbar = new pc.Entity("GoalCrossbar");
    crossbar.addComponent("render", { type: "cylinder", material: mat });
    crossbar.setLocalScale(postRadius * 2, width + postRadius * 2, postRadius * 2);
    crossbar.setPosition(0, height, 0);
    crossbar.setEulerAngles(0, 0, 90);
    this.root.addChild(crossbar);

    const backBar = new pc.Entity("GoalBackBase");
    backBar.addComponent("render", { type: "box", material: mat });
    backBar.setLocalScale(width, postRadius * 1.4, postRadius * 1.4);
    backBar.setPosition(0, postRadius * 0.7, -depth);
    this.root.addChild(backBar);

    const leftBase = new pc.Entity("GoalLeftBase");
    leftBase.addComponent("render", { type: "box", material: mat });
    leftBase.setLocalScale(postRadius * 1.4, postRadius * 1.4, depth);
    leftBase.setPosition(-halfW, postRadius * 0.7, -depth / 2);
    this.root.addChild(leftBase);

    const rightBase = new pc.Entity("GoalRightBase");
    rightBase.addComponent("render", { type: "box", material: mat });
    rightBase.setLocalScale(postRadius * 1.4, postRadius * 1.4, depth);
    rightBase.setPosition(halfW, postRadius * 0.7, -depth / 2);
    this.root.addChild(rightBase);
  }

  _buildNet() {
    const { width, height, depth, netColor } = this.config;
    const netMat = new pc.StandardMaterial();
    netMat.diffuse = new pc.Color(netColor[0], netColor[1], netColor[2], 1);
    netMat.opacity = 0.28;
    netMat.blendType = pc.BLEND_NORMAL;
    netMat.cull = pc.CULLFACE_NONE;
    netMat.update();

    const halfW = width / 2;

    const backNet = new pc.Entity("Net_Back");
    backNet.addComponent("render", { type: "box", material: netMat });
    backNet.setLocalScale(width, height, 0.04);
    backNet.setPosition(0, height / 2, -depth);
    this.root.addChild(backNet);

    const topNet = new pc.Entity("Net_Top");
    topNet.addComponent("render", { type: "box", material: netMat });
    topNet.setLocalScale(width, 0.04, depth);
    topNet.setPosition(0, height, -depth / 2);
    this.root.addChild(topNet);

    const leftNet = new pc.Entity("Net_Left");
    leftNet.addComponent("render", { type: "box", material: netMat });
    leftNet.setLocalScale(0.04, height, depth);
    leftNet.setPosition(-halfW, height / 2, -depth / 2);
    this.root.addChild(leftNet);

    const rightNet = new pc.Entity("Net_Right");
    rightNet.addComponent("render", { type: "box", material: netMat });
    rightNet.setLocalScale(0.04, height, depth);
    rightNet.setPosition(halfW, height / 2, -depth / 2);
    this.root.addChild(rightNet);
  }

  getBounds() {
    const { width, height, depth, zPosition, postRadius } = this.config;
    return {
      minX: -width / 2,
      maxX: width / 2,
      minY: 0,
      maxY: height,
      frontZ: zPosition,
      backZ: zPosition - depth,
      postRadius
    };
  }
}
