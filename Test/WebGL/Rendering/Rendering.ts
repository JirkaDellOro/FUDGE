namespace RenderManagerRendering {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    
    function init(): void {
        // create asset
        let branch: ƒ.Node = Scenes.createAxisCross();
        
        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.recalculateAllNodeTransforms();

        // initialize viewport
        let camera: ƒ.Node = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
        let canvas: HTMLCanvasElement = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let viewPort: ƒ.Viewport = new ƒ.Viewport();
        viewPort.initialize("TestViewport", branch, cmpCamera, canvas);

        // prepare and draw viewport
        viewPort.prepare();
        viewPort.draw();

        let table: {} = {
            crc3: { width: ƒ.RenderManager.getCanvas().width, height: ƒ.RenderManager.getCanvas().height },
            crc2: { width: viewPort.getContext().canvas.width, height: viewPort.getContext().canvas.height }
        };
        console.table(table, ["width", "height"]);
    }
}