namespace Fudge {
  import ƒAid = FudgeAid;
  export class WidgetPillar extends ƒAid.Node {
    constructor(_name: string, _color: ƒ.Color) {
      super(_name, ƒ.Matrix4x4.IDENTITY());

      let shaft: ƒAid.Node = new ƒAid.Node("Shaft", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("MaterialShaft", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white"))), new ƒ.MeshCube());
      let head: ƒAid.Node = new ƒAid.Node("Head", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("MaterialHead", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white"))), new ƒ.MeshCube());
      shaft.mtxLocal.scale(new ƒ.Vector3(0.01, 1, 0.01));
      head.mtxLocal.translateY(0.5);
      head.mtxLocal.scale(new ƒ.Vector3(0.05, 0.1, 0.05));

      shaft.getComponent(ƒ.ComponentMaterial).clrPrimary = _color;
      head.getComponent(ƒ.ComponentMaterial).clrPrimary = _color;

      this.addChild(shaft);
      this.addChild(head);
    }
  }
}