namespace Fudge {
  export abstract class BaseWidget extends ƒ.Node {
    protected abstract componentToAxisMap: Map<ƒ.Node, AXIS>;
    protected componentToOriginalColorMap: Map<ƒ.Node, ƒ.Color> = new Map();
    protected pickedComponent: ƒ.Node;

    public getAxisFromWidgetComponent(_component: ƒ.Node): AXIS {
      return this.componentToAxisMap.get(_component);
    }

    public abstract isHitWidgetComponent(_hits: ƒ.RayHit[]): {axis: AXIS, additionalNodes: ƒ.Node[]};

    public releaseComponent(pickedComponent: ƒ.Node = this.pickedComponent): void {
      pickedComponent.getComponent(ƒ.ComponentMaterial).clrPrimary = this.componentToOriginalColorMap.get(pickedComponent);
    }

    public getComponentFromAxis(_axis: AXIS): ƒ.Node {
      for (let component of this.componentToAxisMap.keys()) {
        if (this.componentToAxisMap.get(component) == _axis) 
          return component;
      }
      return null;
    }

    public updateWidget(_axis: AXIS): void {
      this.changeColorOfComponent(this.getComponentFromAxis(_axis));
    }

    public abstract changeColorOfComponent(component: ƒ.Node): void;

    public removeUnselectedAxis(_axis: AXIS): void {
      let component: ƒ.Node = this.getComponentFromAxis(_axis);
      this.releaseComponent(component);
    }
  }
}