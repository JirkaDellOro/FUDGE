/// <reference path="../InteractionMode.ts" />
namespace Fudge {
  import ƒui = FudgeUserInterface;
  export class Extrude extends InteractionMode {
    private static selectionRadius: number = 40;
    public readonly type: INTERACTION_MODE = INTERACTION_MODE.EXTRUDE;
    public selection: Array<number>;
    public viewport: ƒ.Viewport;
    public editableNode: ƒ.Node;
    private isExtruded: boolean = false;
    private distanceCameraToCentroid: number;
    private oldPosition: ƒ.Vector3;
    private vertexSelected: boolean = false;
    private orientation: ƒ.Vector3;
    private clientCentroid: ƒ.Vector2;
    private loopIsRunning: boolean = false;

    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>) {
      super(viewport, editableNode, selection);
      this.selector = new Selector(this.editableNode, this.viewport.camera.pivot.translation);
      this.availableMenuitems.set(MODELLER_MENU.INVERT_FACE, this.invertFace.bind(this));
      this.availableMenuitems.set(MODELLER_MENU.REMOVE_FACE, this.removeFace.bind(this));
    }

    onmousedown(_event: ƒ.EventPointer): void {
      let willBeExtruded: boolean = false;
      // start drawing of the interaction circle
      // also restrict the vertex selection if inside the circle was clicked
      if (this.loopIsRunning) {
        if (ƒ.Vector2.DIFFERENCE(new ƒ.Vector2(_event.canvasX, _event.canvasY), this.clientCentroid).magnitude < Extrude.selectionRadius) {
          willBeExtruded = true;
        }
      }
      if (!willBeExtruded) {
        if (this.selector.selectVertices(this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY)), this.selection)) {
          if (this.selection.length >= 2) {
            if (!this.loopIsRunning)
              this.startLoop();
          } else {
            ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.drawSelectionCircle);
            this.loopIsRunning = false;  
          }
          this.vertexSelected = true;
        }
        return;
      }

      if (!this.selection)
        return;

      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      let centroid: ƒ.Vector3 = mesh.getCentroid(this.selection);
      this.clientCentroid = this.viewport.pointWorldToClient(centroid);
      this.distanceCameraToCentroid = this.getDistanceFromCameraToCentroid(centroid);
      this.oldPosition = this.getPointerPosition(_event, this.distanceCameraToCentroid);
      this.orientation = mesh.extrude(this.selection);

      let newSelection: number[] = [];
      for (let i: number = 0; i < this.selection.length; i++) 
        newSelection.push(mesh.uniqueVertices.length - this.selection.length + i);
      this.selection = newSelection;

      ƒ.EventTargetStatic.dispatchEvent(new CustomEvent(ƒui.EVENT.CHANGE, { bubbles: true, detail: this.selection }));
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

      let newPos: ƒ.Vector3 = this.getPointerPosition(_event, this.distanceCameraToCentroid);
      let diff: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(newPos, this.oldPosition);
      let translationVector: ƒ.Vector3 = diff;
      // extrude in the direction of the old normal if a full face was extruded
      // otherwise, do freeform drag n drop
      if (this.orientation && !ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT, ƒ.KEYBOARD_CODE.SHIFT_RIGHT])) {
        translationVector = new ƒ.Vector3(this.orientation.x, this.orientation.y, this.orientation.z);
        let distance: number = ƒ.Vector3.DOT(diff, this.orientation) > 0 ? diff.magnitude : diff.magnitude * -1;
        translationVector.scale(distance);  
      }
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.translateVertices(translationVector, this.selection);
      this.oldPosition = newPos;
    }

    onkeydown(pressedKey: string): void {
      //@ts-ignore
    }
    
    onkeyup(pressedKey: string): string {
      return null;
    }

    update(): void {
      //@ts-ignore
    }

    initialize(): void {
      if (this.selection.length >= 2) {
        this.startLoop();
      }
    }
    
    cleanup(): void {
      ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.drawSelectionCircle);
    }

    private startLoop(): void {
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.drawSelectionCircle);
      this.loopIsRunning = true;
    }

    private drawSelectionCircle = () => {
      this.clientCentroid = this.viewport.pointWorldToClient(((<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection))); 
      let crx2d: CanvasRenderingContext2D = this.viewport.getCanvas().getContext("2d");
      crx2d.strokeStyle = `rgb(255, 255, 125)`;
      crx2d.beginPath();
      crx2d.arc(this.clientCentroid.x, this.clientCentroid.y, Extrude.selectionRadius, 0, 2 * Math.PI);
      crx2d.stroke();    
    }
  }
}