namespace NodeResource {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        ƒ.Debug.log("Start");
        ƒ.RenderManager.initialize();

        let branch: ƒ.Node = new ƒ.Node("Root");
        let camera: ƒ.Node = Scenes.createCamera();
        let canvas: HTMLCanvasElement = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let coSys: ƒ.Node = Scenes.createCoordinateSystem();
        branch.appendChild(coSys);

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", branch, camera.getComponent(ƒ.ComponentCamera), canvas);

        let center: ƒ.Node = createCenterAndSatellite();
        branch.appendChild(center);

        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
        ƒ.Loop.start();

        function update(_event: Event): void {
            ƒ.RenderManager.update();
            viewport.draw();
        }
    }

    function createCenterAndSatellite(): ƒ.Node {
        let mtrOrange: ƒ.Material = new ƒ.Material("Orange", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0.5, 0, 1)));
        let mtrCyan: ƒ.Material = new ƒ.Material("Cyan", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, 0.5, 1, 1)));
        let center: ƒ.Node = Scenes.createCompleteMeshNode("Center", mtrOrange, new ƒ.MeshPyramid());
        let satellite: ƒ.Node = Scenes.createCompleteMeshNode("Satellite", mtrCyan, new ƒ.MeshCube());
        satellite.addComponent(new AnimateSatellite());
        center.appendChild(satellite);
        return center;
    }
}