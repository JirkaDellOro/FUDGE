/// <reference path="../../../Core/build/Fudge.d.ts"/>
/// <reference path="../../Scenes/Scenes.ts"/>

namespace ElectronViewport {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    let myLayout: GoldenLayout;
    let savedState: string;

    let branch: ƒ.Node;
    let canvas: HTMLCanvasElement;
    let viewPort: ƒ.Viewport = new ƒ.Viewport();
    let camera: ƒ.Node;
    window.addEventListener("load", init);

    function init() {
        let config: GoldenLayout.Config = {
            content: [{
                type: 'row',
                content: [{
                    type: 'component',
                    componentName: 'Inspector',
                    title: "Inspector",
                },
                {
                    type: 'component',
                    componentName: 'Viewport',
                    title: "Viewport",
                }
                ]
            }]
        };

        initViewport()
        myLayout = new GoldenLayout(config);

        myLayout.registerComponent('Viewport', createViewportComponent);
        myLayout.registerComponent('Inspector', createInspectorComponent);

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
        camera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
        cmpCamera.projectCentral(1, 45);
        canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);

        let viewPort: ƒ.Viewport = new ƒ.Viewport();
        viewPort.initialize("TestViewport", branch, cmpCamera, canvas);
        viewPort.draw();
    }

    function createViewportComponent(container: any, state: any) {
        container.getElement().append(canvas);
    }

    function createInspectorComponent(container: any, state: any) {
        console.log(branch.getChildren()[0].name);
        let lbl_name:HTMLElement = document.createElement("label");
        lbl_name.innerHTML = "Node Name";
        let txt_name:HTMLInputElement = document.createElement("input");
        txt_name.value = <string>branch.getChildren()[0].name;
        container.getElement().append(lbl_name);
        container.getElement().append(txt_name);
    }

    function animate(_event: Event): void {
        branch.cmpTransform.local.rotateY(1);
        ƒ.RenderManager.update();
        // prepare and draw viewport
        viewPort.draw();
    }

    function addCubeNode() {
        let meshCube: ƒ.MeshCube = new ƒ.MeshCube();

        let clrCoffee: ƒ.Color = new ƒ.Color(0.35, 0.17, 0.03, 1);
        let coatCoffee: ƒ.CoatColored = new ƒ.CoatColored(clrCoffee);
        let mtrCoffee: ƒ.Material = new ƒ.Material("Coffee", ƒ.ShaderUniColor, coatCoffee);

        // let clrCaramel: ƒ.Color = new ƒ.Color(0.35, 0.17, 0.03, 1);
        // let coatCaramel: ƒ.CoatColored = new ƒ.CoatColored(clrCaramel);
        // let mtrCaramel: ƒ.Material = new ƒ.Material("Caramel", ƒ.ShaderUniColor, coatCaramel);

        // let clrCream: ƒ.Color = new ƒ.Color(0.35, 0.17, 0.03, 1);
        // let coatCream: ƒ.CoatColored = new ƒ.CoatColored(clrCream);
        // let mtrCream: ƒ.Material = new ƒ.Material("Caramel", ƒ.ShaderUniColor, coatCream);
        
        let nodeCubeCoffee: ƒ.Node = new ƒ.Node("Cube");
        // let nodeCubeCaramel: ƒ.Node = new ƒ.Node("Cube");
        // let nodeCubeCream: ƒ.Node = new ƒ.Node("Cube");

        let cmpMeshCoffee: ƒ.ComponentMesh = new ƒ.ComponentMesh(meshCube);
        let cmpMaterialCoffee: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mtrCoffee);
        let cmpTransformCoffee: ƒ.ComponentTransform = new ƒ.ComponentTransform();

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
}