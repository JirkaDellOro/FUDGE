namespace Fudge {
  export class AxesSelectionHandler {
    public isSelectedViaKeyboard: boolean = false;
    private _widget: IWidget;
    private selectedAxes: Axis[] = [];
    private pickedAxis: Axis;
    private axisIsPicked: boolean = false;

    constructor(widget: IWidget) {
      this._widget = widget;
    }

    public get widget(): ƒ.Node {
      return this._widget;
    }

    public get wasPicked(): boolean {
      return this.axisIsPicked;
    }

    public releaseComponent(): void {
      if (this.axisIsPicked) {
        this.axisIsPicked = false;
        this._widget.releaseComponent();
      }
    }

    public pickWidget(_hits: ƒ.RayHit[]): ƒ.Node[] {
      let result: {axis: Axis, additionalNodes: ƒ.Node[]} = this._widget.isHitWidgetComponent(_hits);
      this.pickedAxis = result.axis;
      if (this.pickedAxis)
        this.axisIsPicked = true;
      return result.additionalNodes;
    } 

    public isValidSelection(): boolean {
      return this.axisIsPicked || this.selectedAxes.length > 0;
    }
    
    public getSelectedAxes(): Axis[] {
      let selectedAxes: Axis[] = this.selectedAxes.slice();
      if (!this.selectedAxes.includes(this.pickedAxis) && this.axisIsPicked) {
        selectedAxes.push(this.pickedAxis);
      }
      return selectedAxes;
    }

    public addAxisOf(_key: string): void {
      let selectedAxis: Axis = this.getSelectedAxisBy(_key);
      if (!this.selectedAxes.includes(selectedAxis)) {
        this.selectedAxes.push(selectedAxis);
        this._widget.updateWidget(selectedAxis);
      }
    }

    public removeAxisOf(_key: string): void {
      let selectedAxis: Axis = this.getSelectedAxisBy(_key);
      let index: number = this.selectedAxes.indexOf(selectedAxis);
      if (index != -1) {
        this._widget.removeUnselectedAxis(this.selectedAxes[index]);
        this.selectedAxes.splice(index, 1);
        if (!this.isAxisSelectedViaKeyboard()) 
          this.isSelectedViaKeyboard = false;
      }
    }

    public isAxisSelectedViaKeyboard(): boolean {
      return this.selectedAxes.length > 0;
    }

    private getSelectedAxisBy(_key: string): Axis {
      let selectedAxis: Axis;
      switch (_key) {
        case "x": 
          selectedAxis = Axis.X;
          break;
        case "y": 
          selectedAxis = Axis.Y;
          break;
        case "z":
          selectedAxis = Axis.Z;
          break;
      }
      return selectedAxis;
    }
  }
}