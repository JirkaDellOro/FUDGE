/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>
/// <reference path="Node.ts"/>

namespace FudgeAid {
  import ƒ = FudgeCore;

  export class NodeArrow extends Node {
    constructor(_name: string, _color: ƒ.Color) {
      super(_name, ƒ.Matrix4x4.IDENTITY);
      let coat: ƒ.CoatColored = new ƒ.CoatColored(_color);
      let material: ƒ.Material = new ƒ.Material("Arrow", ƒ.ShaderUniColor, coat);

      let meshCube: ƒ.MeshCube = new ƒ.MeshCube();
      let meshPyramid: ƒ.MeshPyramid = new ƒ.MeshPyramid();

      let shaft: Node = new Node("Shaft", ƒ.Matrix4x4.IDENTITY, material, meshCube);
      let head: Node = new Node("Head", ƒ.Matrix4x4.IDENTITY, material, meshPyramid);
      shaft.local.scale(new ƒ.Vector3(0.01, 1, 0.01));
      head.local.translateY(0.5);
      head.local.scale(new ƒ.Vector3(0.05, 0.1, 0.05));

      this.appendChild(shaft);
      this.appendChild(head);
    }
  }
}