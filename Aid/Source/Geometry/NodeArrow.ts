/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeAid {
  import ƒ = FudgeCore;

  export class NodeArrow extends ƒ.Node {
    constructor(_name: string, _color: ƒ.Color) {
      super(_name);
      let coat: ƒ.CoatColored = new ƒ.CoatColored(_color);
      let material: ƒ.Material = new ƒ.Material("Arrow", ƒ.ShaderUniColor, coat);

      let meshCube: ƒ.MeshCube = new ƒ.MeshCube();
      let meshPyramid: ƒ.MeshPyramid = new ƒ.MeshPyramid();
      let shaft: ƒ.Node = new NodeGeometry("Shaft", material, meshCube);
      let head: ƒ.Node = new NodeGeometry("Head", material, meshPyramid);
      let mtxShaft: ƒ.Matrix4x4 = shaft.cmpTransform.local;
      let mtxHead: ƒ.Matrix4x4 = head.cmpTransform.local;
      mtxShaft.scale(new ƒ.Vector3(0.01, 1, 0.01));
      mtxHead.translateY(0.5);
      mtxHead.scale(new ƒ.Vector3(0.05, 0.1, 0.05));

      this.appendChild(shaft);
      this.appendChild(head);
      this.addComponent(new ƒ.ComponentTransform());
    }
  }
}