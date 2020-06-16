// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// <reference path="../../../Core/Build/Fudge.d.ts"/>
/// <reference types="../../@types/golden-layout"/>
/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../UserInterface/Build/FudgeUserInterface"/>
///<reference path="../../Scenes/Scenes.ts"/>
var UITest;
// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// <reference path="../../../Core/Build/Fudge.d.ts"/>
/// <reference types="../../@types/golden-layout"/>
/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../UserInterface/Build/FudgeUserInterface"/>
///<reference path="../../Scenes/Scenes.ts"/>
(function (UITest) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    let myLayout;
    let savedState;
    let graph;
    let canvas;
    let viewPort = new ƒ.Viewport();
    let cmpCamera;
    let counter;
    window.addEventListener("load", init);
    function init() {
        let config = {
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
    function initViewport() {
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
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, animate);
        ƒ.Loop.start();
        document.body.addEventListener("select" /* SELECT */, function (_event) {
            myLayout.emit("select" /* SELECT */, _event);
        });
        function animate(_event) {
            graph.mtxLocal.rotateY(1);
            // prepare and draw viewport
            viewPort.draw();
        }
    }
    function createViewportComponent(container, state) {
        container.getElement().append(canvas);
    }
    function createCameraComponent(container, state) {
        return new UITest.CameraUI(container, state, cmpCamera);
    }
    function createTestComponent(container, state) {
        let content = document.createElement("div");
        let components = graph.getAllComponents();
        // for (let component of components) {
        //     let uiComponents: ƒui.NodeData = new ƒui.NodeData(component, content);
        // }
        container.getElement().append(content);
        let mutator = {
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
        let dropdown = new ƒui.DropMenu("AddNodeMenu", mutator, { _text: "Add Node" });
        dropdown.addEventListener("dropMenuClick" /* DROPMENUCLICK */, function (_event) {
            switch (_event.detail) {
                case "AddNodeMenu.Primitives.Box":
                    let node = new ƒ.Node("Box");
                    let mesh = new ƒ.MeshCube();
                    let randX = (Math.random());
                    let randY = (Math.random());
                    let randZ = (Math.random());
                    let clrRed = new ƒ.Color(randX, randY, randZ, 0.5);
                    let coatRed = new ƒ.CoatColored(clrRed);
                    let mtrRed = new ƒ.Material("Red", ƒ.ShaderUniColor, coatRed);
                    let cmpMaterial = new ƒ.ComponentMaterial(mtrRed);
                    let cmpMesh = new ƒ.ComponentMesh(mesh);
                    console.log("Node at Pos: " + randX + " " + randY + " " + randZ);
                    let randPos = new ƒ.Vector3(randX, randY, randZ);
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
    function createTreeComponent(container, state) {
        let listContainer = document.createElement("div");
        container.getElement().html(listContainer);
    }
    function createAnimTreeComponent(container, state) {
        let listContainer = document.createElement("div");
        let testMutator = {
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
})(UITest || (UITest = {}));
//# sourceMappingURL=app.js.map