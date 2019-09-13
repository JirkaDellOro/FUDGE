/// <reference types="../@types/golden-layout"/>

namespace GLEventTest {
  export class View {
    config: any;
    parentPanel: Panel;
    content: HTMLElement;
    type: string;

    constructor(_parent: Panel) {
      this.parentPanel = _parent;
      this.fillContent();
      this.type = this.constructor.name;
      this.config = {
        type: "component",
        title: this.type,
        componentName: "View",
        componentState: {content: this.content, test: 123}
      };
    }

    fillContent(): void {
      this.content = document.createElement("div");
      this.content.innerHTML = "<h1>View</h1>";
    }

    deconstruct(): void {

    }
  }

  export class Panel extends EventTarget {
    views: View[] = [];
    config: GoldenLayout.ItemConfig;

    constructor(_name: string) {
      super();
      this.config = {
        type: "column",
        content: [],
        title: _name
      };
      let va: ViewA = new ViewA(this);
      // console.log(va);
      this.addView(va, false);

    }

    addView(_v: View, _pushToPanelManager: boolean = true) {
      this.views.push(_v);
      this.config.content.push(_v.config);
      if(_pushToPanelManager){
        PanelManager.instance.addView(_v);
      }
    }
  }

  export class PanelManager extends EventTarget {
    static instance: PanelManager = new PanelManager();
    gl: GoldenLayout;
    private panels: Panel[] = [];

    private constructor() {
      super();
      let config: GoldenLayout.Config = {
        content: [{
          type: "stack",
          isClosable: false,
          content: [{
            type: "component",
            componentName: "welcome",
            title: "Welcome"
          }]
        }]
      }
      this.gl = new GoldenLayout(config);   //This might be a problem because it can't use a specific place to put it.
      this.gl.registerComponent("welcome", createWelcomeComponent);
      this.gl.registerComponent("View", createViewComponent);
      this.gl.init();
      // console.log("init: root?", this.gl.root);
    }

    addPanel(_p: Panel) {
      this.panels.push(_p);
      // console.log(this.root);
      // this.root.addChild(_p.config);
      // debugger;
      // this.gl.createContentItem(_p.config)
      // console.log(_p.config);
      this.gl.root.contentItems[0].addChild(_p.config);
    }
    
    addView(_v: View){
      this.gl.root.contentItems[0].getActiveContentItem().addChild(_v.config);
    }
  }
  function createWelcomeComponent(container: GoldenLayout.Container): void {
    container.getElement().html("<h1>Welcome. this is a test</h1>");
  }
  function createViewComponent(container: GoldenLayout.Container, state: any) {
    // console.log(state);
    container.getElement().append(state.content);
    // container.getElement().html("<h1>This is a view!</h1>")
  }
}