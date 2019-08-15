// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// <reference path="../../../Core/Build/Fudge.d.ts"/>
/// <reference types="../../@types/golden-layout"/>
// console.log(Fudge);

namespace UI {
    let myLayout: GoldenLayout;
    let savedState: string;

    let branch: Fudge.Node;
    let canvas: HTMLCanvasElement;
    let viewPort: Fudge.Viewport = new Fudge.Viewport();
    let camera: Fudge.Node;
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
        // create branch
        branch = new Fudge.Node("Scene");
        branch.addComponent(new Fudge.ComponentTransform());

        // initialize RenderManager and transmit content
        Fudge.RenderManager.initialize();
        Fudge.RenderManager.addBranch(branch);
        Fudge.RenderManager.update();

        // initialize viewports
        canvas = document.createElement("canvas");
        canvas.height = 800;
        canvas.width = 1200;
        document.body.append(canvas);
        //Set up Camera for Scene
        camera = new Fudge.Node("Camera");
        let cmpTransform: Fudge.ComponentTransform = new Fudge.ComponentTransform();
        cmpTransform.local.translate(new Fudge.Vector3(1, 1, 10));
        cmpTransform.local.lookAt(new Fudge.Vector3());
        camera.addComponent(cmpTransform);
        let cmpCamera: Fudge.ComponentCamera = new Fudge.ComponentCamera();
        cmpCamera.projectCentral(1, 45, Fudge.FIELD_OF_VIEW.DIAGONAL);
        camera.addComponent(cmpCamera);
        addCubeNode();
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);
        viewPort.adjustingFrames = false;
        viewPort.adjustingCamera = false;
        Fudge.Loop.addEventListener(Fudge.EVENT.LOOP_FRAME, animate);
        Fudge.Loop.start();

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
        Fudge.RenderManager.update();
        // prepare and draw viewport
        viewPort.draw();
    }

    function addCubeNode() {
        let meshCube: Fudge.MeshCube = new Fudge.MeshCube();

        let clrCoffee: Fudge.Color = new Fudge.Color(0.35, 0.17, 0.03, 1);
        let coatCoffee: Fudge.CoatColored = new Fudge.CoatColored(clrCoffee);
        let mtrCoffee: Fudge.Material = new Fudge.Material("Coffee", Fudge.ShaderUniColor, coatCoffee);

        // let clrCaramel: Fudge.Color = new Fudge.Color(0.35, 0.17, 0.03, 1);
        // let coatCaramel: Fudge.CoatColored = new Fudge.CoatColored(clrCaramel);
        // let mtrCaramel: Fudge.Material = new Fudge.Material("Caramel", Fudge.ShaderUniColor, coatCaramel);

        // let clrCream: Fudge.Color = new Fudge.Color(0.35, 0.17, 0.03, 1);
        // let coatCream: Fudge.CoatColored = new Fudge.CoatColored(clrCream);
        // let mtrCream: Fudge.Material = new Fudge.Material("Caramel", Fudge.ShaderUniColor, coatCream);
        
        let nodeCubeCoffee: Fudge.Node = new Fudge.Node("Cube");
        // let nodeCubeCaramel: Fudge.Node = new Fudge.Node("Cube");
        // let nodeCubeCream: Fudge.Node = new Fudge.Node("Cube");

        let cmpMeshCoffee: Fudge.ComponentMesh = new Fudge.ComponentMesh(meshCube);
        let cmpMaterialCoffee: Fudge.ComponentMaterial = new Fudge.ComponentMaterial(mtrCoffee);
        let cmpTransformCoffee: Fudge.ComponentTransform = new Fudge.ComponentTransform();

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



}