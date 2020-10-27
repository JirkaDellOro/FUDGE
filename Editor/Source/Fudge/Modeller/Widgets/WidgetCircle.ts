namespace Fudge {
  import ƒ = FudgeCore;
  export class WidgetCircle extends ƒ.Node {
    constructor(_name: string, _color: ƒ.Color, _transform: ƒ.Matrix4x4) {
      super(_name);
      this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshTorus("MeshTorus", 0.03)));
      let compMat: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(new ƒ.Material("Circle", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white"))));
      compMat.clrPrimary = _color;
      this.addComponent(compMat);
      this.addComponent(new ƒ.ComponentTransform(_transform));
    }
  }
}