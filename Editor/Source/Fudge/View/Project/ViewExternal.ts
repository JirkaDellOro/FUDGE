namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * List the external resources
   * @author Jirka Dell'Oro-Friedl, HFU, 2020  
   */
  export class ViewExternal extends View {
    private tree: ƒui.CustomTree<DirectoryEntry>;

    #expanded: string[]; // cache state from constructor

    public constructor(_container: ComponentContainer, _state: ViewState) {
      super(_container, _state);

      this.dom.addEventListener(EVENT_EDITOR.OPEN, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);

      this.#expanded = _state["expanded"];
    }

    public setProject(): void {
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));
      let path: string = new URL(".", ƒ.Project.baseURL).pathname;
      if (navigator.platform == "Win32" || navigator.platform == "Win64") {
        path = path.substr(1); // strip leading slash
      }
      let root: DirectoryEntry = DirectoryEntry.createRoot(path);
      this.tree = new ƒui.CustomTree<DirectoryEntry>(new ControllerTreeDirectory(), root);
      this.dom.appendChild(this.tree);
      this.tree.getItems()[0].expand(true);

      this.dom.title = `Drag & drop external image, audiofile etc. to the "Internal", to create a FUDGE-resource`;

      if (this.#expanded)
        this.expand(this.#expanded);
    }

    public getSelection(): DirectoryEntry[] {
      return this.tree.controller.selection;
    }

    public getDragDropSources(): DirectoryEntry[] {
      return this.tree.controller.dragDrop.sources;
    }

    protected getState(): ViewState {
      let state: ViewState = super.getState();
      state["expanded"] = this.getExpanded();
      return state;
    }

    private hndEvent = (_event: CustomEvent): void => {
      if (_event.detail.data)  // TODO: inspect if this is ever the case?
        return;
      // nothing actually selected...
      switch (_event.type) {
        case EVENT_EDITOR.OPEN:
          this.setProject();
          break;
        case EVENT_EDITOR.MODIFY:
          this.tree.refresh();
          break;
      }
    };

    private getExpanded(): string[] {
      const expanded: string[] = [];
      for (let item of this.tree) {
        if (item.expanded)
          expanded.push(item.data.pathRelative);
      }
      return expanded;
    }

    private expand(_paths: string[]): void {
      const paths: DirectoryEntry[][] = _paths.map(_path => new DirectoryEntry("", _path, null, null).getPath());
      this.tree.expand(paths);
    }
  }
}