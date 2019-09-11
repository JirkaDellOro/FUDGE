/// <reference types="../../../@types/jquery"/>
/// <reference types="../../../@types/golden-layout"/>
namespace Fudge {
  // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
  export class PanelManager extends EventTarget {
    static instance: PanelManager = new PanelManager();
    static templates: typeof PanelTemplate[];
    editorLayout: GoldenLayout;
    private panels: Panel[] = [];

    private constructor() {
      super();
    }

    createPanelFromTemplate(_template: PanelTemplate, _name: string): Panel {
      let panel: Panel = new Panel(_name, _template);
      console.log(panel);
      return panel;
    }
    createEmptyPanel(_name: string): Panel {
      let panel: Panel = new Panel(_name);
      return panel;
    }
    addPanel(_p: Panel): void {
      this.panels.push(_p);
      for (let view of _p.views) {
        // console.log(view);
      }
      this.editorLayout.root.contentItems[0].addChild(_p.config);
    }

    addView(_v: View): void {
      console.log("Add View has been called at PM");
      this.editorLayout.root.contentItems[0].getActiveContentItem().addChild(_v.config);
    }

    public init(): void {
      let config: GoldenLayout.Config = {
        content: [{
          type: "stack",
          isClosable: false,
          content: [
            {
              type: "component",
              componentName: "welcome",
              title: "Welcome",
              componentState: {}
            }
          ]
        }]
      };
      this.editorLayout = new GoldenLayout(config);   //This might be a problem because it can't use a specific place to put it.
      this.editorLayout.registerComponent("welcome", welcome);
      this.editorLayout.registerComponent("View", registerViewComponent);
      this.editorLayout.init();
    }
  }

  function welcome(container: GoldenLayout.Container, state: any): void {
    container.getElement().html("<div>Welcome</div>");
  }
  function registerViewComponent(container: GoldenLayout.Container, state: any): void {
    container.getElement().html(state.content);
  }
}