namespace FudgeAid {
  import ƒ = FudgeCore;

  export class NodeCoordinateSystem extends Node {
    constructor(_name: string = "CoordinateSystem", _transform?: ƒ.Matrix4x4) {
      super(_name, _transform);
      let arrowRed: ƒ.Node = new NodeArrow("ArrowRed", new ƒ.Color(1, 0, 0, 1));
      let arrowGreen: ƒ.Node = new NodeArrow("ArrowGreen", new ƒ.Color(0, 1, 0, 1));
      let arrowBlue: ƒ.Node = new NodeArrow("ArrowBlue", new ƒ.Color(0, 0, 1, 1));

      arrowRed.mtxLocal.rotateY(90);
      arrowGreen.mtxLocal.rotateX(-90);

      this.addChild(arrowRed);
      this.addChild(arrowGreen);
      this.addChild(arrowBlue);
    }
  }
}