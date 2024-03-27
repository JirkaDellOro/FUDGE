namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * Display the project structure and offer functions for creation, deletion and adjustment of resources
   * @authors Jirka Dell'Oro-Friedl, HFU, 2020- 2023
   */
  export class PanelProject extends Panel {
    public constructor(_container: ComponentContainer, _state: ViewState) {
      const constructors = { /* eslint-disable-line */
        [VIEW.INTERNAL_TABLE]: ViewInternalTable,
        [VIEW.INTERNAL_FOLDER]: ViewInternalFolder,
        [VIEW.EXTERNAL]: ViewExternal,
        [VIEW.PROPERTIES]: ViewProperties,
        [VIEW.PREVIEW]: ViewPreview,
        [VIEW.SCRIPT]: ViewScript
      };

      const config: RowOrColumnItemConfig = {
        type: "column",
        content: [{
          type: "row",
          content: [{
            type: "component",
            componentType: VIEW.PROPERTIES,
            title: "Properties"
          }, {
            type: "component",
            componentType: VIEW.PREVIEW,
            title: "Preview"
          }]
        }, {
          type: "row",
          content: [{
            type: "column",
            content: [{
              type: "component",
              componentType: VIEW.EXTERNAL,
              title: "External"
            }, {
              type: "component",
              componentType: VIEW.SCRIPT,
              title: "Script"
            }]
          }, {
            type: "stack",
            content: [{
              type: "component",
              componentType: VIEW.INTERNAL_FOLDER,
              title: "Internal"
            }, {
              type: "component",
              componentType: VIEW.INTERNAL_TABLE,
              title: "Table"
            }]
          }]
        }]
      };

      super(_container, _state, constructors, config);

      this.dom.addEventListener(ƒui.EVENT.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.DELETE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);
      // document.addEventListener(EVENT_EDITOR.CREATE, this.hndEvent); // TODO: explain use of document // removed beacause this keeps the panels alive even when closed
      this.dom.addEventListener(EVENT_EDITOR.CREATE, this.hndEvent);


      this.setTitle("Project | " + project.name);
      this.broadcast(new EditorEvent(EVENT_EDITOR.OPEN, {}));
    }

    private hndEvent = (_event: CustomEvent): void => {
      if (_event.type != EVENT_EDITOR.UPDATE && _event.type != EVENT_EDITOR.CREATE && _event.type != EVENT_EDITOR.DELETE)
        _event.stopPropagation();
      this.setTitle("Project | " + project.name); //why here and everytime?
      if (_event.type == ƒui.EVENT.SELECT) {
        this.broadcast(new EditorEvent(EVENT_EDITOR.SELECT, { detail: _event.detail }));
      }
      else
        this.broadcast(_event);
    };
  }
}