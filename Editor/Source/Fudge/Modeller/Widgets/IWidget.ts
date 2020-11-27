namespace Fudge {
  export abstract class IWidget extends ƒ.Node {
    protected abstract componentToAxisMap: Map<ƒ.Node, Axis>;
    protected pickedComponent: ƒ.Node;
    protected oldColor: ƒ.Color;

    public getAxisFromWidgetComponent(_component: ƒ.Node): Axis {
      return this.componentToAxisMap.get(_component);
    }

    public abstract isHitWidgetComponent(_hits: ƒ.RayHit[]): {axis: Axis, additionalNodes: ƒ.Node[]};

    public releaseComponent(): void {
      this.pickedComponent.getComponent(ƒ.ComponentMaterial).clrPrimary = this.oldColor;
    }


  }
}