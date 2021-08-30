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

    public get mtxMeshPivot(): ƒ.Matrix4x4 {
      let cmpMesh: ƒ.ComponentMesh = this.getComponent(ƒ.ComponentMesh);
      return cmpMesh ? cmpMesh.mtxPivot : null;
    }

    public async deserialize(_serialization: ƒ.Serialization): Promise<ƒ.Serializable> {
      // Quick and maybe hacky solution. Created node is completely dismissed and a recreation of the baseclass gets return. Otherwise, components will be doubled...
      let node: ƒ.Node = new ƒ.Node(_serialization.name);
      await node.deserialize(_serialization);
      // console.log(node);
      return node;
    }
  }
}