namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export class PanelModeller extends Panel {

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);

      this.goldenLayout.registerComponent(VIEW.MODELLER, ViewModellerScene);
      this.goldenLayout.registerComponent(VIEW.HIERARCHY, ViewHierarchy);
      this.goldenLayout.registerComponent(VIEW.PROPERTIES, ViewProperties);


      let inner: GoldenLayout.ContentItem = this.goldenLayout.root.contentItems[0];
      inner.addChild({
        type: "column", content: [{
          type: "component", componentName: VIEW.MODELLER, componentState: _state, title: "Scene"
        }]
      });
      inner.addChild({
        type: "column", content: [
          { type: "component", componentName: VIEW.HIERARCHY, componentState: _state, title: "Hierarchy" },
          { type: "component", componentName: VIEW.PROPERTIES, componentState: _state }
      ]
      });
    }

    protected cleanup(): void {
      throw new Error("Method not implemented.");
    }

    
  }
}