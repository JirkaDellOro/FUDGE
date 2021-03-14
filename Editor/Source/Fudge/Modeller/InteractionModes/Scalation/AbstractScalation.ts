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
      this.viewport.getBranch().addChild(widget);
      this.axesSelectionHandler = new AxesSelectionHandler(widget);
    }

    onmousedown(_event: ƒ.EventPointer): void {
      //let posRender: ƒ.Vector2 = this.getPosRenderFrom(_event);
      this.axesSelectionHandler.pickWidget(ƒ.Picker.pickViewport(this.viewport, new ƒ.Vector2(_event.canvasX, _event.canvasY)));

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
      
      // return the difference between the new and the old mouseposition
      // scale the according axis with this factor
      let currentPosition: ƒ.Vector3 = this.getPointerPosition(_event, this.distanceCameraToCentroid);
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
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      scaleMatrix.translation = new ƒ.Vector3(this.centroid.x * (1 - scaleVector.x), this.centroid.y * (1 - scaleVector.y), this.centroid.z * (1 - scaleVector.z));
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
      this.axesSelectionHandler.removeAxisOf(_pressedKey, true);
      return state;
    }

    update(): void {
      this.axesSelectionHandler.widget.mtxLocal.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
    }


    cleanup(): void {
      this.viewport.getBranch().removeChild(this.axesSelectionHandler.widget);
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