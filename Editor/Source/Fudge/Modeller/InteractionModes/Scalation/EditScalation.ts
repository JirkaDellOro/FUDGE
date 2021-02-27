namespace Fudge {
  export class EditScalation extends AbstractScalation {
    private vertexSelected: boolean = false;
    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>) {
      super(viewport, editableNode, selection);
      this.selector = new Selector(this.editableNode, this.viewport.camera.pivot.translation);
      this.availableMenuitems.set(MODELLER_MENU.INVERT_FACE, this.invertFace.bind(this));
      this.availableMenuitems.set(MODELLER_MENU.REMOVE_FACE, this.removeFace.bind(this));
    }

    onmousedown (_event: ƒ.EventPointer): void {
      if (this.selector.selectVertices(this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY)), this.selection)) {
        this.vertexSelected = true;
        this.axesSelectionHandler.widget.mtxLocal.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
        return;
      }

      super.onmousedown(_event);
    }

    onmove(_event: ƒ.EventPointer): void {
      if (this.vertexSelected)
        return;
      
      super.onmove(_event);
    }

    onmouseup(_event: ƒ.EventPointer): string {
      if (this.vertexSelected) {
        this.vertexSelected = false;
        return;
      }

      return super.onmouseup(_event);
    }

    // getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[] {
    //   return [...super.getContextMenuItems(_callback), MenuItemsCreator.getInvertFaceItem(_callback)];
    // }

    // contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
    //   switch (Number(_item.id)) {
    //     case MODELLER_MENU.INVERT_FACE:
    //       (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).invertFace(this.selection);          
    //       break;
    //   }
    //   super.contextMenuCallback(_item, _window, _event);
    // }
  }
}