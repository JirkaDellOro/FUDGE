/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../UserInterface/Build/FudgeUI"/>
var Fudge;
/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../UserInterface/Build/FudgeUI"/>
(function (Fudge) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    let pm = PanelManager.instance;
    function init() {
        ƒ.RenderManager.initialize();
        // TODO: At this point of time, the project is just a single node. A project is much more complex...
        let node = null;
        console.log("createPanel");
        pm.init();
        let p = new Panel("myPanel");
        pm.addPanel(p);
        let testPanel = pm.createEmptyPanel("Test");
        pm.addPanel(testPanel);
        let templatePanel = pm.createPanelFromTemplate(new NodePanelTemplate, "Template");
        pm.addPanel(templatePanel);
    }
})(Fudge || (Fudge = {}));
//# sourceMappingURL=app.js.map