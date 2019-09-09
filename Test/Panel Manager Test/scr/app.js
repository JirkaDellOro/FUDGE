/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../UserInterface/Build/FudgeUI"/>
var ƒ = FudgeCore;
var ƒui = FudgeUserInterface;
var Fudge;
(function (Fudge) {
    window.addEventListener("DOMContentLoaded", init);
    let pm = Fudge.PanelManager.instance;
    function init() {
        console.log("createPanel");
        pm.init();
        let p = new Fudge.Panel("myPanel");
        pm.addPanel(p);
        let testPanel = pm.createEmptyPanel("Test");
        pm.addPanel(testPanel);
    }
})(Fudge || (Fudge = {}));
//# sourceMappingURL=app.js.map