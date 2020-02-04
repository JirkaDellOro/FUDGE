namespace ElectronViewport {
    import ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        // create asset
        let branch: ƒ.Node = Scenes.createAxisCross();

        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        // initialize viewport
        let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        cmpCamera.projectCentral(1, 45);
        let canvas: HTMLCanvasElement = Scenes.createCanvas();
        document.body.appendChild(canvas);

        let viewPort: ƒ.Viewport = new ƒ.Viewport();
        viewPort.initialize("TestViewport", branch, cmpCamera, canvas);
        viewPort.draw();
    }
}