// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// <reference path="../../../Core/Build/Fudge.d.ts"/>
/// <reference types="../../@types/golden-layout"/>
/// <reference types="../../../Core/Build/FudgeCore"/>
///<reference path="../../Scenes/Scenes.ts"/>
var UITest;
// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// <reference path="../../../Core/Build/Fudge.d.ts"/>
/// <reference types="../../@types/golden-layout"/>
/// <reference types="../../../Core/Build/FudgeCore"/>
///<reference path="../../Scenes/Scenes.ts"/>
(function (UITest) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
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
        myLayout.init();
    }
    function initViewport() {
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
        camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);
        viewPort.adjustingFrames = false;
        viewPort.adjustingCamera = false;
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, animate);
        ƒ.Loop.start();
        document.body.addEventListener("nodeSelect" /* SELECTION */, function (_event) {
            console.log("Event just in, passing it to GL");
            myLayout.emit("nodeSelect" /* SELECTION */, _event);
        });
        function animate(_event) {
            branch.cmpTransform.local.rotateY(1);
            ƒ.RenderManager.update();
            // prepare and draw viewport
            viewPort.draw();
        }
    }
    function createViewportComponent(container, state) {
        container.getElement().append(canvas);
    }
    function createCameraComponent(container, state) {
        return new UI.CameraUI(container, state, camera.getComponent(ƒ.ComponentCamera));
    }
    function createTestComponent(container, state) {
        return new UI.TestUI(container, state, camera.getComponent(ƒ.ComponentCamera));
    }
    function createTreeComponent(container, state) {
        let listContainer = document.createElement("div");
        let treeController = new ƒui.UINodeList(branch, listContainer);
        myLayout.on("nodeSelect" /* SELECTION */, function (_event) {
            console.log(_event);
        });
        container.getElement().html(listContainer);
    }
})(UITest || (UITest = {}));
//# sourceMappingURL=app.js.map