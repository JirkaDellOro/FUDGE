namespace Fudge {
  import ƒ = FudgeCore;
  export class RotationWidget extends ƒ.Node {
    constructor (_name: string = "RotationWidget", _transform?: ƒ.Matrix4x4) {
      super(_name);
      let yRotWidget: WidgetCircle = new WidgetCircle("Y_Rotation", new ƒ.Color(0, 1, 0), new ƒ.Matrix4x4());
      let xRotWidget: WidgetCircle = new WidgetCircle("X_Rotation", new ƒ.Color(1, 0, 0), ƒ.Matrix4x4.ROTATION_Z(90));
      let zRotWidget: WidgetCircle = new WidgetCircle("Z_Rotation", new ƒ.Color(0, 0, 1), ƒ.Matrix4x4.ROTATION_X(90));

      this.addChild(yRotWidget);
      this.addChild(xRotWidget);
      this.addChild(zRotWidget);

    }
  }
}