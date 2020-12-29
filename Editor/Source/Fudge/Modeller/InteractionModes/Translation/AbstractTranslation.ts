namespace Fudge {
  import ƒAid = FudgeAid;
  export abstract class AbstractTranslation extends IInteractionMode {
    public readonly type: InteractionMode = InteractionMode.TRANSLATE;
    viewport: ƒ.Viewport;
    selection: Array<number>;
    editableNode: ƒ.Node;
    protected dragging: boolean = false;
    protected distance: number;
    // protected copyOfSelectedVertices: Map<number, ƒ.Vector3>;
    protected oldPosition: ƒ.Vector3;
    protected axesSelectionHandler: AxesSelectionHandler;

    initialize(): void {
      let widget: IWidget = new TranslationWidget();
      let mtx: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
      mtx.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
      widget.addComponent(new ƒ.ComponentTransform(mtx));
      this.viewport.getGraph().addChild(widget);
      this.axesSelectionHandler = new AxesSelectionHandler(widget);
    }

    onmousedown(_event: ƒ.EventPointer): string {
      this.viewport.createPickBuffers();
      let posRender: ƒ.Vector2 = this.getPosRenderFrom(_event);
      let nodeWasPicked: boolean = false;
      let additionalNodes: ƒ.Node[] = this.axesSelectionHandler.pickWidget(this.viewport.pickNodeAt(posRender));

      for (let node of additionalNodes) {
        if (node === this.editableNode) 
          nodeWasPicked = true;
      }

      if (nodeWasPicked && !this.axesSelectionHandler.wasPicked) {
        this.dragging = true;
      }
      // this.copyOfSelectedVertices = this.copyVertices();
      this.distance = this.getDistanceFromCameraToCenterOfNode();
      this.oldPosition = this.getPointerPosition(_event, this.distance);
      return (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
    }

    onmouseup(_event: ƒ.EventPointer): void {
      this.dragging = false;
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      this.axesSelectionHandler.releaseComponent();
      mesh.updateNormals();
      this.axesSelectionHandler.widget.mtxLocal.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
      // this.createNormalArrows();
    }

    onmove(_event: ƒ.EventPointer): void {
      if (!this.axesSelectionHandler.isValidSelection() && !this.dragging) {
        if (this.axesSelectionHandler.isAxisSelectedViaKeyboard()) {
          // this.copyOfSelectedVertices = this.copyVertices();
          this.distance = this.getDistanceFromCameraToCenterOfNode();
          this.oldPosition = this.getPointerPosition(_event, this.distance);
          this.axesSelectionHandler.isSelectedViaKeyboard = true;
        }
        return;
      }
      let newPos: ƒ.Vector3 = this.getPointerPosition(_event, this.distance);
      let diff: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(newPos, this.oldPosition);
      let translationVector: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
      let selectedAxes: Axis[] = this.axesSelectionHandler.getSelectedAxes();

      if (!this.dragging) {
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
      } else {
        translationVector = diff;
      }
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.translateVertices(translationVector, this.selection);
      this.oldPosition = newPos;
    }

    onkeydown(_event: ƒ.EventKeyboard): string {
      let result: string = null;
      if (this.axesSelectionHandler.addAxisOf(_event.key)) {
        result = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
      }
      return result;
    }
    
    onkeyup(_event: ƒ.EventKeyboard): void {
      this.axesSelectionHandler.removeAxisOf(_event.key);
      this.axesSelectionHandler.widget.mtxLocal.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
    }

    cleanup(): void {
      this.viewport.getGraph().removeChild(this.axesSelectionHandler.widget);
    }

    // protected copyVerticesAndCalculateDistance(_event: ƒ.EventPointer): void {
    //   this.distance = this.getDistanceFromCameraToCenterOfNode();
    //   let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
    //   let vertices: UniqueVertex[] = mesh.uniqueVertices;
    //   this.copyOfSelectedVertices = new Map();
    //   for (let vertexIndex of this.selection) {
    //     this.copyOfSelectedVertices.set(vertexIndex, new ƒ.Vector3(vertices[vertexIndex].position.x, vertices[vertexIndex].position.y, vertices[vertexIndex].position.z));
    //   }
    // }

  }
}