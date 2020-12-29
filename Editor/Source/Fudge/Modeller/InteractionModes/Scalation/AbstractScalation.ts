namespace Fudge {

  export class AbstractScalation extends IInteractionMode {
    //protected widget: ƒ.Node;
    public readonly type: InteractionMode = InteractionMode.SCALE;
    protected oldPosition: ƒ.Vector3;
    protected distanceToCenterOfNode: number;
    protected distanceRayToCenter: ƒ.Vector3;
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

    onmousedown(_event: ƒ.EventPointer): string {
      let posRender: ƒ.Vector2 = this.getPosRenderFrom(_event);
      this.viewport.createPickBuffers();
      this.axesSelectionHandler.pickWidget(this.viewport.pickNodeAt(posRender));

      if (this.axesSelectionHandler.wasPicked || this.axesSelectionHandler.isAxisSelectedViaKeyboard()) {
        this.setValues(_event);
      }

      return (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
    }

    onmouseup(_event: ƒ.EventPointer): void {
      this.axesSelectionHandler.releaseComponent();
    }

    onmove(_event: ƒ.EventPointer): void {
      if (!this.axesSelectionHandler.isValidSelection()) {
        if (this.axesSelectionHandler.isAxisSelectedViaKeyboard()) {
          this.setValues(_event);
          this.axesSelectionHandler.isSelectedViaKeyboard = true;
        }
        return;
      }
      
      let selectedAxes: Axis[] = this.axesSelectionHandler.getSelectedAxes();
      if (selectedAxes.length <= 0) 
        return;
      
      let currentPosition: ƒ.Vector3 = this.getPointerPosition(_event, this.distanceToCenterOfNode);
      let diff: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(currentPosition, this.oldPosition);
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;

      let scaleMatrix: ƒ.Matrix4x4;
      // let abs: number = ƒ.Vector3.DIFFERENCE(diff, this.distanceRayToCenter);

      // TODO: Fix offset and this should be correct
      let abs: number = ƒ.Vector3.DIFFERENCE(currentPosition, this.centroid).magnitude;

      // let abs: number = ƒ.Vector3.DOT(newPosition, this.distanceRayToCenter);
      let scaleVector: ƒ.Vector3 = ƒ.Vector3.ONE();
      for (let pickedAxis of selectedAxes) {
        switch (pickedAxis) {
          case Axis.X:
            scaleVector.x = abs;
            break;
          case Axis.Y:
            scaleVector.y = abs;
            break;
          case Axis.Z:
            scaleVector.z = abs;
            break;
        }
      }
      scaleMatrix = ƒ.Matrix4x4.SCALING(scaleVector);
      mesh.scaleBy(scaleMatrix, this.copyOfSelectedVertices, this.centroid, this.selection);
    }

    onkeydown (_event: ƒ.EventKeyboard): string {
      let result: string = null;
      if (this.axesSelectionHandler.addAxisOf(_event.key)) {
        result = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
      }
      return result;
    }

    onkeyup(_event: ƒ.EventKeyboard): void {
      this.axesSelectionHandler.removeAxisOf(_event.key);
    }

    cleanup(): void {
      this.viewport.getGraph().removeChild(this.axesSelectionHandler.widget);
    }

    private setValues(_event: ƒ.EventPointer): void {
      this.distanceToCenterOfNode = this.getDistanceFromCameraToCenterOfNode();
      this.oldPosition = this.getPointerPosition(_event, this.distanceToCenterOfNode);
      this.centroid = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
      this.distanceRayToCenter = ƒ.Vector3.DIFFERENCE(this.oldPosition, this.centroid);
      this.copyOfSelectedVertices = this.copyVertices();
    }
  }
}