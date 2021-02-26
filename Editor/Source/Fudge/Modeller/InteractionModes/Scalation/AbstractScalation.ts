/// <reference path="../InteractionMode.ts" />
namespace Fudge {
  export class AbstractScalation extends InteractionMode {
    public readonly type: INTERACTION_MODE = INTERACTION_MODE.SCALE;
    protected oldPosition: ƒ.Vector3;
    protected distanceCameraToCentroid: number;
    protected distancePointerToCentroid: ƒ.Vector3;
    protected copyOfSelectedVertices: Map<number, ƒ.Vector3>;
    protected axesSelectionHandler: AxesSelectionHandler;
    private centroid: ƒ.Vector3;

    initialize(): void {
      let widget: ScalationWidget = new ScalationWidget();
      let mtx: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
      mtx.translation = mtx.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
      widget.addComponent(new ƒ.ComponentTransform(mtx));
      this.viewport.getGraph().addChild(widget);
      this.axesSelectionHandler = new AxesSelectionHandler(widget);
    }

    onmousedown(_event: ƒ.EventPointer): void {
      let posRender: ƒ.Vector2 = this.getPosRenderFrom(_event);
      this.viewport.createPickBuffers();
      this.axesSelectionHandler.pickWidget(this.viewport.pickNodeAt(posRender));

      if (this.axesSelectionHandler.wasPicked || this.axesSelectionHandler.isAxisSelectedViaKeyboard()) {
        this.setValues(_event);
      }
    }

    onmouseup(_event: ƒ.EventPointer): string {
      let state: string = null;
      if (this.axesSelectionHandler.wasPicked) 
        state = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();

      this.axesSelectionHandler.releaseComponent();
      return state;
    }

    onmove(_event: ƒ.EventPointer): void {
      if (!this.axesSelectionHandler.isValidSelection()) {
        if (this.axesSelectionHandler.isAxisSelectedViaKeyboard()) {
          this.setValues(_event);
          this.axesSelectionHandler.isSelectedViaKeyboard = true;
        }
        return;
      }
      
      let selectedAxes: AXIS[] = this.axesSelectionHandler.getSelectedAxes();
      if (selectedAxes.length <= 0) 
        return;
      
      let currentPosition: ƒ.Vector3 = this.getPointerPosition(_event, this.distanceCameraToCentroid);
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;

      let scaleFactor: number = ƒ.Vector3.DIFFERENCE(currentPosition, this.centroid).magnitude / this.distancePointerToCentroid.magnitude;
      let scaleVector: ƒ.Vector3 = ƒ.Vector3.ONE();
      for (let pickedAxis of selectedAxes) {
        switch (pickedAxis) {
          case AXIS.X:
            scaleVector.x = scaleFactor;
            break;
          case AXIS.Y:
            scaleVector.y = scaleFactor;
            break;
          case AXIS.Z:
            scaleVector.z = scaleFactor;
            break;
        }
      }
      let scaleMatrix: ƒ.Matrix4x4 = ƒ.Matrix4x4.SCALING(scaleVector);
      mesh.scaleBy(scaleMatrix, this.copyOfSelectedVertices, this.selection);
    }

    onkeydown (_pressedKey: string): void {
      this.axesSelectionHandler.addAxisOf(_pressedKey);
    }

    onkeyup(_pressedKey: string): string {
      let state: string = null;
      if (this.axesSelectionHandler.isValidSelection()) {
        state = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
      }
      this.axesSelectionHandler.removeAxisOf(_pressedKey);
      return state;
    }

    getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[] {  
      return [MenuItemsCreator.getNormalDisplayItem(_callback, InteractionMode.normalsAreDisplayed)];
    }

    contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      switch (Number(_item.id)) {
        case MODELLER_MENU.DISPLAY_NORMALS:
          this.toggleNormals();          
          break;
      }
    }

    update(): void {
      this.axesSelectionHandler.widget.mtxLocal.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
    }


    cleanup(): void {
      this.viewport.getGraph().removeChild(this.axesSelectionHandler.widget);
    }

    private setValues(_event: ƒ.EventPointer): void {
      this.distanceCameraToCentroid = this.getDistanceFromCameraToCentroid((<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection));
      this.oldPosition = this.getPointerPosition(_event, this.distanceCameraToCentroid);
      this.centroid = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
      this.distancePointerToCentroid = ƒ.Vector3.DIFFERENCE(this.oldPosition, this.centroid);
      this.copyOfSelectedVertices = this.copyVertices();
    }
  }
}