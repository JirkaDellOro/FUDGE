/// <reference types="./@types/golden-layout"/>
namespace GLEventTest {
  window.addEventListener("DOMContentLoaded", init);
  let pm: PanelManager = PanelManager.instance;

  function init(){
    console.log("createPanel");
    let p: Panel = new Panel ("myPanel");
    pm.addPanel(p);
    p.addView(new ViewB(p));
    // console.log(pm);
  }
  // let config: GoldenLayout.Config = {
  //   content: [{
  //     type: "stack",
  //     content: [{
  //       type: "row",
  //       title: "Panel1",
  //       componentName: "Top",
  //       content: [{
  //         type: "component",
  //         componentName: "ViewAComp",
  //         title: "ViewA",
  //         componentState: { view: "ViewA" }
  //       }, {
  //         type: "component",
  //         componentName: "ViewBComp",
  //         title: "ViewB",
  //         componentState: { view: "ViewB" }
  //       }, {
  //         type: "component",
  //         componentName: "ViewBComp",
  //         title: "ViewB",
  //         componentState: { view: "ViewB" }
  //       }]
  //     },
  //     {
  //       type: "row",
  //       title: "Panel2",
  //       componentName: "Top",
  //       content: [{
  //         type: "component",
  //         componentName: "ViewAComp",
  //         title: "ViewC",
  //         componentState: { view: "ViewB" }
  //       }, {
  //         type: "component",
  //         componentName: "ViewBComp",
  //         title: "ViewD",
  //         componentState: { view: "ViewB" }
  //       }]
  //     }]
  //   }]
  // }

  // let myLayout: GoldenLayout = new GoldenLayout(config);
  // myLayout.registerComponent("ViewAComp", createComponent);
  // myLayout.registerComponent("ViewBComp", createComponent);
  // myLayout.init();

  // function createComponent(container: GoldenLayout.Container, state: any): void {
  //   container.getElement().html("<object data='Views/" + state.view + "/index.html'></object>");
  // }
}