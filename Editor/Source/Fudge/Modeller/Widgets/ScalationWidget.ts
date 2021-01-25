namespace Fudge {
  import ƒ = FudgeCore;
  export class ScalationWidget extends IWidget {
    protected componentToAxisMap: Map<ƒ.Node, Axis> = new Map();

    constructor (_name: string = "ScalationWidget", _transform: ƒ.Matrix4x4 = new ƒ.Matrix4x4()) {
      super(_name); 
      let xScaleWidget: WidgetPillar = new WidgetPillar("X_Scalation", new ƒ.Color(1, 0, 0));
      let yScaleWidget: WidgetPillar = new WidgetPillar("Y_Scalation", new ƒ.Color(0, 1, 0));
      let zScaleWidget: WidgetPillar = new WidgetPillar("Z_Scalation", new ƒ.Color(0, 0, 1));

      this.componentToAxisMap.set(xScaleWidget, Axis.X);
      this.componentToAxisMap.set(yScaleWidget, Axis.Y);
      this.componentToAxisMap.set(zScaleWidget, Axis.Z);

      xScaleWidget.mtxLocal.rotateZ(-90);
      zScaleWidget.mtxLocal.rotateX(90);

      this.addChild(yScaleWidget);
      this.addChild(xScaleWidget);
      this.addChild(zScaleWidget);
      this.fillColorDict();
    }

    public isHitWidgetComponent(_hits: ƒ.RayHit[]): {axis: Axis, additionalNodes: ƒ.Node[]} {
      let additionalNodes: ƒ.Node[] = [];
      let lowestZBuffer: number = Number.MAX_VALUE;
      let pickedAxis: Axis;
      let wasPicked: boolean = false;
      for (let hit of _hits) {
        if (hit.zBuffer == 0)
          continue; 
        let isCircle: boolean = false;
        for (let pillar of this.getChildren()) {
          for (let child of pillar.getChildren()) {
            if (child == hit.node) {
              isCircle = true;
              if (hit.zBuffer > lowestZBuffer)
                continue;
              lowestZBuffer = hit.zBuffer;
              wasPicked = true;
              this.pickedComponent = pillar;
            }
          }
        }
        if (!isCircle) 
          additionalNodes.push(hit.node);
      }
      if (wasPicked) {
        pickedAxis = this.getAxisFromWidgetComponent(this.pickedComponent);
        this.changeColorOfComponent(this.pickedComponent);
      }
      
      return {axis: pickedAxis, additionalNodes: additionalNodes};
    }

    public changeColorOfComponent(component: ƒ.Node): void {
      component.getChildren().forEach(child => child.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(1, 1, 1, 1));
    }


    public releaseComponent(pickedComponent: ƒ.Node = this.pickedComponent): void {
      pickedComponent.getChildren().forEach(child => child.getComponent(ƒ.ComponentMaterial).clrPrimary = this.componentToOriginalColorMap.get(pickedComponent));
    }

    private fillColorDict(): void {
      for (let circle of this.getChildren()) {
        this.componentToOriginalColorMap.set(circle, circle.getChildren()[0].getComponent(ƒ.ComponentMaterial).clrPrimary);
      }
    }
  }
}