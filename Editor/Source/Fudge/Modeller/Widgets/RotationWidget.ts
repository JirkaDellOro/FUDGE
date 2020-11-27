namespace Fudge {
  import ƒ = FudgeCore;
  export class RotationWidget extends IWidget {
    protected componentToAxisMap: Map<ƒ.Node, Axis> = new Map();
    
    constructor (_name: string = "RotationWidget", _transform?: ƒ.Matrix4x4) {
      super(_name);
      let yRotWidget: WidgetCircle = new WidgetCircle("Y_Rotation", new ƒ.Color(0, 1, 0), new ƒ.Matrix4x4());
      let xRotWidget: WidgetCircle = new WidgetCircle("X_Rotation", new ƒ.Color(1, 0, 0), ƒ.Matrix4x4.ROTATION_Z(90));
      let zRotWidget: WidgetCircle = new WidgetCircle("Z_Rotation", new ƒ.Color(0, 0, 1), ƒ.Matrix4x4.ROTATION_X(90));

      this.componentToAxisMap.set(xRotWidget, Axis.X);
      this.componentToAxisMap.set(yRotWidget, Axis.Y);
      this.componentToAxisMap.set(zRotWidget, Axis.Z);

      this.addChild(yRotWidget);
      this.addChild(xRotWidget);
      this.addChild(zRotWidget);
    }

    public isHitWidgetComponent(_hits: ƒ.RayHit[]): {axis: Axis, additionalNodes: ƒ.Node[]} {
      let additionalNodes: ƒ.Node[] = [];
      let lowestZBuffer: number = Number.MAX_VALUE;
      let wasPicked: boolean = false;
      let pickedAxis: Axis;
      for (let hit of _hits) {
        if (hit.zBuffer != 0) {
          let isCircle: boolean = false;
          for (let circle of this.getChildren()) {
            if (circle == hit.node) {
              isCircle = true;
              if (hit.zBuffer > lowestZBuffer)
                continue;
              wasPicked = true;
              this.pickedComponent = circle;
              lowestZBuffer = hit.zBuffer;
            }
          }
          if (!isCircle)
            additionalNodes.push(hit.node);
        }
      }

      if (wasPicked) {
        pickedAxis = this.getAxisFromWidgetComponent(this.pickedComponent);
        this.oldColor = this.pickedComponent.getComponent(ƒ.ComponentMaterial).clrPrimary;
        this.pickedComponent.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(1, 1, 1, 1);
      }
      return {axis: pickedAxis, additionalNodes: additionalNodes};
    }

  }
}