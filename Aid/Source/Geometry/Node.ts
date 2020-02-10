/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeAid {
  import ƒ = FudgeCore;

  export class Node extends ƒ.Node {
    private static count: number = 0;

    constructor(_name: string = Node.getNextName(), _transform?: ƒ.Matrix4x4, _material?: ƒ.Material, _mesh?: ƒ.Mesh) {
      super(_name);
      if (_transform)
        this.addComponent(new ƒ.ComponentTransform(_transform));
      if (_material)
        this.addComponent(new ƒ.ComponentMaterial(_material));
      if (_mesh)
        this.addComponent(new ƒ.ComponentMesh(_mesh));
    }

    private static getNextName(): string {
      return "ƒAidNode_" + Node.count++;
    }

    public get local(): ƒ.Matrix4x4 {
      return this.cmpTransform ? this.cmpTransform.local : null;
    }

    public get pivot(): ƒ.Matrix4x4 {
      let cmpMesh: ƒ.ComponentMesh = this.getComponent(ƒ.ComponentMesh);
      return cmpMesh ? cmpMesh.pivot : null;
    }
  }
}