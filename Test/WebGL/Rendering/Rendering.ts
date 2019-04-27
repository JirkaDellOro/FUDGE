namespace WebGLRendering {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        ƒ.GLUtil.initializeContext();

        let clrRed: ƒ.Vector3 = new ƒ.Vector3(255, 0, 0);
        let meshCube0: ƒ.MeshCube = new ƒ.MeshCube(2, 1, 1);
        let clrGreen: ƒ.Vector3 = new ƒ.Vector3(0, 255, 0);
        let meshCube1: ƒ.MeshCube = new ƒ.MeshCube(1, 2, 1);
        let clrBlue: ƒ.Vector3 = new ƒ.Vector3(0, 0, 255);
        let meshCube2: ƒ.MeshCube = new ƒ.MeshCube(1, 1, 2);

        let cubeRed: ƒ.Node = Scenes.createCompleteMeshNode("Red", ƒ.ShaderBasic, clrRed, meshCube0);
        let cubeGreen: ƒ.Node = Scenes.createCompleteMeshNode("Green", ƒ.ShaderBasic, clrGreen, meshCube1);
        let cubeBlue: ƒ.Node = Scenes.createCompleteMeshNode("Blue", ƒ.ShaderBasic, clrBlue, meshCube2);

        let parent: ƒ.Node = new ƒ.Node("Parent");
        parent.appendChild(cubeRed);
        parent.appendChild(cubeGreen);
        parent.appendChild(cubeBlue);

        let camera: ƒ.Node = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        let viewPort: ƒ.Viewport = new ƒ.Viewport("TestViewport", parent, <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera));
        viewPort.prepare();

        ƒ.WebGL.addBranch(parent);
        ƒ.WebGL.recalculateAllNodeTransforms();
        ƒ.WebGL.drawBranch(parent, (<ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera)));

        dumpWebGL("After draw");

        // ƒ.WebGL.updateNode(cubeRed);
        // ƒ.WebGL.removeNode(cubeRed);
    }

    function dumpWebGL(_label: string): void {
        console.group(_label);
        for (let prop in ƒ.WebGL) {
            console.groupCollapsed(prop);
            console.log(ƒ.WebGL[prop]);
            console.groupEnd();
        }
        console.groupEnd();
    }
}