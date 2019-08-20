///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
(function (Fudge) {
    let VIEW;
    (function (VIEW) {
        VIEW["PROJECT"] = "viewProject";
        VIEW["NODE"] = "viewNode";
        VIEW["ANIMATION"] = "viewAnimation";
        VIEW["SKETCH"] = "viewSketch";
        VIEW["MESH"] = "viewMesh";
        VIEW["DATA"] = "viewData";
    })(VIEW || (VIEW = {}));
    var ƒ = FudgeCore;
    const { ipcRenderer, remote } = require("electron");
    const fs = require("fs");
    let goldenLayout;
    // At this point of time, the project is just a single node
    let node = null;
    window.addEventListener("DOMContentLoaded", initWindow);
    function initWindow() {
        ƒ.Debug.log("Fudge started");
        goldenLayout = new GoldenLayout(getLayout());
        goldenLayout.registerComponent(VIEW.DATA, createViewData);
        goldenLayout.init();
        ipcRenderer.on("save", (_event, _args) => {
            ƒ.Debug.log("Save");
            ipcRenderer.send("getNode");
            ƒ.Debug.log("Save done");
            // save(branch);
        });
        ipcRenderer.on("open", (_event, _args) => {
            ƒ.Debug.log("Open");
            node = open();
        });
        ipcRenderer.on("sendNode", (_event, _args) => {
            ƒ.Debug.log("SendNode");
            let viewNodeId = Number(_args[0]);
            console.log(viewNodeId);
            ipcRenderer.sendTo(viewNodeId, "display", node);
        });
    }
    function getLayout() {
        const config = {
            content: [{
                    type: "component",
                    componentName: VIEW.DATA,
                    title: "Data"
                }]
        };
        return config;
    }
    function createViewData(container, state) {
        let lblName = document.createElement("label");
        lblName.innerHTML = "Node Name";
        let txtName = document.createElement("input");
        txtName.value = "Hallo";
        container.getElement().append(lblName);
        container.getElement().append(txtName);
    }
    function save(_node) {
        let serialization = ƒ.Serializer.serialize(_node);
        let content = ƒ.Serializer.stringify(serialization);
        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        let filename = remote.dialog.showSaveDialogSync(null, { title: "Save Branch", buttonLabel: "Save Branch", message: "ƒ-Message" });
        fs.writeFileSync(filename, content);
    }
    Fudge.save = save;
    function open() {
        // @ts-ignore
        let filenames = remote.dialog.showOpenDialogSync(null, { title: "Load Branch", buttonLabel: "Load Branch", properties: ["openFile"] });
        let content = fs.readFileSync(filenames[0], { encoding: "utf-8" });
        console.groupCollapsed("File content");
        ƒ.Debug.log(content);
        console.groupEnd();
        let serialization = ƒ.Serializer.parse(content);
        let node = ƒ.Serializer.deserialize(serialization);
        console.groupCollapsed("Deserialized");
        console.log(node);
        console.groupEnd();
        return node;
    }
    Fudge.open = open;
})(Fudge || (Fudge = {}));
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
var FudgeViewNode;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
(function (FudgeViewNode) {
    var ƒ = FudgeCore;
    const { ipcRenderer } = require("electron");
    window.addEventListener("load", initWindow);
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
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
var FudgeViewProject;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
(function (FudgeViewProject) {
    let VIEW;
    (function (VIEW) {
        VIEW["PROJECT"] = "viewProject";
        VIEW["NODE"] = "viewNode";
        VIEW["ANIMATION"] = "viewAnimation";
        VIEW["SKETCH"] = "viewSketch";
        VIEW["MESH"] = "viewMesh";
    })(VIEW || (VIEW = {}));
    var ƒ = FudgeCore;
    const { ipcRenderer, remote } = require("electron");
    const fs = require("fs");
    // At this point of time, the project is just a single node
    let node = null;
    window.addEventListener("DOMContentLoaded", initWindow);
    function initWindow() {
        ƒ.Debug.log("FudgeViewProject started");
        ipcRenderer.on("save", (_event, _args) => {
            ƒ.Debug.log("Save");
            ipcRenderer.send("getNode");
            ƒ.Debug.log("Save done");
            // save(branch);
        });
        ipcRenderer.on("open", (_event, _args) => {
            ƒ.Debug.log("Open");
            node = open();
        });
        ipcRenderer.on("sendNode", (_event, _args) => {
            ƒ.Debug.log("SendNode");
            let viewNodeId = Number(_args[0]);
            console.log(viewNodeId);
            ipcRenderer.sendTo(viewNodeId, "display", node);
        });
    }
    function save(_node) {
        let serialization = ƒ.Serializer.serialize(_node);
        let content = ƒ.Serializer.stringify(serialization);
        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        let filename = remote.dialog.showSaveDialogSync(null, { title: "Save Branch", buttonLabel: "Save Branch", message: "ƒ-Message" });
        fs.writeFileSync(filename, content);
    }
    FudgeViewProject.save = save;
    function open() {
        // @ts-ignore
        let filenames = remote.dialog.showOpenDialogSync(null, { title: "Load Branch", buttonLabel: "Load Branch", properties: ["openFile"] });
        let content = fs.readFileSync(filenames[0], { encoding: "utf-8" });
        console.groupCollapsed("File content");
        ƒ.Debug.log(content);
        console.groupEnd();
        let serialization = ƒ.Serializer.parse(content);
        let node = ƒ.Serializer.deserialize(serialization);
        console.groupCollapsed("Deserialized");
        console.log(node);
        console.groupEnd();
        return node;
    }
    FudgeViewProject.open = open;
})(FudgeViewProject || (FudgeViewProject = {}));
//# sourceMappingURL=Fudge.js.map