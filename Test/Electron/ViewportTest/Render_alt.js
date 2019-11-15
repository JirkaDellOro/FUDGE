/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference path="../../Scenes/Scenes.ts"/>
/// <reference types="../../@types/golden-layout"/>
var ElectronViewport;
/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference path="../../Scenes/Scenes.ts"/>
/// <reference types="../../@types/golden-layout"/>
(function (ElectronViewport) {
    var ƒ = FudgeCore;
    // window.addEventListener("DOMContentLoaded", init);
    let myLayout;
    let savedState;
    let branch;
    let canvas;
    let viewPort = new ƒ.Viewport();
    let cmpCamera;
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
        // create asset
        branch = Scenes.createAxisCross();
        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();
        // initialize viewport
        cmpCamera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        cmpCamera.projectCentral(1, 45);
        canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let viewPort = new ƒ.Viewport();
        viewPort.initialize("TestViewport", branch, cmpCamera, canvas);
        viewPort.draw();
    }
    function createViewportComponent(container, state) {
        container.getElement().append(canvas);
    }
    function createInspectorComponent(container, state) {
        console.log(branch.getChildren()[0].name);
        let lblName = document.createElement("label");
        lblName.innerHTML = "Node Name";
        let txtName = document.createElement("input");
        txtName.value = branch.getChildren()[0].name;
        container.getElement().append(lblName);
        container.getElement().append(txtName);
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
        // let clrCaramel: ƒ.Color = new ƒ.Color(0.35, 0.17, 0.03, 1);
        // let coatCaramel: ƒ.CoatColored = new ƒ.CoatColored(clrCaramel);
        // let mtrCaramel: ƒ.Material = new ƒ.Material("Caramel", ƒ.ShaderUniColor, coatCaramel);
        // let clrCream: ƒ.Color = new ƒ.Color(0.35, 0.17, 0.03, 1);
        // let coatCream: ƒ.CoatColored = new ƒ.CoatColored(clrCream);
        // let mtrCream: ƒ.Material = new ƒ.Material("Caramel", ƒ.ShaderUniColor, coatCream);
        let nodeCubeCoffee = new ƒ.Node("Cube");
        // let nodeCubeCaramel: ƒ.Node = new ƒ.Node("Cube");
        // let nodeCubeCream: ƒ.Node = new ƒ.Node("Cube");
        let cmpMeshCoffee = new ƒ.ComponentMesh(meshCube);
        let cmpMaterialCoffee = new ƒ.ComponentMaterial(mtrCoffee);
        let cmpTransformCoffee = new ƒ.ComponentTransform();
        // let cmpMeshCaramel: ƒ.ComponentMesh = new ƒ.ComponentMesh(meshCube);
        // let cmpMaterialCaramel: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mtrCaramel);
        // let cmpTransformCaramel: ƒ.ComponentTransform = new ƒ.ComponentTransform();
        // let cmpMeshCream: ƒ.ComponentMesh = new ƒ.ComponentMesh(meshCube);
        // let cmpMaterialCream: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mtrCream);
        // let cmpTransformCream: ƒ.ComponentTransform = new ƒ.ComponentTransform();
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
})(ElectronViewport || (ElectronViewport = {}));
//# sourceMappingURL=Render_alt.js.map