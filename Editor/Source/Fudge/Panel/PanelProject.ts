namespace Fudge {
  import ƒ = FudgeCore;

  /**
   * Display the project structure and offer functions for creation, deletion and adjustment of resources
   * @authors Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class PanelProject extends Panel {

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);

      this.goldenLayout.registerComponent(VIEW.INTERNAL, ViewInternal);
      this.goldenLayout.registerComponent(VIEW.EXTERNAL, ViewExternal);
      this.goldenLayout.registerComponent(VIEW.PROPERTIES, ViewProperties);
      this.goldenLayout.registerComponent(VIEW.PREVIEW, ViewPreview);

      let inner: GoldenLayout.ContentItem = this.goldenLayout.root.contentItems[0];
      inner.addChild({
        type: "column", content: [
          { type: "component", componentName: VIEW.PREVIEW, componentState: _state, title: "Preview"},
          { type: "component", componentName: VIEW.PROPERTIES, componentState: _state, title: "Properties" }
        ]
      });
      inner.addChild({
        type: "column", content: [
          { type: "component", componentName: VIEW.INTERNAL, componentState: _state, title: "Internal" },
          { type: "component", componentName: VIEW.EXTERNAL, componentState: _state, title: "External" }
        ]
      });
    }
  }
}