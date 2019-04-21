var WebGL;
(function (WebGL) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        Scenes.createThreeLevelNodeHierarchy();
        Scenes.createViewport();
        let node = Scenes.node;
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
})(WebGL || (WebGL = {}));
//# sourceMappingURL=WebGL.js.map