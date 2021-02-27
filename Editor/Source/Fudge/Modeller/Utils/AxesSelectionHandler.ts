namespace Fudge {
  export class AxesSelectionHandler {
    public isSelectedViaKeyboard: boolean = false;
    private _widget: BaseWidget;
    private selectedAxes: AXIS[] = [];
    private pickedAxis: AXIS;
    private axisIsPicked: boolean = false;

    // TODO: check if we could define the event listeners here, so that the whole process of using the selection handler is fully automatic
    constructor(widget: BaseWidget = null) {
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
      let result: {axis: AXIS, additionalNodes: ƒ.Node[]} = this._widget.isHitWidgetComponent(_hits);
      this.pickedAxis = result.axis;
      if (this.pickedAxis)
        this.axisIsPicked = true;
      return result.additionalNodes;
    } 

    public isValidSelection(): boolean {
      return this.axisIsPicked || this.isSelectedViaKeyboard;
    }
    
    public getSelectedAxes(): AXIS[] {
      let selectedAxes: AXIS[] = this.selectedAxes.slice();
      if (!this.selectedAxes.includes(this.pickedAxis) && this.axisIsPicked) {
        selectedAxes.push(this.pickedAxis);
      }
      return selectedAxes;
    }

    public addAxisOf(_key: string): boolean {
      let isNewSelection: boolean = false;
      let selectedAxis: AXIS = this.getSelectedAxisBy(_key);
      if (!this.selectedAxes.includes(selectedAxis) && selectedAxis) {
        this.selectedAxes.push(selectedAxis);
        if (this._widget) 
          this._widget.updateWidget(selectedAxis);
        isNewSelection = true;
      }
      return isNewSelection;
    }

    public removeAxisOf(_key: string): void {
      let selectedAxis: AXIS = this.getSelectedAxisBy(_key);
      if (!selectedAxis) 
        return;
      let index: number = this.selectedAxes.indexOf(selectedAxis);
      if (index != -1) {
        if (this._widget) 
          this._widget.removeUnselectedAxis(this.selectedAxes[index]);
        this.selectedAxes.splice(index, 1);
        if (!this.isAxisSelectedViaKeyboard()) 
          this.isSelectedViaKeyboard = false;
      }
    }

    public isAxisSelectedViaKeyboard(): boolean {
      return this.selectedAxes.length > 0;
    }

    private getSelectedAxisBy(_key: string): AXIS {
      let selectedAxis: AXIS;
      switch (_key) {
        case "x": 
          selectedAxis = AXIS.X;
          break;
        case "y": 
          selectedAxis = AXIS.Y;
          break;
        case "z":
          selectedAxis = AXIS.Z;
          break;
      }
      return selectedAxis;
    }
  }
}