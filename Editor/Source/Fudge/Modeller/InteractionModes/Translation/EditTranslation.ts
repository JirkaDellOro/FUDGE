namespace Fudge {
  import ƒAid = FudgeAid;
  export class EditTranslation extends AbstractTranslation {
    private vertexSelected: boolean = false;
    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>) {
      super(viewport, editableNode);
      this.selector = new Selector(this.editableNode, this.viewport.camera.pivot.translation);
    }

    onmousedown (_event: ƒ.EventPointer): void {
      if (this.selector.selectVertices(this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY)), this.selection)) {
        this.vertexSelected = true;
        this.axesSelectionHandler.widget.mtxLocal.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
        return null;
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

    getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[] {
      let item2: Electron.MenuItem;  
      item2 = new remote.MenuItem({
        label: "test",
        click: _callback
      });

      return [...super.getContextMenuItems(_callback), MenuItemsCreator.getInvertNormalsItem(_callback)];
    }

    contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      switch (Number(_item.id)) {
        case ModellerMenu.INVERT_NORMALS:
          (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).invertNormals(this.selection);          
          break;
      }
      super.contextMenuCallback(_item, _window, _event);
    }

  }
}