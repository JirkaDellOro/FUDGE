namespace Fudge {
  export abstract class IWidget extends ƒ.Node {
    protected abstract componentToAxisMap: Map<ƒ.Node, Axis>;
    protected componentToOriginalColorMap: Map<ƒ.Node, ƒ.Color> = new Map();
    protected pickedComponent: ƒ.Node;

    public getAxisFromWidgetComponent(_component: ƒ.Node): Axis {
      return this.componentToAxisMap.get(_component);
    }

    public abstract isHitWidgetComponent(_hits: ƒ.RayHit[]): {axis: Axis, additionalNodes: ƒ.Node[]};

    public releaseComponent(pickedComponent: ƒ.Node = this.pickedComponent): void {
      pickedComponent.getComponent(ƒ.ComponentMaterial).clrPrimary = this.componentToOriginalColorMap.get(pickedComponent);
    }

    public getComponentFromAxis(_axis: Axis): ƒ.Node {
      for (let component of this.componentToAxisMap.keys()) {
        if (this.componentToAxisMap.get(component) == _axis) 
          return component;
      }
      return null;
    }

    public updateWidget(_axis: Axis): void {
      this.changeColorOfComponent(this.getComponentFromAxis(_axis));
    }

    public abstract changeColorOfComponent(component: ƒ.Node): void;

    public removeUnselectedAxis(_axis: Axis): void {
      let component: ƒ.Node = this.getComponentFromAxis(_axis);
      this.releaseComponent(component);
    }
  }
}