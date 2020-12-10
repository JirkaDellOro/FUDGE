namespace Fudge {
  export class Extrude extends IInteractionMode {
    public readonly type: InteractionMode = InteractionMode.EXTRUDE;
    selection: Array<number>;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;
    private isExtruded: boolean = false;
    private distance: number;
    private oldPosition: ƒ.Vector3;
    private axesSelectionHandler: AxesSelectionHandler;

    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>) {
      super(viewport, editableNode, selection);
      this.initialize();
    }

    onmousedown(_event: ƒ.EventPointer): string {
      if (!this.selection)
        return;
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      this.distance = this.getDistanceFromCameraToCenterOfNode();
      this.oldPosition = this.getNewPosition(_event, this.distance);
      if (this.getDistanceFromRayToCenterOfNode(_event, this.distance).magnitude > 1)
        return;
      let state: string = mesh.getState();
      this.selection = mesh.extrude(this.selection);
      this.isExtruded = true;
      return state;
    }

    onmouseup(_event: ƒ.EventPointer): void {
      if (!this.isExtruded)
        return;
      this.isExtruded = false;
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      // maybe change this after all idk looks weird atm
      mesh.updateNormals();
      //this.createNormalArrows();
    }

    onmove(_event: ƒ.EventPointer): void {
      if (!this.isExtruded) 
        return;

      let newPos: ƒ.Vector3 = this.getNewPosition(_event, this.distance);
      let diff: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(newPos, this.oldPosition);

      let translationVector: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
      let selectedAxes: Axis[] = this.axesSelectionHandler.getSelectedAxes();

      // dunno if we should keep this because atm normal calculation does not work if wrong axes are selected
      for (let axis of selectedAxes) {
        switch (axis) {
          case Axis.X:
            translationVector.x = diff.x;
            break;
          case Axis.Y:
            translationVector.y = diff.y;
            break;
          case Axis.Z:
            translationVector.z = diff.z;
            break;
        }
      }
      if (selectedAxes.length === 0)
        translationVector = diff;

      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;


      mesh.translateVertices(translationVector, this.selection);
      this.oldPosition = newPos;
      // let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      // mesh.updatePositionOfVertices(this.selection, this.copyOfSelectedVertices, this.getDistanceFromRayToCenterOfNode(_event, this.distance), this.offset);
    }

    onkeydown(_event: ƒ.EventKeyboard): string {
      this.axesSelectionHandler.addAxisOf(_event.key);
      return null;
    }
    
    onkeyup(_event: ƒ.EventKeyboard): void {
      this.axesSelectionHandler.removeAxisOf(_event.key);
    }


    initialize(): void {
      this.axesSelectionHandler = new AxesSelectionHandler();
      //this.createNormalArrows();
    }
    
    cleanup(): void {
      for (let node of this.viewport.getGraph().getChildrenByName("normal")) {
        this.viewport.getGraph().removeChild(node);
      }
    }
  }
}