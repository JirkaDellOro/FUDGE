// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// <reference path="../../../Core/Build/Fudge.d.ts"/>
/// <reference types="../../@types/golden-layout"/>
/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../UserInterface/Build/FudgeUI"/>
///<reference path="../../Scenes/Scenes.ts"/>



namespace UITest {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;

    let myLayout: GoldenLayout;
    let savedState: string;

    let branch: ƒ.Node;
    let canvas: HTMLCanvasElement;
    let viewPort: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera;
    let counter: number;
    window.addEventListener("load", init);

    function init(): void {
        let config: GoldenLayout.Config = {
            content: [{
                type: "column",
                content: [{
                    type: "component",
                    componentName: "Inspector",
                    title: "Inspector",
                    height: 10
                },
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
                {
                    type: "component",
                    componentName: "TreeView",
                    title: "TreeView"
                },
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
        myLayout.registerComponent("Inspector", createCameraComponent);
        myLayout.registerComponent("Viewport", createViewportComponent);
        myLayout.registerComponent("Manual", createTestComponent);
        myLayout.registerComponent("TreeView", createTreeComponent);
        myLayout.registerComponent("AnimationTest", createAnimTreeComponent);

        myLayout.init();
    }
    function initViewport(): void {
        counter = 0;
        // create asset
        branch = Scenes.createAxisCross();
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
        cmpCamera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);
        viewPort.adjustingFrames = false;
        viewPort.adjustingCamera = false;
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
        ƒ.Loop.start();
        document.body.addEventListener(ƒui.UIEVENT.SELECTION, function (_event: CustomEvent): void {
            console.log("Event just in, passing it to GL");
            myLayout.emit(ƒui.UIEVENT.SELECTION, _event);
        });
        function animate(_event: Event): void {
            branch.cmpTransform.local.rotateY(1);
            ƒ.RenderManager.update();
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
        let components: ƒ.Component[] = branch.getAllComponents();
        for (let component of components) {
            let uiComponents: ƒui.UINodeData = new ƒui.UINodeData(component, content);
        }
        container.getElement().append(content);
    }
    function createTreeComponent(container: GoldenLayout.Container, state: Object): void {
        let listContainer: HTMLElement = document.createElement("div");
        let treeController: ƒui.UINodeList = new ƒui.UINodeList(branch, listContainer);

        myLayout.on(ƒui.UIEVENT.SELECTION, function (_event) {
            console.log(_event);
        });
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
        let treeController: ƒui.UIAnimationList = new ƒui.UIAnimationList(testMutator, listContainer);
        container.getElement().html(listContainer);
    }
}