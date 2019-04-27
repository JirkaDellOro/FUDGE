namespace WebGLRendering {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        let canvas: HTMLCanvasElement = Scenes.createCanvas();
        document.body.appendChild(canvas);
        ƒ.WebGLApi.initializeContext();
        // console.log(ƒ.WebGLApi.crc3.canvas.width, ƒ.WebGLApi.crc3.canvas.height);

        let clrRed: ƒ.Vector3 = new ƒ.Vector3(255, 0, 0);
        let clrGreen: ƒ.Vector3 = new ƒ.Vector3(0, 255, 0);
        let clrBlue: ƒ.Vector3 = new ƒ.Vector3(0, 0, 255);
        let color: ƒ.Vector3;
        let mtrRed: ƒ.Material = new ƒ.Material(`rgb(${clrRed.x}, ${clrRed.y}, ${clrRed.z})`, clrRed, ƒ.ShaderBasic);
        let mtrGreen: ƒ.Material = new ƒ.Material(`rgb(${clrGreen.x}, ${clrGreen.y}, ${clrGreen.z})`, clrGreen, ƒ.ShaderBasic);
        let mtrBlue: ƒ.Material = new ƒ.Material(`rgb(${clrBlue.x}, ${clrBlue.y}, ${clrBlue.z})`, clrBlue, ƒ.ShaderBasic);

        let meshCube0: ƒ.MeshCube = new ƒ.MeshCube(1, 1, 1);
        let meshCube1: ƒ.MeshCube = new ƒ.MeshCube(1, 1, 1);
        let meshCube2: ƒ.MeshCube = new ƒ.MeshCube(1, 1, 1);

        let cubeRed: ƒ.Node = Scenes.createCompleteMeshNode("Red", mtrRed, meshCube0);
        let cubeGreen: ƒ.Node = Scenes.createCompleteMeshNode("Green", mtrGreen, meshCube0);
        let cubeBlue: ƒ.Node = Scenes.createCompleteMeshNode("Blue", mtrBlue, meshCube1);

        cubeRed.cmpTransform.scaleX(2);
        cubeGreen.cmpTransform.scaleY(2);
        let pivot: ƒ.ComponentPivot = new ƒ.ComponentPivot();
        pivot.scaleZ(2);
        cubeBlue.addComponent(pivot);
        cubeBlue.removeComponent(cubeBlue.cmpTransform);

        let parent: ƒ.Node = new ƒ.Node("Parent");
        parent.appendChild(cubeRed);
        parent.appendChild(cubeGreen);
        parent.appendChild(cubeBlue);
        
        let camera: ƒ.Node = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        let viewPort: ƒ.Viewport = new ƒ.Viewport();
        let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
        viewPort.initialize("TestViewport", parent, cmpCamera, canvas);
        viewPort.prepare();


        ƒ.WebGL.addBranch(parent);
        ƒ.WebGL.recalculateAllNodeTransforms();
        viewPort.draw();

        dumpWebGL("After draw");

        // ƒ.WebGL.updateNode(cubeRed);
        ƒ.WebGL.removeBranch(cubeBlue);
        dumpWebGL("After remove");
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