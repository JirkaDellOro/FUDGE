/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../UserInterface/Build/FudgeUI"/>
var FudgeTest;
/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../UserInterface/Build/FudgeUI"/>
(function (FudgeTest) {
    window.addEventListener("DOMContentLoaded", init);
    let pm = FudgeTest.PanelManager.instance;
    function init() {
        // TODO: At this point of time, the project is just a single node. A project is much more complex...
        let node = null;
        console.log("createPanel");
        pm.init();
        let p = new FudgeTest.Panel("myPanel");
        pm.addPanel(p);
        let testPanel = pm.createEmptyPanel("Test");
        pm.addPanel(testPanel);
        let templatePanel = pm.createPanelFromTemplate(new FudgeTest.NodePanelTemplate, "Template");
        pm.addPanel(templatePanel);
    }
})(FudgeTest || (FudgeTest = {}));
//# sourceMappingURL=app.js.map