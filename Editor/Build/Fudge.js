///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
///<reference path="../../../node_modules/electron/Electron.d.ts"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
///<reference path="../../../node_modules/electron/Electron.d.ts"/>
(function (Fudge) {
    var ƒ = FudgeCore;
    const { ipcRenderer, remote } = require("electron");
    const fs = require("fs");
    ƒ.RenderManager.initialize();
    // TODO: At this point of time, the project is just a single node. A project is much more complex...
    let node = null;
    // TODO: At this point of time, there is just a single panel. Support multiple panels
    let panel;
    window.addEventListener("DOMContentLoaded", initWindow);
    function initWindow() {
        ƒ.Debug.log("Fudge started");
        // TODO: create a new Panel containing a ViewData by default. More Views can be added by the user or by configuration
        ipcRenderer.on("save", (_event, _args) => {
            ƒ.Debug.log("Save");
            save(node);
        });
        ipcRenderer.on("open", (_event, _args) => {
            ƒ.Debug.log("Open");
            node = open();
        });
        ipcRenderer.on("openViewNode", (_event, _args) => {
            ƒ.Debug.log("OpenViewNode");
            openViewNode();
        });
        // HACK!
        ipcRenderer.on("updateNode", (_event, _args) => {
            ƒ.Debug.log("UpdateViewNode");
            panel.viewContainers[0].emit("setRoot", node);
        });
    }
    function openViewNode() {
        // HACK... multiple panels must be supported in the future
        panel = new Fudge.Panel(Fudge.VIEW.NODE);
    }
    function save(_node) {
        let serialization = ƒ.Serializer.serialize(_node);
        let content = ƒ.Serializer.stringify(serialization);
        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        let filename = remote.dialog.showSaveDialogSync(null, { title: "Save Branch", buttonLabel: "Save Branch", message: "ƒ-Message" });
        fs.writeFileSync(filename, content);
    }
    function open() {
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
})(Fudge || (Fudge = {}));
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
(function (Fudge) {
    var ƒ = FudgeCore;
    /**
     * Holds various views into the currently processed Fudge-project.
     * There must be only one ViewData in this panel, that displays data for the selected entity
     * Multiple panels may be created by the user, presets for different processing should be available
     */
    class Panel {
        constructor(_viewType) {
            this.viewContainers = [];
            if (Panel.goldenLayout)
                // TODO: support multiple Panels! In this template, there is only one resembling GoldenLayout itself
                return;
            // TODO: make Panel generic! In this template, the Panel always host a ViewNode
            Panel.goldenLayout = new GoldenLayout(this.getLayout());
            Panel.goldenLayout.registerComponent(Fudge.VIEW.DATA, Fudge.ViewData);
            if (_viewType == Fudge.VIEW.NODE)
                Panel.goldenLayout.registerComponent(Fudge.VIEW.NODE, Fudge.ViewNode);
            // Register a view allows easy communication from the panel back to the registered view
            Panel.goldenLayout.on("registerView", (_context) => {
                ƒ.Debug.info("Register view " + _context["title"], _context);
                this.viewContainers.push(_context);
            });
            Panel.goldenLayout.on("clickOnButtonInDataView", (_context) => {
                ƒ.Debug.info("Click on button in DataView ", _context);
            });
            Panel.goldenLayout.init();
        }
        getLayout() {
            const config = {
                content: [{
                        type: "row",
                        content: [{
                                type: "component",
                                componentName: Fudge.VIEW.DATA,
                                title: "Data"
                            }, {
                                type: "component",
                                componentName: Fudge.VIEW.NODE,
                                title: "Node"
                            }]
                    }]
            };
            return config;
        }
    }
    Fudge.Panel = Panel;
})(Fudge || (Fudge = {}));
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
(function (Fudge) {
    var ƒ = FudgeCore;
    let VIEW;
    (function (VIEW) {
        VIEW["PROJECT"] = "viewProject";
        VIEW["NODE"] = "viewNode";
        VIEW["ANIMATION"] = "viewAnimation";
        VIEW["SKETCH"] = "viewSketch";
        VIEW["MESH"] = "viewMesh";
        VIEW["DATA"] = "viewData";
    })(VIEW = Fudge.VIEW || (Fudge.VIEW = {}));
    /**
     * Base class for all Views to support generic functionality and communication between
     * TODO: examine, if this should/could be derived from some GoldenLayout "class"
     */
    class View {
        constructor(_container, _state) {
            ƒ.Debug.info("Create view " + this.constructor.name);
        }
        getLayout() {
            const config = {
                content: []
            };
            return config;
        }
    }
    Fudge.View = View;
})(Fudge || (Fudge = {}));
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
(function (Fudge) {
    /**
     * View displaying all information of any selected entity and offering simple controls for manipulation
     */
    class ViewData extends Fudge.View {
        // TODO: adept view to selected object, update when selection changes etc.
        constructor(_container, _state) {
            super(_container, _state);
            let lblName = document.createElement("label");
            lblName.innerHTML = "Node Name";
            let txtName = document.createElement("input");
            txtName.value = "Hallo";
            _container.getElement().append(lblName);
            _container.getElement().append(txtName);
            // TEST: button to emit message to panel. Should work when each panel holds a unique instance of GoldenLayout
            let btnMessage = document.createElement("button");
            btnMessage.innerText = "Send to panel";
            _container.getElement().append(btnMessage);
            btnMessage.addEventListener("click", (_event) => {
                // each container holds a reference to the layout manager, which is a GoldenLayout instance
                _container.layoutManager.emit("clickOnButtonInDataView");
            });
        }
    }
    Fudge.ViewData = ViewData;
})(Fudge || (Fudge = {}));
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
(function (Fudge) {
    var ƒ = FudgeCore;
    /**
     * View displaying a Node and the hierarchical relation to its parents and children.
     * Consists of a viewport and a tree-control.
     */
    class ViewNode extends Fudge.View {
        constructor(_container, _state) {
            super(_container, _state);
            this.viewport = new ƒ.Viewport();
            let branch;
            let canvas;
            let camera;
            branch = Scenes.createAxisCross();
            // initialize RenderManager and transmit content
            ƒ.RenderManager.addBranch(branch);
            ƒ.RenderManager.update();
            // initialize viewport
            camera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
            let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
            cmpCamera.projectCentral(1, 45);
            canvas = Scenes.createCanvas();
            document.body.appendChild(canvas);
            this.viewport = new ƒ.Viewport();
            this.viewport.initialize("ViewNode_Viewport", branch, cmpCamera, canvas);
            this.viewport.draw();
            _container.getElement().append(canvas);
            // TODO: if each Panel creates its own instance of GoldenLayout, containers may emit directly to their LayoutManager and no registration is required
            Fudge.Panel.goldenLayout.emit("registerView", _container);
            _container.on("setRoot", (_node) => {
                ƒ.Debug.log("Set root", _node);
                this.setRoot(_node);
            });
        }
        /**
         * Set the root node for display in this view
         * @param _node
         */
        setRoot(_node) {
            if (!_node)
                return;
            ƒ.Debug.log("Trying to display node: ", _node);
            // ƒ.RenderManager.removeBranch(this.viewport. this.viewport.getBranch());
            this.viewport.setBranch(_node);
            this.viewport.draw();
        }
        // TODO: This layout should be used to create a ViewNode, since it contains not only a viewport, but also a tree
        getLayout() {
            const config = {
                content: [{
                        type: "row",
                        content: [{
                                type: "component",
                                componentName: "ComponentTree",
                                title: "Graph"
                            }, {
                                type: "component",
                                componentName: "ComponentViewport",
                                title: "Viewport"
                            }]
                    }]
            };
            return config;
        }
    }
    Fudge.ViewNode = ViewNode;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=Fudge.js.map