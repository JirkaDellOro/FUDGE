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
    let panel = null;
    window.addEventListener("load", initWindow);
    function initWindow() {
        ƒ.Debug.log("Fudge started");
        Fudge.PanelManager.instance.init();
        console.log("Panel Manager initialized");
        // TODO: create a new Panel containing a ViewData by default. More Views can be added by the user or by configuration
        ipcRenderer.on("save", (_event, _args) => {
            ƒ.Debug.log("Save");
            save(node);
        });
        ipcRenderer.on("open", (_event, _args) => {
            ƒ.Debug.log("Open");
            node = open();
            panel.setNode(node);
        });
        ipcRenderer.on("openViewNode", (_event, _args) => {
            ƒ.Debug.log("OpenViewNode");
            openViewNode();
        });
        ipcRenderer.on("openAnimationPanel", (_event, _args) => {
            ƒ.Debug.log("Open Animation Panel");
            openAnimationPanel();
        });
        // HACK!
        ipcRenderer.on("updateNode", (_event, _args) => {
            ƒ.Debug.log("UpdateViewNode");
        });
    }
    function openViewNode() {
        node = Scenes.createAxisCross();
        panel = Fudge.PanelManager.instance.createPanelFromTemplate(new Fudge.NodePanelTemplate, "Node Panel");
        panel.setNode(node);
        Fudge.PanelManager.instance.addPanel(panel);
    }
    function openAnimationPanel() {
        let panel = Fudge.PanelManager.instance.createPanelFromTemplate(new Fudge.ViewAnimationTemplate(), "Animation Panel");
        Fudge.PanelManager.instance.addPanel(panel);
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
//<reference types="../../Examples/Code/Scenes"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
//<reference types="../../Examples/Code/Scenes"/>
(function (Fudge) {
    /**
     * Holds various views into the currently processed Fudge-project.
     * There must be only one ViewData in this panel, that displays data for the selected entity
     * Multiple panels may be created by the user, presets for different processing should be available
     * @author Monika Galkewitsch, HFU, 2019
     * @author Lukas Scheuerle, HFU, 2019
     */
    class Panel extends EventTarget {
        /**
         * Constructor for panel Objects. Generates an empty panel with a single ViewData.
         * @param _name Panel Name
         * @param _template Optional. Template to be used in the construction of the panel.
         */
        constructor(_name, _template, _node) {
            super();
            this.views = [];
            this.config = {
                type: "row",
                content: [],
                title: _name
            };
            if (_node) {
                this.node = _node;
            }
            if (_template) {
                this.config.content[0] = this.constructFromTemplate(_template.config, _template.config.type);
            }
            else {
                let viewData = new Fudge.ViewData(this);
                this.addView(viewData, false);
            }
        }
        /**
         * Adds given View to the list of views on the panel.
         * @param _v View to be added
         * @param _pushToPanelManager Wether or not the View should also be pushed to the Panelmanagers list of views
         * @param _pushConfig Wether or not the config of the view should be pushed into the panel config. If this is false, you will have to push the view config manually. This is helpful for creating custom structures in the panel config.
         */
        addView(_v, _pushToPanelManager = true, _pushConfig = true) {
            this.views.push(_v);
            if (_pushConfig) {
                this.config.content.push(_v.config);
            }
            if (_pushToPanelManager) {
                Fudge.PanelManager.instance.addView(_v);
            }
        }
        /**
         * Allows to construct the view from a template config.
         * @param template Panel Template to be used for the construction
         * @param _type Type of the top layer container element used in the goldenLayout Config. This can be "row", "column" or "stack"
         */
        constructFromTemplate(template, _type) {
            let config = {
                type: _type,
                width: template.width,
                height: template.height,
                id: template.id,
                title: template.title,
                isClosable: template.isClosable,
                content: []
            };
            if (template.content.length != 0) {
                let content = template.content;
                for (let item of content) {
                    if (item.type == "component") {
                        let view;
                        switch (item.componentName) {
                            case Fudge.VIEW.NODE:
                                view = new Fudge.ViewNode(this);
                                if (this.node) {
                                    view.setRoot(this.node);
                                }
                                // view.content.addEventListener(ƒui.UIEVENT.SELECTION, this.passEvent);
                                break;
                            case Fudge.VIEW.DATA:
                                view = new Fudge.ViewData(this);
                                break;
                            case Fudge.VIEW.PORT:
                                view = new Fudge.ViewViewport(this);
                                if (this.node) {
                                    // (<ViewViewport>view).setRoot(this.node);
                                }
                                break;
                            case Fudge.VIEW.ANIMATION:
                                view = new Fudge.ViewAnimation(this);
                                break;
                        }
                        let viewConfig = {
                            type: "component",
                            title: item.title,
                            width: item.width,
                            height: item.height,
                            id: item.id,
                            isClosable: item.isClosable,
                            componentName: "View",
                            componentState: { content: view.content }
                        };
                        view.config = viewConfig;
                        config.content.push(viewConfig);
                        this.addView(view, false, false);
                    }
                    else {
                        config.content.push(this.constructFromTemplate(item, item.type));
                    }
                }
            }
            console.log(config);
            return config;
        }
        //TODO: Remove and make it Event-Oriented
        setNode(_node) {
            this.node = _node;
            for (let view of this.views) {
                //HACK
                if (view instanceof Fudge.ViewNode) {
                    view.setRoot(this.node);
                }
                else if (view instanceof Fudge.ViewViewport) {
                    view.setRoot(this.node);
                }
            }
        }
    }
    Fudge.Panel = Panel;
})(Fudge || (Fudge = {}));
/// <reference types="../@types/jquery"/>
/// <reference types="../@types/golden-layout"/>
var Fudge;
/// <reference types="../@types/jquery"/>
/// <reference types="../@types/golden-layout"/>
(function (Fudge) {
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    class PanelManager extends EventTarget {
        constructor() {
            super();
            this.panels = [];
        }
        /**
         * Create new Panel from Template Structure
         * @param _template Template to be used
         * @param _name Name of the Panel
         */
        createPanelFromTemplate(_template, _name) {
            let panel = new Fudge.Panel(_name, _template);
            console.log(panel);
            return panel;
        }
        /**
         * Creates an Panel with nothing but the default ViewData
         * @param _name Name of the Panel
         */
        createEmptyPanel(_name) {
            let panel = new Fudge.Panel(_name);
            return panel;
        }
        /**
         * Add Panel to PanelManagers Panel List and to the PanelManagers GoldenLayout Config
         * @param _p Panel to be added
         */
        addPanel(_p) {
            this.panels.push(_p);
            this.editorLayout.root.contentItems[0].addChild(_p.config);
        }
        /**
         * Add View to PanelManagers View List and add the view to the active panel
         * @param _v View to be added
         */
        addView(_v) {
            console.log("Add View has been called at PM");
            this.editorLayout.root.contentItems[0].getActiveContentItem().addChild(_v.config);
        }
        /**
         * Initialize GoldenLayout Context of the PanelManager Instance
         */
        init() {
            let config = {
                content: [{
                        type: "stack",
                        isClosable: false,
                        content: [
                            {
                                type: "component",
                                componentName: "welcome",
                                title: "Welcome",
                                componentState: {}
                            }
                        ]
                    }]
            };
            this.editorLayout = new GoldenLayout(config); //This might be a problem because it can't use a specific place to put it.
            this.editorLayout.registerComponent("welcome", welcome);
            this.editorLayout.registerComponent("View", registerViewComponent);
            this.editorLayout.init();
        }
    }
    PanelManager.instance = new PanelManager();
    Fudge.PanelManager = PanelManager;
    //TODO: Give these Factory Functions a better home
    //TODO: Figure out a better way than any. So far it was the best way to get the attributes of componentState into it properly
    /**
     * Factory Function for the the "Welcome"-Component
     * @param container
     * @param state
     */
    function welcome(container, state) {
        container.getElement().html("<div>Welcome</div>");
    }
    /**
     * Factory Function for the generic "View"-Component
     * @param container
     * @param state
     */
    function registerViewComponent(container, state) {
        container.getElement().append(state.content);
    }
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    class PanelTemplate {
    }
    Fudge.PanelTemplate = PanelTemplate;
    class NodePanelTemplate extends PanelTemplate {
        constructor() {
            super();
            this.config = {
                type: "row",
                content: [
                    {
                        type: "component",
                        componentName: Fudge.VIEW.PORT,
                        title: "Viewport"
                    },
                    {
                        type: "column",
                        content: [
                            {
                                type: "component",
                                componentName: Fudge.VIEW.NODE,
                                title: "Node Explorer"
                            },
                            {
                                type: "component",
                                componentName: Fudge.VIEW.DATA,
                                title: "Inspector"
                            }
                        ]
                    }
                ]
            };
        }
    }
    Fudge.NodePanelTemplate = NodePanelTemplate;
})(Fudge || (Fudge = {}));
///<reference types="../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
(function (Fudge) {
    var ƒ = FudgeCore;
    let VIEW;
    (function (VIEW) {
        // PROJECT = ViewProject,
        VIEW["NODE"] = "ViewNode";
        VIEW["ANIMATION"] = "ViewAnimation";
        // SKETCH = ViewSketch,
        // MESH = ViewMesh,
        VIEW["PORT"] = "ViewPort";
        VIEW["DATA"] = "ViewData";
    })(VIEW = Fudge.VIEW || (Fudge.VIEW = {}));
    /**
     * Base class for all Views to support generic functionality
     * TODO: examine, if this should/could be derived from some GoldenLayout "class"
     *
     */
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    class View {
        constructor(_parent) {
            ƒ.Debug.info("Create view " + this.constructor.name);
            this.content = document.createElement("div");
            this.config = this.getLayout();
            this.parentPanel = _parent;
        }
        /**
         * Returns GoldenLayout ComponentConfig for the Views GoldenLayout Component.
         * If not overridden by inherited class, gives generic config with its type as its name.
         * If you want to use the "View"-Component, add {content: this.content} to componentState.
         */
        getLayout() {
            /* TODO: fix the golden-layout.d.ts to include componentName in ContentItem*/
            const config = {
                type: "component",
                title: this.type,
                componentName: "View",
                componentState: { content: this.content }
            };
            return config;
        }
    }
    Fudge.View = View;
})(Fudge || (Fudge = {}));
///<reference types="../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
(function (Fudge) {
    var ƒui = FudgeUserInterface;
    /**
     * View displaying all information of any selected entity and offering simple controls for manipulation
     */
    class ViewData extends Fudge.View {
        // TODO: adept view to selected object, update when selection changes etc.
        constructor(_parent) {
            super(_parent);
            this.setNode = (_event) => {
                console.log(this.content);
                this.node = _event.detail;
                while (this.content.firstChild != null) {
                    this.content.removeChild(this.content.lastChild);
                }
                this.fillContent();
                console.log(this.content);
            };
            this.parentPanel.addEventListener("nodeSelectionEvent" /* SELECTION */, this.setNode);
            this.fillContent();
        }
        deconstruct() {
            //TODO: Deconstruct;
        }
        fillContent() {
            if (this.node) {
                let cntHeader = document.createElement("span");
                let lblNodeName = document.createElement("label");
                lblNodeName.textContent = "Name";
                cntHeader.append(lblNodeName);
                this.content.append(cntHeader);
                let txtNodeName = document.createElement("input");
                txtNodeName.value = this.node.name;
                cntHeader.append(txtNodeName);
                let cntComponents = document.createElement("div");
                let nodeComponents = this.node.getAllComponents();
                console.group("Components of the node");
                console.log(nodeComponents);
                for (let nodeComponent of nodeComponents) {
                    let uiComponents = new ƒui.UINodeData(nodeComponent, this.content);
                }
                console.groupEnd();
            }
            else {
                let cntEmpty = document.createElement("div");
                this.content.append(cntEmpty);
            }
        }
    }
    Fudge.ViewData = ViewData;
})(Fudge || (Fudge = {}));
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../UserInterface/Build/FudgeUI"/>
//<reference types="../../../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../UserInterface/Build/FudgeUI"/>
//<reference types="../../../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    /**
     * View displaying a Node and the hierarchical relation to its parents and children.
     * Consists of a viewport and a tree-control.
     */
    class ViewNode extends Fudge.View {
        constructor(_parent) {
            super(_parent);
            this.setSelectedNode = (_event) => {
                this.listController.setSelection(_event.detail);
            };
            this.passEventToPanel = (_event) => {
                console.log("Recieved Event, trying to pass it onto the Panel");
                console.log(_event);
                let eventToPass = new CustomEvent(_event.type, { bubbles: false, detail: _event.detail });
                _event.cancelBubble = true;
                this.parentPanel.dispatchEvent(eventToPass);
            };
            this.branch = new ƒ.Node("dummyNode");
            this.parentPanel.addEventListener("nodeSelectionEvent" /* SELECTION */, this.setSelectedNode);
            this.listController = new ƒui.UINodeList(this.branch, this.content);
            this.listController.listRoot.addEventListener("nodeSelectionEvent" /* SELECTION */, this.passEventToPanel);
            console.log(this.listController.listRoot);
            this.fillContent();
        }
        deconstruct() {
            //TODO: desconstruct
        }
        fillContent() {
            this.content.append(this.listController.listRoot);
        }
        setRoot(_node) {
            if (!_node)
                return;
            // ƒ.Debug.log("Trying to display node: ", _node);
            this.branch = _node;
            this.listController.listRoot.removeEventListener("nodeSelectionEvent" /* SELECTION */, this.passEventToPanel);
            this.listController.setNodeRoot(_node);
            this.content.replaceChild(this.listController.listRoot, this.content.firstChild);
            this.listController.listRoot.addEventListener("nodeSelectionEvent" /* SELECTION */, this.passEventToPanel);
        }
    }
    Fudge.ViewNode = ViewNode;
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
    class ViewViewport extends Fudge.View {
        constructor(_parent) {
            super(_parent);
            //TODO
            this.animate = (_e) => {
                this.viewport.setBranch(this.branch);
                ƒ.RenderManager.update();
                if (this.canvas.clientHeight > 0 && this.canvas.clientWidth > 0)
                    this.viewport.draw();
            };
            this.fillContent();
        }
        deconstruct() {
            //TODO: desconstruct
        }
        fillContent() {
            this.branch = new ƒ.Node("Dummy Node");
            let camera;
            // TODO: delete example scene
            // this.branch = Scenes.createAxisCross();
            // initialize RenderManager and transmit content
            ƒ.RenderManager.addBranch(this.branch);
            ƒ.RenderManager.update();
            // initialize viewport
            // TODO: create camera/canvas here without "Scenes"
            camera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
            let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
            cmpCamera.projectCentral(1, 45);
            this.canvas = Scenes.createCanvas();
            document.body.appendChild(this.canvas);
            this.viewport = new ƒ.Viewport();
            this.viewport.initialize("ViewNode_Viewport", this.branch, cmpCamera, this.canvas);
            this.viewport.draw();
            this.content.append(this.canvas);
            ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL);
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.animate);
            // TODO: if each Panel creates its own instance of GoldenLayout, containers may emit directly to their LayoutManager and no registration is required
            // Panel.goldenLayout.emit("registerView", _container);
            // _container.on("setRoot", (_node: ƒ.Node): void => {
            //     ƒ.Debug.log("Set root", _node);
            //     this.setRoot(_node);
            // });
        }
        /**
         * Set the root node for display in this view
         * @param _node
         */
        setRoot(_node) {
            if (!_node)
                return;
            ƒ.Debug.log("Trying to display node: ", _node);
            // ƒ.RenderManager.removeBranch(this.branch);
            this.branch = _node;
            // ƒ.RenderManager.addBranch(this.branch);
            // ƒ.RenderManager.update();
            this.viewport.setBranch(this.branch);
        }
    }
    Fudge.ViewViewport = ViewViewport;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=Fudge.js.map