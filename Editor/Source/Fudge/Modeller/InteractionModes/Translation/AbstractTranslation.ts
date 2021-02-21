namespace Fudge {
  export abstract class AbstractTranslation extends InteractionMode {
    public readonly type: INTERACTION_MODE = INTERACTION_MODE.TRANSLATE;
    public viewport: ƒ.Viewport;
    public selection: Array<number>;
    public editableNode: ƒ.Node;
    protected dragging: boolean = false;
    protected distance: number;
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

    onmousedown(_event: ƒ.EventPointer): void {
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
      this.distance = this.getDistanceFromCameraToCentroid();
      this.oldPosition = this.getPointerPosition(_event, this.distance);
    }

    onmouseup(_event: ƒ.EventPointer): string {
      let state: string = null;
      if (this.axesSelectionHandler.wasPicked || this.dragging) 
        state = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();

      this.dragging = false;
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      this.axesSelectionHandler.releaseComponent();
      mesh.updateNormals();
      this.axesSelectionHandler.widget.mtxLocal.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
      return state;
    }

    onmove(_event: ƒ.EventPointer): void {
      if (!this.axesSelectionHandler.isValidSelection() && !this.dragging) {
        if (this.axesSelectionHandler.isAxisSelectedViaKeyboard()) {
          this.distance = this.getDistanceFromCameraToCentroid();
          this.oldPosition = this.getPointerPosition(_event, this.distance);
          this.axesSelectionHandler.isSelectedViaKeyboard = true;
        }
        return;
      }
      let newPos: ƒ.Vector3 = this.getPointerPosition(_event, this.distance);
      let diff: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(newPos, this.oldPosition);
      let translationVector: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
      let selectedAxes: AXIS[] = this.axesSelectionHandler.getSelectedAxes();

      if (!this.dragging) {
        for (let axis of selectedAxes) {
          switch (axis) {
            case AXIS.X:
              translationVector.x = diff.x;
              break;
            case AXIS.Y:
              translationVector.y = diff.y;
              break;
            case AXIS.Z:
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

    onkeydown(_pressedKey: string): void {
      this.axesSelectionHandler.addAxisOf(_pressedKey);
    }
    
    onkeyup(_pressedKey: string): string {
      let state: string = null;
      if (this.axesSelectionHandler.isValidSelection()) 
        state = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();

      this.axesSelectionHandler.removeAxisOf(_pressedKey);
      this.axesSelectionHandler.widget.mtxLocal.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
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
  }
}