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
          },{
            type: "component",
            componentName: "panel",
            componentState: { text: "Panel 2" }
          },{
            type: "component",
            componentName: "panel",
            componentState: { text: "Panel 3" }
          }
        ]
      }]
    };

    let configViews: GoldenLayout.ItemConfig = {
      type: "row",
      content: [{
        type: "component",
        componentName: "example",
        componentState: { text: "1" }
      }, {
        type: "component",
        componentName: "example",
        componentState: { text: "2" }
      }]
    };

    function panel(_container: GoldenLayout.Container, _state: { text: string }): void {
      let div: HTMLDivElement = document.createElement("div");
      div.style.height = "100%";
      // document.body.appendChild(div);
      _container.getElement().html(div);
      let gl: GoldenLayout = new GoldenLayout(configViews, div);

      gl.registerComponent("example", example);
      // gl.registerComponent("panel", panel);

      gl.init();
    }

    function example(_container: GoldenLayout.Container, _state: { text: string }): void {
      let div: HTMLDivElement = document.createElement("div");
      div.style.backgroundColor = "red";
      div.innerHTML = `<h2>${_state.text}</h2>`;
      _container.getElement().html(div);
    }

    glDoc = new GoldenLayout(configPanel);
    glDoc.registerComponent("panel", panel);
    glDoc.init();
  }
}