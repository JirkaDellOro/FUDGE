/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../UserInterface/Build/FudgeUI"/>

import ƒ = FudgeCore;
import ƒui = FudgeUserInterface;

namespace Fudge {
    window.addEventListener("DOMContentLoaded", init);
    let pm: PanelManager = PanelManager.instance;

    function init(): void {
        console.log("createPanel");
        pm.init();
        let p: Panel = new Panel("myPanel");
        pm.addPanel(p);
        let testPanel: Panel = pm.createEmptyPanel("Test");
        pm.addPanel(testPanel);
    }
}