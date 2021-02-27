namespace Fudge {
  import ƒ = FudgeCore;
  export class EditSelection extends AbstractSelection {
    public selection: Array<number> = [];
    private boxStart: ƒ.Vector2;
    private clientPos: ƒ.Vector2;
    private vertexSelected: boolean = false;

    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>) {
      super(viewport, editableNode, selection);
      this.selector = new Selector(this.editableNode, this.viewport.camera.pivot.translation);
      this.availableMenuitems.set(MODELLER_MENU.INVERT_FACE, this.invertFace.bind(this));
      this.availableMenuitems.set(MODELLER_MENU.REMOVE_FACE, this.removeFace.bind(this));
    }

    initialize(): void {
      //
    }

    onmousedown(_event: ƒ.EventPointer): void {
      if (this.selector.selectVertices(this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY)), this.selection)) {
        this.vertexSelected = true;
        return;
      }
      this.boxStart = new ƒ.Vector2(_event.canvasX, _event.canvasY);
      this.clientPos = new ƒ.Vector2(_event.canvasX, _event.canvasY);
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.drawBox);
    }

    onmouseup(_event: ƒ.EventPointer): string {
      if (this.vertexSelected) {
        this.vertexSelected = false;
        return;
      }
      let boxEnd: ƒ.Vector2 = new ƒ.Vector2(_event.canvasX, _event.canvasY);
      let box: ƒ.Rectangle = new ƒ.Rectangle(this.boxStart.x, this.boxStart.y, boxEnd.x - this.boxStart.x, boxEnd.y - this.boxStart.y);

      let uniqueVertices: UniqueVertex[] = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices;
      this.selection = [];
      for (let i: number = 0; i < uniqueVertices.length; i++) {
        if (box.isInside(this.viewport.pointWorldToClient(uniqueVertices[i].position))) {
          this.selection.push(i);
        }
      }

      let event: CustomEvent = new CustomEvent(MODELLER_EVENTS.SELECTION_UPDATE, { bubbles: true, detail: this.selection });
      ƒ.EventTargetStatic.dispatchEvent(
        new CustomEvent(MODELLER_EVENTS.SELECTION_UPDATE, { bubbles: true, detail: {
          selection: this.selection, vertices: (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices}
        })
      );

      ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.drawBox);
      return null;
    }

    onmove(_event: ƒ.EventPointer): void {
      this.clientPos = new ƒ.Vector2(_event.canvasX, _event.canvasY);
    }

    onkeydown(_pressedKey: string): void {
      //
    }

    onkeyup(_pressedKey: string): string {
      let state: string = null;

      // delete this later or refactor it to somewhere else
      switch (_pressedKey) {
        case "delete": 
          (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).removeFace(this.selection);
          this.selection = [];
          state = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
          break;
      }
      return state;
    }

    update(): void {
      //@ts-ignore
    }

    // getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[] {
    //   return [
    //     MenuItemsCreator.getNormalDisplayItem(_callback, InteractionMode.normalsAreDisplayed), 
    //     MenuItemsCreator.getInvertFaceItem(_callback)];
    // }

    // contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
    //   switch (Number(_item.id)) {
    //     case MODELLER_MENU.DISPLAY_NORMALS:
    //       this.toggleNormals();          
    //       break;
    //     case MODELLER_MENU.INVERT_FACE:
    //       (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).invertFace(this.selection);          
    //       break;
    //   }
    // }

    private drawBox = () => {
      let crx2d: CanvasRenderingContext2D = this.viewport.getCanvas().getContext("2d");
      crx2d.strokeStyle = `rgb(220, 220, 220)`;
      crx2d.strokeRect(this.boxStart.x, this.boxStart.y, this.clientPos.x - this.boxStart.x, this.clientPos.y - this.boxStart.y);
    }
  }
}