// /<reference path="../View/View.ts"/>
// /<reference path="../Panel/Panel.ts"/>
import ƒui = FudgeUserInterface;

namespace Fudge {
  import ƒ = FudgeCore;

  /**
  * Panel that functions as a Node Editor. Uses ViewData, ViewPort and ViewNode. 
  * Use NodePanelTemplate to initialize the default NodePanel.
  * @authors Monika Galkewitsch, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
  */
  export class PanelGraph extends Panel {
    private node: ƒ.Node;

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

      this.dom.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.hndSelectNode);
    }

    public setNode(_node: ƒ.Node): void {
      this.node = _node;
    }

    public getNode(): ƒ.Node {
      return this.node;
    }

    public cleanup(): void {
      //TODO: desconstruct
    }

    private hndSelectNode = (_event: CustomEvent): void => {
      this.setNode(_event.detail);
      this.broadcastEvent(_event);
    }
  }
}