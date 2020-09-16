namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export class PanelModeller extends Panel {

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);

      this.goldenLayout.registerComponent(VIEW.MODELLER, ViewModellerScene);
      this.goldenLayout.registerComponent(VIEW.HIERARCHY, ViewHierarchy);

      let inner: GoldenLayout.ContentItem = this.goldenLayout.root.contentItems[0];
      inner.addChild({
        type: "column", content: [{
          type: "component", componentName: VIEW.MODELLER, componentState: _state, title: "Modeller"
        }]
      });
      inner.addChild({
        type: "column", content: [{ 
          type: "component", componentName: VIEW.HIERARCHY, componentState: _state, title: "Hierarchy" 
        }]
      });
    }

    protected cleanup(): void {
      throw new Error("Method not implemented.");
    }

    
  }
}