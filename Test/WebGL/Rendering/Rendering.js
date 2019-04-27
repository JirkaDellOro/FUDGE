var WebGLRendering;
(function (WebGLRendering) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        ƒ.GLUtil.initializeContext();
        let clrRed = new ƒ.Vector3(255, 0, 0);
        let meshCube0 = new ƒ.MeshCube(2, 1, 1);
        let clrGreen = new ƒ.Vector3(0, 255, 0);
        let meshCube1 = new ƒ.MeshCube(1, 2, 1);
        let clrBlue = new ƒ.Vector3(0, 0, 255);
        let meshCube2 = new ƒ.MeshCube(1, 1, 2);
        let cubeRed = Scenes.createCompleteMeshNode("Red", ƒ.ShaderBasic, clrRed, meshCube0);
        let cubeGreen = Scenes.createCompleteMeshNode("Green", ƒ.ShaderBasic, clrGreen, meshCube1);
        let cubeBlue = Scenes.createCompleteMeshNode("Blue", ƒ.ShaderBasic, clrBlue, meshCube2);
        let parent = new ƒ.Node("Parent");
        parent.appendChild(cubeRed);
        parent.appendChild(cubeGreen);
        parent.appendChild(cubeBlue);
        let camera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        let viewPort = new ƒ.Viewport("TestViewport", parent, camera.getComponent(ƒ.ComponentCamera));
        viewPort.prepare();
        ƒ.WebGL.addBranch(parent);
        ƒ.WebGL.recalculateAllNodeTransforms();
        ƒ.WebGL.drawBranch(parent, camera.getComponent(ƒ.ComponentCamera));
        dumpWebGL("After draw");
        // ƒ.WebGL.updateNode(cubeRed);
        // ƒ.WebGL.removeNode(cubeRed);
    }
    function dumpWebGL(_label) {
        console.group(_label);
        for (let prop in ƒ.WebGL) {
            console.groupCollapsed(prop);
            console.log(ƒ.WebGL[prop]);
            console.groupEnd();
        }
        console.groupEnd();
    }
})(WebGLRendering || (WebGLRendering = {}));
//# sourceMappingURL=Rendering.js.map