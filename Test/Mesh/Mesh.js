var Mesh;
(function (Mesh) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", init);
    async function init() {
        let graph = new ƒ.Node("Graph");
        // setup the viewport
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.clrBackground = ƒ.Color.CSS("HSL(240, 20%, 50%)");
        let canvas = document.querySelector("canvas");
        let viewport = new ƒ.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        let camera = ƒAid.Viewport.expandCameraToInteractiveOrbit(viewport);
        camera.distance = 20;
        ƒ.Render.prepare(camera);
        const nodes = new ƒAid.Node("nodes", ƒ.Matrix4x4.IDENTITY());
        let material = new ƒ.Material("texture", ƒ.ShaderLitTextured, new ƒ.CoatTextured());
        let subclass = ƒ.Mesh.subclasses;
        for (let i = 0; i < subclass.length; i++) {
            console.log(subclass[i].name);
            let node = new ƒ.Node(subclass[i].name.replace("Mesh", ""));
            let mesh;
            switch (subclass[i].name) {
                case ƒ.MeshOBJ.name:
                    mesh = await new ƒ.MeshOBJ("Icosphere").load("Icosphere.obj");
                    break;
                default:
                    //@ts-ignore
                    mesh = new subclass[i]();
                    break;
            }
            let cmpMesh = new ƒ.ComponentMesh(mesh);
            let math = new ƒ.ComponentMaterial(material);
            node.addComponent(new ƒ.ComponentTransform());
            node.mtxLocal.translateX(i * 2.5 - 10);
            node.addComponent(cmpMesh);
            node.addComponent(math);
            nodes.addChild(node);
        }
        graph.addChild(nodes);
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start();
        function update(_event) {
            viewport.draw();
        }
    }
})(Mesh || (Mesh = {}));
//# sourceMappingURL=Mesh.js.map