namespace FudgeAid {
  import ƒ = FudgeCore;


  export class NodeArrow extends Node {
    private static internalResources: Map<string, ƒ.SerializableResource> = NodeArrow.createInternalResources();

    constructor(_name: string, _color: ƒ.Color) {
      super(_name, ƒ.Matrix4x4.IDENTITY());

      let shaft: Node = new Node(_name + "Shaft", ƒ.Matrix4x4.IDENTITY(), <ƒ.Material>NodeArrow.internalResources.get("Material"), <ƒ.Mesh>NodeArrow.internalResources.get("Shaft"));
      let head: Node = new Node(_name + "Head", ƒ.Matrix4x4.IDENTITY(), <ƒ.Material>NodeArrow.internalResources.get("Material"), <ƒ.Mesh>NodeArrow.internalResources.get("Head"));
      shaft.mtxLocal.scale(new ƒ.Vector3(0.01, 0.01, 1));
      head.mtxLocal.translateZ(0.5);
      head.mtxLocal.scale(new ƒ.Vector3(0.05, 0.05, 0.1));
      head.mtxLocal.rotateX(90);

      shaft.getComponent(ƒ.ComponentMaterial).clrPrimary = _color;
      head.getComponent(ƒ.ComponentMaterial).clrPrimary = _color;

      this.addChild(shaft);
      this.addChild(head);
    }

    private static createInternalResources(): Map<string, ƒ.SerializableResource> {
      let map: Map<string, ƒ.SerializableResource> = new Map();
      map.set("Shaft", new ƒ.MeshCube("ArrowShaft"));
      map.set("Head", new ƒ.MeshPyramid("ArrowHead"));
      let coat: ƒ.CoatColored = new ƒ.CoatColored(ƒ.Color.CSS("white"));
      map.set("Material", new ƒ.Material("Arrow", ƒ.ShaderLit, coat));

      map.forEach((_resource) => ƒ.Project.deregister(_resource));
      return map;
    }

    public set color(_color: ƒ.Color) {
      for (let child of this.getChildren()) {
        child.getComponent(ƒ.ComponentMaterial).clrPrimary.copy(_color);
      }
    }
  }
}