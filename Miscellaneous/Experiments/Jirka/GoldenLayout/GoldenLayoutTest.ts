// /<reference path="Panel.ts"/>
namespace GoldenLayoutTest {
  export let glDoc: GoldenLayout;
  window.addEventListener("load", start);

  let configPanel: GoldenLayout.Config = {
    content: [{
      type: "row",
      content: [
        {
          type: "component",
          componentName: "Panel",
          componentState: { text: "Panel 1" },
          title: "Panel1"
        // }, {
        //   type: "component",
        //   componentName: "Panel",
        //   componentState: { text: "Panel 2" },
        //   title: "Panel2"
        }
      ]
    }]
  };

  function start(): void {
    let btnAdd: HTMLButtonElement = document.querySelector("button");
    btnAdd.addEventListener("click", Panel.add);

    glDoc = new GoldenLayout(configPanel);
    glDoc.registerComponent("Panel", Panel);
    glDoc.init();
  }
}
