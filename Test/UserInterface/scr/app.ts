// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// <reference path="../../../Core/Build/Fudge.d.ts"/>
/// <reference types="../../@types/golden-layout"/>
/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../UserInterface/Build/FudgeUserInterface"/>
///<reference path="../../Scenes/Scenes.ts"/>



namespace UITest {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;

    let myLayout: GoldenLayout;
    let savedState: string;

    let graph: ƒ.Node;
    let canvas: HTMLCanvasElement;
    let viewPort: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera;
    let counter: number;
    window.addEventListener("load", init);

    function init(): void {
        let config: GoldenLayout.Config = {
            content: [{
                type: "column",
                content: [
                    //     {
                    //     type: "component",
                    //     componentName: "Inspector",
                    //     title: "Inspector",
                    //     height: 10
                    // },
                    {
                        type: "component",
                        componentName: "Manual",
                        title: "Manual",
                        height: 12
                    },
                    {
                        type: "component",
                        componentName: "Viewport",
                        title: "Viewport"
                    },
                    // {
                    //     type: "component",
                    //     componentName: "TreeView",
                    //     title: "TreeView"
                    // },
                    {
                        type: "component",
                        componentName: "AnimationTest",
                        title: "AnimationTest"
                    }
                ]
            }]
        };


        initViewport();
        myLayout = new GoldenLayout(config);
        // myLayout.registerComponent("Inspector", createCameraComponent);
        myLayout.registerComponent("Viewport", createViewportComponent);
        myLayout.registerComponent("Manual", createTestComponent);
        // myLayout.registerComponent("TreeView", createTreeComponent);
        myLayout.registerComponent("AnimationTest", createAnimTreeComponent);

        myLayout.init();
    }
    function initViewport(): void {
        
        counter = 0;
        // create asset
        graph = new ƒ.Node("Root");
        graph.addComponent(new ƒ.ComponentTransform());

        // initialize viewports
        canvas = document.createElement("canvas");
        canvas.height = 800;
        canvas.width = 1200;
        document.body.append(canvas);
        cmpCamera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        viewPort.initialize(canvas.id, graph, cmpCamera, canvas);
        viewPort.adjustingFrames = false;
        viewPort.adjustingCamera = false;
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
        ƒ.Loop.start();
        document.body.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, function (_event: CustomEvent): void {
            myLayout.emit(ƒui.EVENT_USERINTERFACE.SELECT, _event);
        });
        function animate(_event: Event): void {
            graph.mtxLocal.rotateY(1);
            // prepare and draw viewport
            viewPort.draw();
        }
    }
    function createViewportComponent(container: GoldenLayout.Container, state: Object): void {
        container.getElement().append(canvas);
    }

    function createCameraComponent(container: GoldenLayout.Container, state: Object): UITest.CameraUI {
        return new UITest.CameraUI(container, state, cmpCamera);
    }

    function createTestComponent(container: GoldenLayout.Container, state: Object): void {
        let content: HTMLElement = document.createElement("div");
        let components: ƒ.Component[] = graph.getAllComponents();
        // for (let component of components) {
        //     let uiComponents: ƒui.NodeData = new ƒui.NodeData(component, content);
        // }
        container.getElement().append(content);
        let mutator: ƒ.Mutator = {
            Primitives: {
                Box: "Create Box",
                Pyramid: "Create Pyramid",
                Misc: "Create Something"
            },
            NotSoPrimitives: {
                ComplexBox: "Create Complex Box",
                ComplexPyramid: "Create Complex Pyramid",
                NotSoMisc: "Create Whatever"
            }

        };

        let dropdown: ƒui.DropMenu = new ƒui.DropMenu("AddNodeMenu", mutator, { _text: "Add Node" });
        dropdown.addEventListener(ƒui.EVENT_USERINTERFACE.DROPMENUCLICK, function (_event: CustomEvent): void {
            switch (_event.detail) {
                case "AddNodeMenu.Primitives.Box":
                    let node: ƒ.Node = new ƒ.Node("Box");
                    let mesh: ƒ.MeshCube = new ƒ.MeshCube();
                    let randX: number = (Math.random());
                    let randY: number = (Math.random());
                    let randZ: number = (Math.random());
                    let clrRed: ƒ.Color = new ƒ.Color(randX, randY, randZ, 0.5);
                    let coatRed: ƒ.CoatColored = new ƒ.CoatColored(clrRed);
                    let mtrRed: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, coatRed);
                    let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mtrRed);
                    let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);

                    console.log("Node at Pos: " + randX + " " + randY + " " + randZ);
                    let randPos: ƒ.Vector3 = new ƒ.Vector3(randX, randY, randZ);
                    node.mtxWorld.translate(randPos);
                    node.addComponent(cmpMesh);
                    node.addComponent(cmpMaterial);
                    graph.addChild(node);
                    console.log(node);
                    break;
            }
        });
        container.getElement().append(dropdown);
    }
    function createTreeComponent(container: GoldenLayout.Container, state: Object): void {
        let listContainer: HTMLElement = document.createElement("div");
        container.getElement().html(listContainer);
    }
    function createAnimTreeComponent(container: GoldenLayout.Container, state: Object): void {
        let listContainer: HTMLElement = document.createElement("div");
        let testMutator: ƒ.Mutator = {
            component: {
                transform: {
                    position: { x: 0, y: 1, z: 3 },
                    rotation: { x: 0, y: 0.5, z: 1 },
                    scale: { x: 1, y: 2, z: 1 }
                }
            },
            otherComponent: {
                transform: {
                    position: { x: 0, y: 1, z: 3 },
                    rotation: { x: 0, y: 0.5, z: 1 },
                    scale: { x: 1, y: 2, z: 1 }
                }
            }

        };
        // let treeController: ƒui.AnimationList = new ƒui.AnimationList(testMutator, listContainer);
        container.getElement().html(listContainer);
    }
}