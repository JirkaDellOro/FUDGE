var WebGLRendering;
(function (WebGLRendering) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        ƒ.GLUtil.initializeContext();
        let clrRed = new ƒ.Vector3(255, 0, 0);
        let clrGreen = new ƒ.Vector3(0, 255, 0);
        let clrBlue = new ƒ.Vector3(0, 0, 255);
        let color;
        let mtrRed = new ƒ.Material(`rgb(${clrRed.x}, ${clrRed.y}, ${clrRed.z})`, clrRed, ƒ.ShaderBasic);
        let mtrGreen = new ƒ.Material(`rgb(${clrGreen.x}, ${clrGreen.y}, ${clrGreen.z})`, clrGreen, ƒ.ShaderBasic);
        let mtrBlue = new ƒ.Material(`rgb(${clrBlue.x}, ${clrBlue.y}, ${clrBlue.z})`, clrBlue, ƒ.ShaderBasic);
        let meshCube0 = new ƒ.MeshCube(1, 1, 1);
        let meshCube1 = new ƒ.MeshCube(1, 1, 1);
        let meshCube2 = new ƒ.MeshCube(1, 1, 1);
        let cubeRed = Scenes.createCompleteMeshNode("Red", mtrRed, meshCube0);
        let cubeGreen = Scenes.createCompleteMeshNode("Green", mtrGreen, meshCube0);
        let cubeBlue = Scenes.createCompleteMeshNode("Blue", mtrBlue, meshCube1);
        cubeRed.cmpTransform.scaleX(2);
        cubeGreen.cmpTransform.scaleY(2);
        let pivot = new ƒ.ComponentPivot();
        pivot.scaleZ(2);
        cubeBlue.addComponent(pivot);
        cubeBlue.removeComponent(cubeBlue.cmpTransform);
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
        ƒ.WebGL.removeBranch(cubeBlue);
        dumpWebGL("After remove");
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