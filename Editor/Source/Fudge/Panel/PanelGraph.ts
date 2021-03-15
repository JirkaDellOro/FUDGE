namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
  * Shows a graph and offers means for manipulation
  * @authors Monika Galkewitsch, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
  */
  export class PanelGraph extends Panel {
    private graph: ƒ.Node;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);

      this.goldenLayout.registerComponent(VIEW.RENDER, ViewRender);
      this.goldenLayout.registerComponent(VIEW.COMPONENTS, ViewComponents);
      this.goldenLayout.registerComponent(VIEW.HIERARCHY, ViewHierarchy);

      let inner: GoldenLayout.ContentItem = this.goldenLayout.root.contentItems[0];
      inner.addChild({
        type: "column", content: [{
          type: "component", componentName: VIEW.RENDER, componentState: _state, title: "Render"
        }]
      });
      inner.addChild({
        type: "column", content: [
          { type: "component", componentName: VIEW.HIERARCHY, componentState: _state, title: "Hierarchy" },
          { type: "component", componentName: VIEW.COMPONENTS, componentState: _state, title: "Components" }
        ]
      });

      this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.SET_PROJECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.hndEvent);
      this.dom.addEventListener(ƒui.EVENT.MUTATE, this.hndEvent);
      this.dom.addEventListener(ƒui.EVENT.SELECT, this.hndFocusNode);
      this.dom.addEventListener(ƒui.EVENT.RENAME, this.broadcastEvent);
    }

    public setGraph(_graph: ƒ.Node): void {
      this.graph = _graph;
    }

    public getNode(): ƒ.Node {
      return this.graph;
    }

    private hndEvent = (_event: CustomEvent): void => {
      if (_event.type == EVENT_EDITOR.SET_GRAPH)
        this.setGraph(_event.detail);
      this.broadcastEvent(_event);
      // _event.stopPropagation();
    }
    private hndFocusNode = (_event: CustomEvent): void => {
      let event: CustomEvent = new CustomEvent(EVENT_EDITOR.FOCUS_NODE, {bubbles: false, detail: _event.detail.data});
      this.broadcastEvent(event);
    }
  }
}