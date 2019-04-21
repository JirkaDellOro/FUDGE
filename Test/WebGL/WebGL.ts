namespace WebGL {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        Scenes.createThreeLevelNodeHierarchy();
        Scenes.createViewport();

        let node: ƒ.Node = Scenes.node;

        ƒ.WebGL.addNode(node);
        // ƒ.WebGL.addNode(child);
        console.group("WebGL");
        for (let prop in ƒ.WebGL) {
            console.groupCollapsed(prop);
            console.log(ƒ.WebGL[prop]);
            console.groupEnd();
        }
        console.groupEnd();
    }
}