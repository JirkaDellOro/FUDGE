namespace GoldenLayoutTest {
  export class Panel extends GoldenLayout {
    public static config: GoldenLayout.ItemConfig = {
      type: "row",
      content: [/*{
        type: "column", content: [{
          type: "column", content: [{
            type: "component", componentName: "ViewA", componentState: { text: "1" }, title: "View1"
          }]
        }, {
          type: "row", content: [{
            type: "component", componentName: "ViewB", componentState: { text: "2" }, title: "View2"
          }, {
            type: "component", componentName: "ViewC", componentState: { text: "3" }, title: "View3"
          }]
        }]
      }*/]
    };

    constructor(_container: GoldenLayout.Container, _state: { text: string }) {
      // let gl: GoldenLayout = new GoldenLayout(Panel.config, div);
      let div: HTMLDivElement = document.createElement("div");
      super(Panel.config, div);
      // let div: HTMLDivElement = document.createElement("div");
      // console.log(div, this.container);
      console.log(_container);
      div.style.height = "100%";
      div.style.width = "100%";

      _container.getElement().append(div);
      this.registerComponent("ViewA", ViewA);
      this.registerComponent("ViewB", ViewB);
      this.registerComponent("ViewC", ViewC);

      this.on("stateChanged", this.hndStateChange.bind(this));
      this.init();

      document.addEventListener("keydown", this.hndKeyDown.bind(this));
      this.root.addChild({ type: "row", content: [] });
      this.root.contentItems[0].addChild({
        type: "column", content: [{
          type: "component", componentName: "ViewA", componentState: { text: "1" }, title: "View1"
        }]
      });
      this.root.contentItems[0].addChild({
        type: "column", content: [
          { type: "component", componentName: "ViewB", componentState: { text: "2" }, title: "View2" },
          { type: "component", componentName: "ViewC", componentState: { text: "3" }, title: "View3" }
        ]
      });
      // let column: GoldenLayout.ItemConfig = this.createContentItem({ type: "column", content: [] });

    }


    public static add(): void {
      let config: GoldenLayout.ItemConfig = {
        type: "stack",
        content: [{
          type: "component",
          componentName: "Panel",
          componentState: { text: "Panel 3" },
          title: "Panel3"
        }]
      };
      glDoc.root.contentItems[0].addChild(config);
    }

    private hndStateChange(): void {
      // console.log(this);
      this.updateSize();
    }

    private hndKeyDown(): void {
      console.log(this.toConfig());
    }
  }

}