namespace ElectronViewport {
    import ƒ = FudgeCore;
    
    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        // create asset
        let graph: ƒ.Node = Scenes.createAxisCross();

        // initialize viewport
        let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        cmpCamera.projectCentral(1, 45);
        let canvas: HTMLCanvasElement = Scenes.createCanvas();
        document.body.appendChild(canvas);

        let viewPort: ƒ.Viewport = new ƒ.Viewport();
        viewPort.initialize("TestViewport", graph, cmpCamera, canvas);
        viewPort.draw();
    }
}