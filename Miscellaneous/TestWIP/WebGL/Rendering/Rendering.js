var RenderRendering;
(function (RenderRendering) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        // create asset
        let graph = Scenes.createAxisCross();
        // initialize viewport
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        cmpCamera.projectCentral(1, 45);
        let canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let viewPort = new ƒ.Viewport();
        viewPort.initialize("TestViewport", graph, cmpCamera, canvas);
        // prepare and draw viewport
        //viewPort.prepare();
        viewPort.draw();
        let table = {
            crc3: { width: ƒ.Render.getCanvas().width, height: ƒ.Render.getCanvas().height },
            crc2: { width: viewPort.getContext().canvas.width, height: viewPort.getContext().canvas.height }
        };
        console.table(table, ["width", "height"]);
    }
})(RenderRendering || (RenderRendering = {}));
//# sourceMappingURL=Rendering.js.map