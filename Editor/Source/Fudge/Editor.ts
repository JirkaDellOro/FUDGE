namespace Fudge {
  export enum EVENT_EDITOR {
    REMOVE = "removeNode",
    HIDE = "hideNode",
    ACTIVATE_VIEWPORT = "activateViewport",
    SET_GRAPH = "setGraph",
    FOCUS_NODE = "focusNode"
  }
  /**
   * The uppermost container for all panels 
   * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class Editor {
    private static idCounter: number = 0;
    private static goldenLayout: GoldenLayout;
    private static panels: Panel[] = [];

    public static add(_panel: typeof Panel, _title: string, _state?: Object): void {
      let config: GoldenLayout.ItemConfig = {
        type: "stack",
        content: [{
          type: "component", componentName: _panel.name, componentState: _state,
          title: _title, id: this.generateID(_panel.name)
        }]
      };

      let inner: GoldenLayout.ContentItem = this.goldenLayout.root.contentItems[0];
      let item: GoldenLayout.ContentItem = Editor.goldenLayout.createContentItem(config);
      inner.addChild(item);
      this.panels.push(item.getComponentsByName(_panel.name)[0]);
    }

    public static initialize(): void {
      let config: GoldenLayout.Config = {
        settings: { showPopoutIcon: false },
        content: [{
          id: "root", type: "row", isClosable: false,
          content: [
            { type: "component", componentName: "Welcome", title: "Welcome", componentState: {} }]
        }]
      };
      this.goldenLayout = new GoldenLayout(config);   //This might be a problem because it can't use a specific place to put it.

      this.goldenLayout.registerComponent("Welcome", welcome);
      this.goldenLayout.registerComponent(PANEL.GRAPH, PanelGraph);
      this.goldenLayout.init();
    }

    /** Send custom copies of the given event to the views */
    public static broadcastEvent(_event: Event): void {
      for (let panel of Editor.panels) {
        let event: CustomEvent = new CustomEvent(_event.type, { bubbles: false, cancelable: true, detail: (<CustomEvent>_event).detail });
        panel.dom.dispatchEvent(event);
      }
    }

    private static generateID(_name: string): string {
      return _name + Editor.idCounter++;
    }

    public cleanup(): void {
      //TODO: desconstruct
    }
  }

  function welcome(container: GoldenLayout.Container, state: Object): void {
    container.getElement().html("<div>Welcome</div>");
  }
}