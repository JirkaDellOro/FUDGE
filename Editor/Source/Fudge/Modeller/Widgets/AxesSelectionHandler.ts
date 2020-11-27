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

    public set wasPicked(state: boolean) {
      this.axisIsPicked = state;
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
      let validSelection: boolean = true;
      switch (_key) {
        case "x": 
          if (!this.selectedAxes.includes(Axis.X)) {
            this.selectedAxes.push(Axis.X);
          }
          break;
        case "y": 
          if (!this.selectedAxes.includes(Axis.Y)) {
            this.selectedAxes.push(Axis.Y);
          }
          break;
        case "z":
          if (!this.selectedAxes.includes(Axis.Z)) {
            this.selectedAxes.push(Axis.Z);
          }
          break;
        default:
          validSelection = false;
      }
      // if (validSelection)
      //   this.isSelectedViaKeyboard = true;
    }

    public removeAxisOf(_key: string): void {
      let index: number;
      switch (_key) {
        case "x": 
          index = this.selectedAxes.indexOf(Axis.X);
          break;
        case "y": 
          index = this.selectedAxes.indexOf(Axis.Y);
          break;
        case "z":
          index = this.selectedAxes.indexOf(Axis.Z);
          break;
      }     
      if (index != -1) {
        this.selectedAxes.splice(index, 1);
        if (!this.isAxisSelectedViaKeyboard()) 
          this.isSelectedViaKeyboard = false;
      }
    }

    public isAxisSelectedViaKeyboard(): boolean {
      return this.selectedAxes.length > 0;
    }
  }
}