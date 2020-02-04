/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../UserInterface/Build/FudgeUI"/>



namespace FudgeTest {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    window.addEventListener("DOMContentLoaded", init);
    let pm: PanelManager = PanelManager.instance;

    function init(): void {
        ƒ.RenderManager.initialize();

        // TODO: At this point of time, the project is just a single node. A project is much more complex...
        let node: ƒ.Node = null;
        console.log("createPanel");
        pm.init();
        let p: Panel = new Panel("myPanel");
        pm.addPanel(p);
        let testPanel: Panel = pm.createEmptyPanel("Test");
        pm.addPanel(testPanel);
        let templatePanel: Panel = pm.createPanelFromTemplate(new NodePanelTemplate, "Template");
        pm.addPanel(templatePanel);
    }
}