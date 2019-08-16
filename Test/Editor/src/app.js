// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// / <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../@types/golden-layout"/>
// console.log(Fudge);
var UI;
// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// / <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../@types/golden-layout"/>
// console.log(Fudge);
(function (UI) {
    var ƒ = FudgeCore;
    let myLayout;
    let savedState;
    let branch;
    let canvas;
    let viewPort = new ƒ.Viewport();
    let camera;
    window.addEventListener("load", init);
    function init() {
        let config = {
            content: [{
                    type: "row",
                    content: [{
                            type: "component",
                            componentName: "Inspector",
                            title: "Inspector"
                        },
                        {
                            type: "component",
                            componentName: "Viewport",
                            title: "Viewport"
                        }
                    ]
                }]
        };
        initViewport();
        myLayout = new GoldenLayout(config);
        myLayout.registerComponent("Viewport", createViewportComponent);
        myLayout.registerComponent("Inspector", createInspectorComponent);
        myLayout.init();
    }
    function initViewport() {
        // create branch
        branch = new ƒ.Node("Scene");
        branch.addComponent(new ƒ.ComponentTransform());
        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();
        // initialize viewports
        canvas = document.createElement("canvas");
        canvas.height = 800;
        canvas.width = 1200;
        document.body.append(canvas);
        //Set up Camera for Scene
        camera = new ƒ.Node("Camera");
        let cmpTransform = new ƒ.ComponentTransform();
        cmpTransform.local.translate(new ƒ.Vector3(1, 1, 10));
        cmpTransform.local.lookAt(new ƒ.Vector3());
        camera.addComponent(cmpTransform);
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.projectCentral(1, 45, ƒ.FIELD_OF_VIEW.DIAGONAL);
        camera.addComponent(cmpCamera);
        addCubeNode();
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);
        viewPort.adjustingFrames = false;
        viewPort.adjustingCamera = false;
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, animate);
        ƒ.Loop.start();
    }
    function createViewportComponent(container, state) {
        container.getElement().append(canvas);
    }
    function createInspectorComponent(container, state) {
        console.log(branch.getChildren()[0].name);
        let lbl_name = document.createElement("label");
        lbl_name.innerHTML = "Node Name";
        let txt_name = document.createElement("input");
        txt_name.value = branch.getChildren()[0].name;
        container.getElement().append(lbl_name);
        container.getElement().append(txt_name);
    }
    function animate(_event) {
        branch.cmpTransform.local.rotateY(1);
        ƒ.RenderManager.update();
        // prepare and draw viewport
        viewPort.draw();
    }
    function addCubeNode() {
        let meshCube = new ƒ.MeshCube();
        let clrCoffee = new ƒ.Color(0.35, 0.17, 0.03, 1);
        let coatCoffee = new ƒ.CoatColored(clrCoffee);
        let mtrCoffee = new ƒ.Material("Coffee", ƒ.ShaderUniColor, coatCoffee);
        // let clrCaramel: Fudge.Color = new Fudge.Color(0.35, 0.17, 0.03, 1);
        // let coatCaramel: Fudge.CoatColored = new Fudge.CoatColored(clrCaramel);
        // let mtrCaramel: Fudge.Material = new Fudge.Material("Caramel", Fudge.ShaderUniColor, coatCaramel);
        // let clrCream: Fudge.Color = new Fudge.Color(0.35, 0.17, 0.03, 1);
        // let coatCream: Fudge.CoatColored = new Fudge.CoatColored(clrCream);
        // let mtrCream: Fudge.Material = new Fudge.Material("Caramel", Fudge.ShaderUniColor, coatCream);
        let nodeCubeCoffee = new ƒ.Node("Cube");
        // let nodeCubeCaramel: Fudge.Node = new Fudge.Node("Cube");
        // let nodeCubeCream: Fudge.Node = new Fudge.Node("Cube");
        let cmpMeshCoffee = new ƒ.ComponentMesh(meshCube);
        let cmpMaterialCoffee = new ƒ.ComponentMaterial(mtrCoffee);
        let cmpTransformCoffee = new ƒ.ComponentTransform();
        // let cmpMeshCaramel: Fudge.ComponentMesh = new Fudge.ComponentMesh(meshCube);
        // let cmpMaterialCaramel: Fudge.ComponentMaterial = new Fudge.ComponentMaterial(mtrCaramel);
        // let cmpTransformCaramel: Fudge.ComponentTransform = new Fudge.ComponentTransform();
        // let cmpMeshCream: Fudge.ComponentMesh = new Fudge.ComponentMesh(meshCube);
        // let cmpMaterialCream: Fudge.ComponentMaterial = new Fudge.ComponentMaterial(mtrCream);
        // let cmpTransformCream: Fudge.ComponentTransform = new Fudge.ComponentTransform();
        // cmpMeshCream.pivot.scaleZ(2);
        nodeCubeCoffee.addComponent(cmpMeshCoffee);
        nodeCubeCoffee.addComponent(cmpMaterialCoffee);
        nodeCubeCoffee.addComponent(cmpTransformCoffee);
        // nodeCubeCaramel.addComponent(cmpMeshCaramel);
        // nodeCubeCaramel.addComponent(cmpMaterialCaramel);
        // nodeCubeCaramel.addComponent(cmpTransformCaramel);
        // nodeCubeCaramel.addComponent(cmpMeshCream);
        // nodeCubeCaramel.addComponent(cmpMaterialCream);
        // nodeCubeCaramel.addComponent(cmpTransformCream);
        branch.appendChild(nodeCubeCoffee);
    }
})(UI || (UI = {}));
//# sourceMappingURL=app.js.map