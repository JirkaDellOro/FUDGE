///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
var FudgeViewNode;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
(function (FudgeViewNode) {
    var ƒ = FudgeCore;
    const { ipcRenderer } = require("electron");
    window.addEventListener("DOMContentLoaded", initWindow);
    let myLayout;
    let savedState;
    let branch;
    let canvas;
    let viewport = new ƒ.Viewport();
    let camera;
    function initWindow() {
        ƒ.Debug.log("FudgeViewNode started");
        createScene();
        myLayout = new GoldenLayout(getLayout());
        myLayout.registerComponent("Viewport", createViewportComponent);
        myLayout.registerComponent("Inspector", createInspectorComponent);
        myLayout.init();
        ipcRenderer.addListener("update", (_event) => {
            ƒ.Debug.info("Update");
            ipcRenderer.send("getNode");
        });
        ipcRenderer.addListener("display", (_event, _node) => {
            ƒ.Debug.info("Display");
            displayNode(_node);
        });
    }
    function displayNode(_node) {
        if (!_node)
            return;
        ƒ.Debug.log("Trying to display node: ", _node);
        ƒ.RenderManager.removeBranch(branch);
        branch = _node;
        viewport.setBranch(branch);
        viewport.draw();
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
    function getLayout() {
        const config = {
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
        return config;
    }
    // TODO: remove this. Only here for testing in order not to start with an empty viewport
    function createScene() {
        // create asset
        branch = Scenes.createAxisCross();
        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();
        // initialize viewport
        camera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
        cmpCamera.projectCentral(1, 45);
        canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);
        viewport = new ƒ.Viewport();
        viewport.initialize("TestViewport", branch, cmpCamera, canvas);
        viewport.draw();
    }
})(FudgeViewNode || (FudgeViewNode = {}));
//# sourceMappingURL=ViewNode.js.map