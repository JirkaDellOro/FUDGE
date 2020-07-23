namespace GoldenLayoutTest {
  let glDoc: GoldenLayout;
  window.addEventListener("load", start);

  class Panel extends GoldenLayout {
    public static config: GoldenLayout.ItemConfig = {
      type: "row",
      content: [{
        type: "stack",
        content: [{
          type: "component",
          componentName: "example",
          componentState: { text: "1" },
          title: "Example1"
        }, {
          type: "component",
          componentName: "example",
          componentState: { text: "2" },
          title: "Example2"
        }, {
          type: "component",
          componentName: "example",
          componentState: { text: "3" },
          title: "Example3"
        }]
      }]
    };

    constructor(_container: GoldenLayout.Container = null, _state: { text: string }) {
      // let gl: GoldenLayout = new GoldenLayout(Panel.config, div);
      let div: HTMLDivElement = document.createElement("div");
      super(Panel.config, div);
      // let div: HTMLDivElement = document.createElement("div");
      // console.log(div, this.container);
      console.log(_container);
      div.style.height = "100%";
      div.style.width = "100%";
      if (_container)
        _container.getElement().append(div);
      this.registerComponent("example", example);

      this.on("stateChanged", () => this.updateSize());
      this.init();
    }

    public static add(): void {
      let config: GoldenLayout.ItemConfig = {
        type: "stack",
        content: [{
          type: "component",
          componentName: "panel",
          componentState: { text: "Panel 3" },
          title: "Panel3"
        }]
      };
      glDoc.root.contentItems[0].addChild(config);
    }
  }

  let configPanel: GoldenLayout.Config = {
    content: [{
      type: "row",
      content: [
        {
          type: "component",
          componentName: "panel",
          componentState: { text: "Panel 1" },
          title: "Panel1"
        }, {
          type: "component",
          componentName: "panel",
          componentState: { text: "Panel 2" },
          title: "Panel2"
        }
      ]
    }]
  };

  function start(): void {
    let btnAdd: HTMLButtonElement = document.querySelector("button");
    btnAdd.addEventListener("click", Panel.add);

    glDoc = new GoldenLayout(configPanel);
    glDoc.registerComponent("panel", Panel);
    glDoc.init();
  }

  function example(_container: GoldenLayout.Container, _state: { text: string }): void {
    let div: HTMLDivElement = document.createElement("div");
    div.style.backgroundColor = "red";
    div.innerHTML = `<h2>${_state.text}</h2>`;
    _container.getElement().html(div);
  }
}
