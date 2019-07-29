namespace NodeResource {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        ƒ.Debug.log("Start");
        ƒ.RenderManager.initialize();

        let branch: ƒ.Node = new ƒ.Node("Root");
        let camera: ƒ.Node = Scenes.createCamera(new ƒ.Vector3(5, 7, 20));
        let canvas: HTMLCanvasElement = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let coSys: ƒ.Node = Scenes.createCoordinateSystem();
        branch.appendChild(coSys);

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", branch, camera.getComponent(ƒ.ComponentCamera), canvas);

        let center: ƒ.Node = createCenterAndSatellite();
        // branch.appendChild(center);

        Fudge["AnimateSatellite"] = AnimateSatellite;
        let resource: ƒ.NodeResource = ƒ.ResourceManager.registerNodeAsResource(center, false);
        for (let z: number = -3; z < 4; z++)
            for (let y: number = -3; y < 4; y++)
                for (let x: number = -3; x < 4; x++) {
                    let instance: ƒ.NodeResourceInstance = new ƒ.NodeResourceInstance(resource);
                    branch.appendChild(instance);
                    instance.cmpTransform.local.translate(new ƒ.Vector3(2 * x, 2 * y, 2 * z));
                    (<ƒ.ComponentMesh>instance.getComponent(ƒ.ComponentMesh)).pivot.scale(ƒ.Vector3.ONE(1));
                    instance.broadcastEvent(new Event("startSatellite"));
                }

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
        (<ƒ.ComponentMesh>center.getComponent(ƒ.ComponentMesh)).pivot.scale(ƒ.Vector3.ONE(0.5));
        let satellite: ƒ.Node = Scenes.createCompleteMeshNode("Satellite", mtrCyan, new ƒ.MeshCube());
        center.appendChild(satellite);
        satellite.addComponent(new AnimateSatellite());
        return center;
    }
}