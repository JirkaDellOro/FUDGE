namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * List the internal resources
   * @author Jirka Dell'Oro-Friedl, HFU, 2020  
   */
  export class ViewInternal extends View {
    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);

      this.dom.addEventListener(EVENT_EDITOR.SET_PROJECT, this.hndEvent);
    }

    public listResources(): void {
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));
      let table: ƒui.Table<ƒ.SerializableResource>;
      table = new ƒui.Table<ƒ.SerializableResource>(new ControllerTableResource(), Object.values(ƒ.Project.resources));
      this.dom.appendChild(table);
    }

    private hndEvent = (_event: CustomEvent): void => {
      switch (_event.type) {
        case EVENT_EDITOR.SET_PROJECT:
          this.listResources();
          break;
        // case ƒui.EVENT.SELECT:
        //   console.log(_event.detail.data);
        //   break;
      }
    }
  }
}