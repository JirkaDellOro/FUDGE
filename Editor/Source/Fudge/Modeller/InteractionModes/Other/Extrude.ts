/// <reference path="../InteractionMode.ts" />
namespace Fudge {
  import ƒui = FudgeUserInterface;
  export class Extrude extends InteractionMode {
    public readonly type: INTERACTION_MODE = INTERACTION_MODE.EXTRUDE;
    public selection: Array<number>;
    public viewport: ƒ.Viewport;
    public editableNode: ƒ.Node;
    private isExtruded: boolean = false;
    private distance: number;
    private oldPosition: ƒ.Vector3;
    private axesSelectionHandler: AxesSelectionHandler;
    private vertexSelected: boolean = false;
    private orientation: ƒ.Vector3;

    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>) {
      super(viewport, editableNode, selection);
      // TODO: check if pivot is still correct or if we need to use the container
      this.selector = new Selector(this.editableNode, this.viewport.camera.pivot.translation);
    }

    onmousedown(_event: ƒ.EventPointer): void {
      if (this.selector.selectVertices(this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY)), this.selection)) {
        this.vertexSelected = true;
        return null;
      }

      if (!this.selection)
        return;
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      this.distance = this.getDistanceFromCameraToCentroid();
      this.oldPosition = this.getPointerPosition(_event, this.distance);
      if (this.getDistanceFromRayToCenterOfNode(_event, this.distance).magnitude > 1)
        return;
      this.orientation = mesh.extrude(this.selection);

      let newSelection: number[] = [];
      for (let i: number = 0; i < this.selection.length; i++) 
        newSelection.push(mesh.uniqueVertices.length - this.selection.length + i);
      this.selection = newSelection;

      let event: CustomEvent = new CustomEvent(ƒui.EVENT.CHANGE, { bubbles: true, detail: this.selection });
      ƒ.EventTargetStatic.dispatchEvent(event);
      this.isExtruded = true;
    }

    onmouseup(_event: ƒ.EventPointer): string {
      if (this.vertexSelected) {
        this.vertexSelected = false;
        return;
      }
      if (!this.isExtruded)
        return;
      this.isExtruded = false;
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.updateNormals();
      return mesh.getState();
    }

    onmove(_event: ƒ.EventPointer): void {
      if (this.vertexSelected || !this.isExtruded)
        return;

      let newPos: ƒ.Vector3 = this.getPointerPosition(_event, this.distance);
      let diff: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(newPos, this.oldPosition);

      let translationVector: ƒ.Vector3 = new ƒ.Vector3(this.orientation.x, this.orientation.y, this.orientation.z);
      let selectedAxes: AXIS[] = this.axesSelectionHandler.getSelectedAxes();
      //let translationVector: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);

      let distance: number = ƒ.Vector3.DOT(diff, this.orientation) > 0 ? diff.magnitude : diff.magnitude * -1;
      translationVector.scale(distance);
      // diff.x *= Math.abs(this.orientation.x);
      // diff.y *= Math.abs(this.orientation.y);
      // diff.z *= Math.abs(this.orientation.z);
      // for (let axis of selectedAxes) {
      //   switch (axis) {
      //     case Axis.X:
      //       translationVector.x = diff.x;
      //       break;
      //     case Axis.Y:
      //       translationVector.y = diff.y;
      //       break;
      //     case Axis.Z:
      //       translationVector.z = diff.z;
      //       break;
      //   }
      // }
      // if (selectedAxes.length === 0)
      //   translationVector = diff;
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT, ƒ.KEYBOARD_CODE.SHIFT_RIGHT])) 
        translationVector = diff;
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.translateVertices(translationVector, this.selection);
      this.oldPosition = newPos;
    }

    onkeydown(pressedKey: string): void {
      this.axesSelectionHandler.addAxisOf(pressedKey);
    }
    
    onkeyup(pressedKey: string): string {
      this.axesSelectionHandler.removeAxisOf(pressedKey);
      return null;
    }

    getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[] {  
      return [
        MenuItemsCreator.getNormalDisplayItem(_callback, InteractionMode.normalsAreDisplayed), 
        MenuItemsCreator.getInvertFaceItem(_callback)];
    }

    contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      switch (Number(_item.id)) {
        case MODELLER_MENU.DISPLAY_NORMALS:
          this.toggleNormals();          
          break;
        case MODELLER_MENU.INVERT_FACE: 
          (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).invertFace(this.selection);          
          break;


      }
    }

    update(): void {
      //@ts-ignore
    }

    initialize(): void {
      this.axesSelectionHandler = new AxesSelectionHandler();
    }
    
    cleanup(): void {
      for (let node of this.viewport.getGraph().getChildrenByName("normal")) {
        this.viewport.getGraph().removeChild(node);
      }
    }
  }
}