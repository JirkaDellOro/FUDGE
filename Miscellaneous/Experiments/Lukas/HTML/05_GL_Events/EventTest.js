"use strict";
/// <reference types="./@types/golden-layout"/>
var GLEventTest;
/// <reference types="./@types/golden-layout"/>
(function (GLEventTest) {
    window.addEventListener("DOMContentLoaded", init);
    let pm = GLEventTest.PanelManager.instance;
    function init() {
        console.log("createPanel");
        let p = new GLEventTest.Panel("myPanel");
        pm.addPanel(p);
        p.addView(new GLEventTest.ViewB(p));
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
})(GLEventTest || (GLEventTest = {}));
//# sourceMappingURL=EventTest.js.map