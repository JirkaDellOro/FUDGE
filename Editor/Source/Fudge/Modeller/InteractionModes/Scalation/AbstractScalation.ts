namespace Fudge {

  export class AbstractScalation extends IInteractionMode {
    //protected widget: ƒ.Node;
    protected oldPosition: ƒ.Vector3;
    protected distanceToCenterOfNode: number;
    //protected pickedAxes: Axis;
    protected oldColor: ƒ.Color;
    // protected wasPicked: boolean = false;
    protected distanceRayToCenter: ƒ.Vector3;
    protected copyOfSelectedVertices: Map<number, ƒ.Vector3>;
    //protected selectedAxes: Axis[] = [];
    private axesSelectionHandler: AxesSelectionHandler;

    initialize(): void {
      let widget: ScalationWidget = new ScalationWidget();
      // mtx.translation = this.editableNode.mtxLocal.translation;
      // mtx.rotation = this.editableNode.mtxLocal.rotation;
      // widget.addComponent(new ƒ.ComponentTransform(mtx));
      this.viewport.getGraph().addChild(widget);
      this.axesSelectionHandler = new AxesSelectionHandler(widget);
    }

    onmousedown(_event: ƒ.EventPointer): string {
      let posRender: ƒ.Vector2 = this.getPosRenderFrom(_event);
      this.viewport.createPickBuffers();
      this.axesSelectionHandler.pickWidget(this.viewport.pickNodeAt(posRender));

      if (this.axesSelectionHandler.isValidSelection()) {
        this.setValues(_event);
        // this.oldColor = pickedPillar.getComponent(ƒ.ComponentMaterial).clrPrimary;
        // pickedPillar.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(1, 1, 1, 1);
      }

      return (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
    }

    onmouseup(_event: ƒ.EventPointer): void {
      // if (!this.wasPicked) 
      //   return;
      
      this.axesSelectionHandler.wasPicked = false;
    }

    onmove(_event: ƒ.EventPointer): void {
      if (!this.axesSelectionHandler.wasPicked && !this.axesSelectionHandler.isSelectedViaKeyboard) {
        if (this.axesSelectionHandler.isAxisSelectedViaKeyboard()) {
          this.setValues(_event);
          this.axesSelectionHandler.isSelectedViaKeyboard = true;
        }
        return;
      }
      
      let selectedAxes: Axis[] = this.axesSelectionHandler.getSelectedAxes();
      if (selectedAxes.length <= 0) 
        return;
      
      let newPosition: ƒ.Vector3 = this.getNewPosition(_event, this.distanceToCenterOfNode);
      let diff: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(newPosition, this.oldPosition);

      let scaleMatrix: ƒ.Matrix4x4;
      let abs: number = ƒ.Vector3.DOT(diff, this.distanceRayToCenter);
      let scaleVector: ƒ.Vector3 = ƒ.Vector3.ONE();
      for (let pickedAxis of selectedAxes) {
        switch (pickedAxis) {
          case Axis.X:
            scaleVector.x = 1 + abs;
            break;
          case Axis.Y:
            scaleVector.y = 1 + abs;
            break;
          case Axis.Z:
            scaleVector.z = 1 + abs;
            break;
        }
      }
      scaleMatrix = scaleMatrix = ƒ.Matrix4x4.SCALING(scaleVector);
      //let matrix: ƒ.Matrix4x4 = ƒ.Matrix4x4.SCALING(new ƒ.Vector3(1.1, 1, 1));
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.scaleBy(scaleMatrix, this.copyOfSelectedVertices, this.selection);
    }

    onkeydown (_event: ƒ.EventKeyboard): void {
      this.axesSelectionHandler.addAxisOf(_event.key);
    }

    onkeyup(_event: ƒ.EventKeyboard): void {
      this.axesSelectionHandler.removeAxisOf(_event.key);
    }

    cleanup(): void {
      this.viewport.getGraph().removeChild(this.axesSelectionHandler.widget);
    }

    private setValues(_event): void {
      this.distanceToCenterOfNode = this.getDistanceFromCameraToCenterOfNode();
      this.oldPosition = this.getNewPosition(_event, this.distanceToCenterOfNode);
      this.distanceRayToCenter = ƒ.Vector3.DIFFERENCE(this.oldPosition, (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid())
      this.copyOfSelectedVertices = this.copyVertices();
    }
  }
}