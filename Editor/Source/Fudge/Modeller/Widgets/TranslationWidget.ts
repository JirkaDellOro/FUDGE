namespace Fudge {
  import ƒAid = FudgeAid;
  export class TranslationWidget extends IWidget {
    protected componentToAxisMap: Map<ƒ.Node, Axis> = new Map();

    constructor(_name: string = "TranslationWidget", _transform?: ƒ.Matrix4x4) {
      super(_name);
      let arrowRed: ƒ.Node = new ƒAid.NodeArrow("ArrowRed", new ƒ.Color(1, 0, 0, 1));
      let arrowGreen: ƒ.Node = new ƒAid.NodeArrow("ArrowGreen", new ƒ.Color(0, 1, 0, 1));
      let arrowBlue: ƒ.Node = new ƒAid.NodeArrow("ArrowBlue", new ƒ.Color(0, 0, 1, 1));

      this.componentToAxisMap.set(arrowRed, Axis.X);
      this.componentToAxisMap.set(arrowGreen, Axis.Y);
      this.componentToAxisMap.set(arrowBlue, Axis.Z);

      arrowRed.mtxLocal.rotateZ(-90);
      arrowBlue.mtxLocal.rotateX(90);

      this.addChild(arrowRed);
      this.addChild(arrowGreen);
      this.addChild(arrowBlue);
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

        for (let arrow of this.getChildren()) {
          for (let child of arrow.getChildren()) {
            if (child == hit.node) {
              isCircle = true;
              if (hit.zBuffer > lowestZBuffer)
                continue;
              lowestZBuffer = hit.zBuffer;
              wasPicked = true;
              this.pickedComponent = arrow;
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

    public releaseComponent(pickedComponent: ƒ.Node = this.pickedComponent): void {
      pickedComponent.getChildren().forEach(child => child.getComponent(ƒ.ComponentMaterial).clrPrimary = this.componentToOriginalColorMap.get(pickedComponent));
    }

    public changeColorOfComponent(component: ƒ.Node): void {
      component.getChildren().forEach(child => child.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(1, 1, 1, 1));
    }

    private fillColorDict(): void {
      for (let circle of this.getChildren()) {
        this.componentToOriginalColorMap.set(circle, circle.getChildren()[0].getComponent(ƒ.ComponentMaterial).clrPrimary);
      }
    }
  }
}