namespace GoldenLayoutTest {
  let glDoc: GoldenLayout;
  window.addEventListener("load", start);

  function start(): void {
    let configPanel: GoldenLayout.Config = {
      content: [{
        type: "row",
        content: [
          {
            type: "component",
            componentName: "panel",
            componentState: { text: "Panel 1" }
          }, {
            type: "component",
            componentName: "panel",
            componentState: { text: "Panel 2" }
          }
        ]
      }]
    };

    class Panel {
      public static config: GoldenLayout.ItemConfig = {
        type: "row",
        content: [{
          type: "stack",
          content: [{
            type: "component",
            componentName: "example",
            componentState: { text: "1" }
          }, {
            type: "component",
            componentName: "example",
            componentState: { text: "2" }
          }, {
            type: "component",
            componentName: "example",
            componentState: { text: "3" }
          }]
        }]
      };

      constructor(_container: GoldenLayout.Container, _state: { text: string }) {
        let div: HTMLDivElement = document.createElement("div");
        div.style.height = "100%";
        div.style.width = "100%";
        _container.getElement().append(div);
        let gl: GoldenLayout = new GoldenLayout(Panel.config, div);
        gl.registerComponent("example", example);

        gl.on("stateChanged", () => gl.updateSize());
        gl.init();
      }
    }

    function example(_container: GoldenLayout.Container, _state: { text: string }): void {
      let div: HTMLDivElement = document.createElement("div");
      div.style.backgroundColor = "red";
      div.innerHTML = `<h2>${_state.text}</h2>`;
      _container.getElement().html(div);
    }

    glDoc = new GoldenLayout(configPanel);
    glDoc.registerComponent("panel", Panel);
    glDoc.init();
  }
}