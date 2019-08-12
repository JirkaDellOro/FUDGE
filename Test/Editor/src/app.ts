// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// <reference path="../../../Core/build/Fudge.d.ts"/>
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
        myLayout.registerComponent('Inspector', createInspectorComponent);
        myLayout.registerComponent('Viewport', createViewportComponent);

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
        let nodeCube: Fudge.Node = new Fudge.Node("Cube");
        console.log(nodeCube);
        let cmpMesh: Fudge.ComponentMesh = new Fudge.ComponentMesh(meshCube);
        let cmpMaterial: Fudge.ComponentMaterial = new Fudge.ComponentMaterial(mtrCoffee);
        let cmpTransform: Fudge.ComponentTransform = new Fudge.ComponentTransform();
        nodeCube.addComponent(cmpMesh);
        nodeCube.addComponent(cmpMaterial);
        nodeCube.addComponent(cmpTransform);
        branch.appendChild(nodeCube);
    }



}