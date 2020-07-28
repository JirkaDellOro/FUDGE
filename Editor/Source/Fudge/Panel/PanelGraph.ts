// /<reference path="../View/View.ts"/>
// /<reference path="../Panel/Panel.ts"/>

namespace Fudge {
  import ƒ = FudgeCore;

  /**
  * Panel that functions as a Node Editor. Uses ViewData, ViewPort and ViewNode. 
  * Use NodePanelTemplate to initialize the default NodePanel.
  * @author Monika Galkewitsch, 2019, HFU
  */
  export class PanelGraph extends Panel {
    private node: ƒ.Node;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);

      this.goldenLayout.registerComponent(VIEW.RENDER, ViewRender);
      this.goldenLayout.registerComponent(VIEW.COMPONENTS, ViewComponents);
      this.goldenLayout.registerComponent(VIEW.HIERARCHY, ViewHierarchy);

      this.views.addChild({
        type: "column", content: [{
          type: "component", componentName: VIEW.RENDER, componentState: _state, title: "Render"
        }]
      });
      this.views.addChild({
        type: "column", content: [
          { type: "component", componentName: VIEW.HIERARCHY, componentState: _state, title: "Hierarchy" },
          { type: "component", componentName: VIEW.COMPONENTS, componentState: _state, title: "Components" }
        ]
      });
    }

    // public static add(): void {
    //   let config: GoldenLayout.ItemConfig = {
    //     type: "stack",
    //     content: [{
    //       type: "component",
    //       componentName: "PanelGraph",
    //       componentState: { text: "Panel 3" },
    //       title: "Panel3"
    //     }]
    //   };
    //   PanelManager.instance.editorLayout.root.contentItems[0].addChild(config);
    //   // glDoc.root.contentItems[0].addChild(config); 
    // }

    public setNode(_node: ƒ.Node): void {
      this.node = _node;
      // for (let view of this.views) {
      //   if (view["setRoot"])
      //     view["setRoot"](this.node);
      // }
    }

    public getNode(): ƒ.Node {
      return this.node;
    }
  }
}