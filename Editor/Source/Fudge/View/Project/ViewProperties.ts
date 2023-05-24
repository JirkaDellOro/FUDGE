namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * View the properties of a resource
   * @author Jirka Dell'Oro-Friedl, HFU, 2020  
   */
  export class ViewProperties extends View {
    private resource: ƒ.SerializableResource;

    constructor(_container: ComponentContainer, _state: JsonValue | undefined) {
      super(_container, _state);
      this.fillContent();

      this.dom.addEventListener(ƒui.EVENT.MUTATE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.DELETE, this.hndEvent);
    }

    private fillContent(): void {
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));
      // console.log(this.resource);
      let content: HTMLElement = document.createElement("div");
      content.style.whiteSpace = "nowrap";
      if (this.resource) {
        this.setTitle("Properties | " + this.resource.name);
        if (this.resource instanceof ƒ.Mutable) {
          let fieldset: ƒui.Details = ƒui.Generator.createDetailsFromMutable(this.resource);
          let uiMutable: ControllerDetail = new ControllerDetail(this.resource, fieldset);
          content = uiMutable.domElement;
        } else if (this.resource instanceof DirectoryEntry && this.resource.stats) {
          content.innerHTML += "Size: " + (this.resource.stats["size"] / 1024).toFixed(2) + " KiB<br/>";
          content.innerHTML += "Created: " + this.resource.stats["birthtime"].toLocaleString() + "<br/>";
          content.innerHTML += "Modified: " + this.resource.stats["ctime"].toLocaleString() + "<br/>";
        } else if (this.resource instanceof ƒ.Graph) {
          content.innerHTML = this.resource.toHierarchyString();
        } else if (this.resource instanceof ScriptInfo) {
          for (let key in this.resource.script) {
            let value: ƒ.General = this.resource.script[key];
            if (value instanceof Function)
              value = value.name;
            if (value instanceof Array)
              value = "Array(" + value.length + ")";
            content.innerHTML += key + ": " + value + "<br/>";
          }
        }
      }
      else {
        this.setTitle("Properties");
        content.innerHTML = "Select an internal or external resource to examine properties";
      }
      this.dom.append(content);
    }

    private hndEvent = (_event: CustomEvent): void => {
      switch (_event.type) {
        case EVENT_EDITOR.SELECT:
        case EVENT_EDITOR.DELETE:
          this.resource = <ƒ.SerializableResource>(_event.detail.data);
          this.fillContent();
          break;
        case ƒui.EVENT.MUTATE:
          this.dispatchToParent(EVENT_EDITOR.UPDATE, {});
          break;
        // case EVENT_EDITOR.MODIFY: // let modify pass
        //   return;
        default:
          break;
      }
      _event.stopPropagation();
    }
  }
}