/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeAid {
  import ƒ = FudgeCore;

  export class NodeCoordinateSystem extends ƒ.Node {
    constructor() {
      super("CoordinateSystem");
      let arrowRed: ƒ.Node = new NodeArrow("ArrowRed", new ƒ.Color(1, 0, 0, 1));
      let arrowGreen: ƒ.Node = new NodeArrow("ArrowGreen", new ƒ.Color(0, 1, 0, 1));
      let arrowBlue: ƒ.Node = new NodeArrow("ArrowBlue", new ƒ.Color(0, 0, 1, 1));

      arrowRed.cmpTransform.local.rotateZ(-90);
      arrowBlue.cmpTransform.local.rotateX(90);

      this.appendChild(arrowRed);
      this.appendChild(arrowGreen);
      this.appendChild(arrowBlue);
    }
  }
}