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
            panel = Fudge.PanelManager.instance.getActivePanel();
            if (panel instanceof Fudge.NodePanel) {
                node = panel.getNode();
            }
            save(node);
        });
        ipcRenderer.on("open", (_event, _args) => {
            ƒ.Debug.log("Open");
            node = open();
            panel = Fudge.PanelManager.instance.getActivePanel();
            if (panel instanceof Fudge.NodePanel) {
                panel.setNode(node);
            }
        });
        ipcRenderer.on("openViewNode", (_event, _args) => {
            ƒ.Debug.log("OpenViewNode");
            openViewNode();
        });
        ipcRenderer.on("openAnimationPanel", (_event, _args) => {
            ƒ.Debug.log("Open Animation Panel");
            // openAnimationPanel();
        });
        // HACK!
        ipcRenderer.on("updateNode", (_event, _args) => {
            ƒ.Debug.log("UpdateViewNode");
        });
    }
    function openViewNode() {
        // node = Scenes.createAxisCross();
        node = new ƒ.Node("Scene");
        let nodePanel = new Fudge.NodePanel("Node Panel", new Fudge.NodePanelTemplate, node);
        Fudge.PanelManager.instance.addPanel(nodePanel);
    }
    // function openAnimationPanel(): void {
    //   let panel: Panel = PanelManager.instance.createPanelFromTemplate(new ViewAnimationTemplate(), "Animation Panel");
    //   PanelManager.instance.addPanel(panel);
    // }
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
    var ƒ = FudgeCore;
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
        constructor(_name) {
            super();
            this.views = [];
            let id = this.generateID();
            this.config = {
                type: "row",
                content: [],
                title: _name,
                id: id
            };
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
         * Returns a randomly generated ID.
         * Used to identify panels
         */
        generateID() {
            let randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            let uniqid = randLetter + Date.now();
            return uniqid;
        }
    }
    Fudge.Panel = Panel;
    /**
    * Panel that functions as a Node Editor. Uses ViewData, ViewPort and ViewNode.
    * Use NodePanelTemplate to initialize the default NodePanel.
    * @author Monika Galkewitsch, 2019, HFU
    */
    class NodePanel extends Panel {
        constructor(_name, _template, _node) {
            super(_name);
            this.node = _node || new ƒ.Node("Scene");
            if (_template) {
                let id = this.config.id.toString();
                this.config.content[0] = this.constructFromTemplate(_template.config, _template.config.type, id);
            }
            else {
                let viewData = new Fudge.ViewData(this);
                this.addView(viewData, false);
            }
        }
        setNode(_node) {
            this.node = _node;
            for (let view of this.views) {
                if (view instanceof Fudge.ViewNode) {
                    view.setRoot(this.node);
                }
                else if (view instanceof Fudge.ViewViewport) {
                    view.setRoot(this.node);
                }
            }
        }
        getNode() {
            return this.node;
        }
        /**
 * Allows to construct the view from a template config.
 * @param template Panel Template to be used for the construction
 * @param _type Type of the top layer container element used in the goldenLayout Config. This can be "row", "column" or "stack"
 */
        constructFromTemplate(template, _type, _id) {
            let id = template.id + _id;
            let config = {
                type: _type,
                width: template.width,
                height: template.height,
                id: id,
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
                                // view.content.addEventListener(ƒui.UIEVENT.SELECTION, this.passEvent);
                                break;
                            case Fudge.VIEW.DATA:
                                view = new Fudge.ViewData(this);
                                break;
                            case Fudge.VIEW.PORT:
                                view = new Fudge.ViewViewport(this);
                                break;
                            case Fudge.VIEW.CAMERA:
                                view = new Fudge.ViewCamera(this);
                                break;
                            case Fudge.VIEW.ANIMATION:
                                // view = new ViewAnimation(this);
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
                        config.content.push(this.constructFromTemplate(item, item.type, item.id));
                    }
                }
            }
            console.log(config);
            return config;
        }
    }
    Fudge.NodePanel = NodePanel;
})(Fudge || (Fudge = {}));
/// <reference types="../@types/jquery"/>
/// <reference types="../@types/golden-layout"/>
var Fudge;
/// <reference types="../@types/jquery"/>
/// <reference types="../@types/golden-layout"/>
(function (Fudge) {
    /**
     * Manages all Panels used by Fudge at the time. Call the static instance Member to use its functions.
     * @author Monika Galkewitsch, 2019, HFU
     * @author Lukas Scheuerle, 2019, HFU
     */
    class PanelManager extends EventTarget {
        constructor() {
            super();
            this.panels = [];
            /**
             * Sets the currently active panel. Shouldn't be called by itself. Rather, it should be called by a goldenLayout-Event (i.e. when a tab in the Layout is selected)
             * "activeContentItemChanged" Events usually come from the first ContentItem in the root-Attribute of the GoldenLayout-Instance or when a new Panel is
             * created and added to the Panel-List.
             * During Initialization and addPanel function, this method is called already.
             */
            this.setActivePanel = () => {
                let activeTab = this.editorLayout.root.contentItems[0].getActiveContentItem();
                for (let panel of this.panels) {
                    if (panel.config.id == activeTab.config.id) {
                        this.activePanel = panel;
                    }
                }
            };
        }
        /**
         * Add Panel to PanelManagers Panel List and to the PanelManagers GoldenLayout Config
         * @param _p Panel to be added
         */
        addPanel(_p) {
            this.panels.push(_p);
            this.editorLayout.root.contentItems[0].addChild(_p.config);
            this.activePanel = _p;
        }
        /**
         * Add View to PanelManagers View List and add the view to the active panel
         * @param _v View to be added
         */
        addView(_v) {
            this.editorLayout.root.contentItems[0].getActiveContentItem().addChild(_v.config);
        }
        /**
         * Returns the currently active Panel
         */
        getActivePanel() {
            return this.activePanel;
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
            this.editorLayout.root.contentItems[0].on("activeContentItemChanged", this.setActivePanel);
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
                        type: "component",
                        componentName: Fudge.VIEW.CAMERA,
                        title: "Camera Controller"
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
        VIEW["CAMERA"] = "ViewCamera";
    })(VIEW = Fudge.VIEW || (Fudge.VIEW = {}));
    /**
     * Base class for all Views to support generic functionality
     * @author Monika Galkewitsch, HFU, 2019
     * @author Lukas Scheuerle, HFU, 2019
     */
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
    let Menu;
    (function (Menu) {
        Menu["COMPONENTMENU"] = "Add Components";
    })(Menu || (Menu = {}));
    class ViewCamera extends Fudge.View {
        constructor(_panel) {
            super(_panel);
            this.setCamera = (_event) => {
                this.camera = _event.detail;
                this.fillContent();
            };
            this.parentPanel.addEventListener("activeViewport" /* ACTIVEVIEWPORT */, this.setCamera);
            let div = document.createElement("div");
            this.content.appendChild(div);
        }
        fillContent() {
            let div = document.createElement("div");
            let inspector = new ƒui.UINodeData(this.camera, div);
            this.content.replaceChild(div, this.content.firstChild);
        }
        deconstruct() {
            throw new Error("Method not implemented.");
        }
    }
    Fudge.ViewCamera = ViewCamera;
})(Fudge || (Fudge = {}));
///<reference types="../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    /**
     * View displaying all information of any selected entity and offering simple controls for manipulation
     */
    let Menu;
    (function (Menu) {
        Menu["COMPONENTMENU"] = "Add Components";
    })(Menu || (Menu = {}));
    class ViewData extends Fudge.View {
        // TODO: adept view to selected object, update when selection changes etc.
        constructor(_parent) {
            super(_parent);
            /**
             * Changes the name of the displayed node
             */
            this.changeNodeName = (_event) => {
                if (this.data instanceof ƒ.Node) {
                    let target = _event.target;
                    this.data.name = target.value;
                }
            };
            /**
             * Change displayed node
             */
            this.setNode = (_event) => {
                this.data = _event.detail;
                while (this.content.firstChild != null) {
                    this.content.removeChild(this.content.lastChild);
                }
                this.fillContent();
            };
            /**
             * Add Component to displayed node
             */
            this.addComponent = (_event) => {
                switch (_event.detail) {
                }
            };
            this.parentPanel.addEventListener("nodeSelectionEvent" /* SELECTION */, this.setNode);
            this.fillContent();
        }
        deconstruct() {
            //TODO: Deconstruct;
        }
        fillContent() {
            if (this.data) {
                let cntHeader = document.createElement("span");
                let lblNodeName = document.createElement("label");
                lblNodeName.textContent = "Name";
                cntHeader.append(lblNodeName);
                this.content.append(cntHeader);
                let cntComponents = document.createElement("div");
                if (this.data instanceof ƒ.Node) {
                    let txtNodeName = document.createElement("input");
                    txtNodeName.addEventListener("input", this.changeNodeName);
                    txtNodeName.value = this.data.name;
                    cntHeader.append(txtNodeName);
                    let nodeComponents = this.data.getAllComponents();
                    for (let nodeComponent of nodeComponents) {
                        let uiComponents = new ƒui.UINodeData(nodeComponent, cntComponents);
                    }
                    this.content.append(cntComponents);
                    let mutator = {};
                    for (let member in ƒui.COMPONENTMENU) {
                        ƒui.MultiLevelMenuManager.buildFromSignature(ƒui.COMPONENTMENU[member], mutator);
                    }
                    let menu = new ƒui.DropMenu(Menu.COMPONENTMENU, mutator, { _text: "Add Components" });
                    menu.addEventListener("dropMenuClick" /* DROPMENUCLICK */, this.addComponent);
                    this.content.append(menu);
                }
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
///<reference types="../../Examples/Code/Scenes"/>
//<reference types="../../../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../UserInterface/Build/FudgeUI"/>
///<reference types="../../Examples/Code/Scenes"/>
//<reference types="../../../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    let Menu;
    (function (Menu) {
        Menu["NODE"] = "AddNode";
    })(Menu || (Menu = {}));
    /**
     * View displaying a Node and the hierarchical relation to its parents and children.
     * Consists of a viewport, a tree-control and .
     */
    class ViewNode extends Fudge.View {
        constructor(_parent) {
            super(_parent);
            /**
             * Add new Node to Node Structure
             */
            this.createNode = (_event) => {
                let node = new ƒ.Node("");
                let targetNode = this.selectedNode || this.branch;
                let clrRed = new ƒ.Color(1, 0, 0, 1);
                let coatRed = new ƒ.CoatColored(clrRed);
                let mtrRed = new ƒ.Material("Red", ƒ.ShaderUniColor, coatRed);
                switch (_event.detail) {
                    case Menu.NODE + "." + ƒui.NODEMENU.BOX:
                        let meshCube = new ƒ.MeshCube();
                        node = Scenes.createCompleteMeshNode("Box", mtrRed, meshCube);
                        break;
                    case Menu.NODE + "." + ƒui.NODEMENU.EMPTY:
                        node.name = "Empty Node";
                        break;
                    case Menu.NODE + "." + ƒui.NODEMENU.PLANE:
                        let meshPlane = new ƒ.MeshQuad();
                        node = Scenes.createCompleteMeshNode("Plane", mtrRed, meshPlane);
                        break;
                    case Menu.NODE + "." + ƒui.NODEMENU.PYRAMID:
                        let meshPyramid = new ƒ.MeshPyramid();
                        node = Scenes.createCompleteMeshNode("Pyramid", mtrRed, meshPyramid);
                        break;
                }
                targetNode.appendChild(node);
                let event = new Event("childAppend" /* CHILD_APPEND */);
                targetNode.dispatchEvent(event);
                this.setRoot(this.branch);
            };
            /**
             * Change the selected Node
             */
            this.setSelectedNode = (_event) => {
                this.listController.setSelection(_event.detail);
                this.selectedNode = _event.detail;
            };
            /**
             * Pass Event to Panel
             */
            this.passEventToPanel = (_event) => {
                let eventToPass = new CustomEvent(_event.type, { bubbles: false, detail: _event.detail });
                _event.cancelBubble = true;
                this.parentPanel.dispatchEvent(eventToPass);
            };
            if (_parent instanceof Fudge.NodePanel) {
                if (_parent.getNode() != null) {
                    this.branch = _parent.getNode();
                }
                else {
                    this.branch = new ƒ.Node("Scene");
                }
            }
            else {
                this.branch = new ƒ.Node("Scene");
            }
            this.selectedNode = null;
            this.parentPanel.addEventListener("nodeSelectionEvent" /* SELECTION */, this.setSelectedNode);
            this.listController = new ƒui.UINodeList(this.branch, this.content);
            this.listController.listRoot.addEventListener("nodeSelectionEvent" /* SELECTION */, this.passEventToPanel);
            this.fillContent();
        }
        deconstruct() {
            //TODO: desconstruct
        }
        fillContent() {
            let mutator = {};
            for (let member in ƒui.NODEMENU) {
                ƒui.MultiLevelMenuManager.buildFromSignature(ƒui.NODEMENU[member], mutator);
            }
            let menu = new ƒui.DropMenu(Menu.NODE, mutator, { _text: "Add Node" });
            menu.addEventListener("dropMenuClick" /* DROPMENUCLICK */, this.createNode);
            this.content.append(this.listController.listRoot);
            this.content.append(menu);
        }
        /**
         * Display structure of node
         * @param _node Node to be displayed
         */
        setRoot(_node) {
            if (!_node)
                return;
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
///<reference types="../../../UserInterface/Build/FudgeUI"/>
///<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../UserInterface/Build/FudgeUI"/>
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
            /**
             * Update Viewport every frame
             */
            this.animate = (_e) => {
                this.viewport.setBranch(this.branch);
                ƒ.RenderManager.updateBranch(this.branch);
                ƒ.RenderManager.update();
                if (this.canvas.clientHeight > 0 && this.canvas.clientWidth > 0)
                    this.viewport.draw();
            };
            this.activeViewport = (_event) => {
                let event = new CustomEvent("activeViewport" /* ACTIVEVIEWPORT */, { detail: this.viewport.camera, bubbles: false });
                this.parentPanel.dispatchEvent(event);
                _event.cancelBubble = true;
            };
            if (_parent instanceof Fudge.NodePanel) {
                if (_parent.getNode() != null) {
                    this.branch = _parent.getNode();
                }
                else {
                    this.branch = new ƒ.Node("Scene");
                }
            }
            else {
                this.branch = new ƒ.Node("Scene");
            }
            this.fillContent();
        }
        deconstruct() {
            ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.animate);
        }
        fillContent() {
            let camera;
            // initialize RenderManager and transmit content
            ƒ.RenderManager.addBranch(this.branch);
            ƒ.RenderManager.update();
            // initialize viewport
            // TODO: create camera/canvas here without "Scenes"
            camera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5), ƒ.Vector3.ZERO());
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
            //Focus cameracontrols on new viewport
            let event = new CustomEvent("activeViewport" /* ACTIVEVIEWPORT */, { detail: this.viewport.camera, bubbles: false });
            this.parentPanel.dispatchEvent(event);
            this.canvas.addEventListener("click", this.activeViewport);
        }
        /**
         * Set the root node for display in this view
         * @param _node
         */
        setRoot(_node) {
            if (!_node)
                return;
            this.branch = _node;
            this.viewport.setBranch(this.branch);
        }
    }
    Fudge.ViewViewport = ViewViewport;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=Fudge.js.map