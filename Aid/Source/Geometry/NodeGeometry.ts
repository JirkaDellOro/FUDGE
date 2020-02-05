/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeAid {
  import ƒ = FudgeCore;

  export class NodeGeometry extends ƒ.Node {
    constructor(_name: string, _material: ƒ.Material, _mesh: ƒ.Mesh) {
      super(_name);
      this.addComponent( new ƒ.ComponentMesh(_mesh));
      this.addComponent( new ƒ.ComponentMaterial(_material));
      this.addComponent(new ƒ.ComponentTransform());
    }
  }
}