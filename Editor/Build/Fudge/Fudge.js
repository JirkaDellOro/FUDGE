var Fudge;
(function (Fudge) {
    // import ƒui = FudgeUserInterface;
    // import ƒ = FudgeCore;
    class ContextMenu {
        static appendCopyPaste(_menu) {
            _menu.append(new Fudge.remote.MenuItem({ role: "copy" }));
            _menu.append(new Fudge.remote.MenuItem({ role: "cut" }));
            _menu.append(new Fudge.remote.MenuItem({ role: "paste" }));
        }
        static getSubclassMenu(_id, _superclass, _callback) {
            const menu = new Fudge.remote.Menu();
            for (let iSubclass in _superclass) {
                let subclass = _superclass[iSubclass];
                let item = new Fudge.remote.MenuItem({ label: subclass.name, id: String(_id), click: _callback });
                //@ts-ignore
                item.overrideProperty("iSubclass", iSubclass);
                menu.append(item);
            }
            return menu;
        }
    }
    Fudge.ContextMenu = ContextMenu;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let CONTEXTMENU;
    (function (CONTEXTMENU) {
        // SKETCH = ViewSketch,
        CONTEXTMENU[CONTEXTMENU["ADD_NODE"] = 0] = "ADD_NODE";
        CONTEXTMENU[CONTEXTMENU["ADD_COMPONENT"] = 1] = "ADD_COMPONENT";
        CONTEXTMENU[CONTEXTMENU["ADD_COMPONENT_SCRIPT"] = 2] = "ADD_COMPONENT_SCRIPT";
        CONTEXTMENU[CONTEXTMENU["DELETE_NODE"] = 3] = "DELETE_NODE";
        CONTEXTMENU[CONTEXTMENU["EDIT"] = 4] = "EDIT";
        CONTEXTMENU[CONTEXTMENU["CREATE"] = 5] = "CREATE";
        CONTEXTMENU[CONTEXTMENU["CONTROL_MODE"] = 6] = "CONTROL_MODE";
        CONTEXTMENU[CONTEXTMENU["INTERACTION_MODE"] = 7] = "INTERACTION_MODE";
        CONTEXTMENU[CONTEXTMENU["CREATE_MESH"] = 8] = "CREATE_MESH";
        CONTEXTMENU[CONTEXTMENU["CREATE_MATERIAL"] = 9] = "CREATE_MATERIAL";
        CONTEXTMENU[CONTEXTMENU["CREATE_GRAPH"] = 10] = "CREATE_GRAPH";
    })(CONTEXTMENU = Fudge.CONTEXTMENU || (Fudge.CONTEXTMENU = {}));
    let MENU;
    (function (MENU) {
        MENU["QUIT"] = "quit";
        MENU["PROJECT_SAVE"] = "projectSave";
        MENU["PROJECT_LOAD"] = "projectLoad";
        MENU["DEVTOOLS_OPEN"] = "devtoolsOpen";
        MENU["PANEL_GRAPH_OPEN"] = "panelGraphOpen";
        MENU["PANEL_ANIMATION_OPEN"] = "panelAnimationOpen";
        MENU["PANEL_PROJECT_OPEN"] = "panelProjectOpen";
        MENU["FULLSCREEN"] = "fullscreen";
        MENU["PANEL_MODELLER_OPEN"] = "panelModellerOpen";
        /* obsolete ?
    NODE_DELETE = "nodeDelete",
    NODE_UPDATE = "nodeUpdate",
    */
    })(MENU = Fudge.MENU || (Fudge.MENU = {}));
    let EVENT_EDITOR;
    (function (EVENT_EDITOR) {
        EVENT_EDITOR["SET_GRAPH"] = "setGraph";
        EVENT_EDITOR["FOCUS_NODE"] = "focusNode";
        EVENT_EDITOR["SET_PROJECT"] = "setProject";
        EVENT_EDITOR["UPDATE"] = "update";
        EVENT_EDITOR["DESTROY"] = "destroy";
        /* obsolete ?
        REMOVE = "removeNode",
        HIDE = "hideNode",
        ACTIVATE_VIEWPORT = "activateViewport",
        */
    })(EVENT_EDITOR = Fudge.EVENT_EDITOR || (Fudge.EVENT_EDITOR = {}));
    let PANEL;
    (function (PANEL) {
        PANEL["GRAPH"] = "PanelGraph";
        PANEL["PROJECT"] = "PanelProject";
        PANEL["MODELLER"] = "PanelModeller";
    })(PANEL = Fudge.PANEL || (Fudge.PANEL = {}));
    let VIEW;
    (function (VIEW) {
        VIEW["HIERARCHY"] = "ViewHierarchy";
        VIEW["ANIMATION"] = "ViewAnimation";
        VIEW["RENDER"] = "ViewRender";
        VIEW["COMPONENTS"] = "ViewComponents";
        VIEW["CAMERA"] = "ViewCamera";
        VIEW["INTERNAL"] = "ViewInternal";
        VIEW["EXTERNAL"] = "ViewExternal";
        VIEW["PROPERTIES"] = "ViewProperties";
        VIEW["PREVIEW"] = "ViewPreview";
        VIEW["MODELLER"] = "ViewModeller";
        VIEW["OBJECT_PROPERTIES"] = "ViewObjectProperties";
        // PROJECT = ViewProject,
        VIEW["SCRIPT"] = "ViewScript";
        // SKETCH = ViewSketch,
        // MESH = ViewMesh,
    })(VIEW = Fudge.VIEW || (Fudge.VIEW = {}));
})(Fudge || (Fudge = {}));
// /<reference types="../../../node_modules/@types/node/fs"/>
var Fudge;
// /<reference types="../../../node_modules/@types/node/fs"/>
(function (Fudge) {
    let MIME;
    (function (MIME) {
        MIME["TEXT"] = "text";
        MIME["AUDIO"] = "audio";
        MIME["IMAGE"] = "image";
        MIME["UNKNOWN"] = "unknown";
    })(MIME = Fudge.MIME || (Fudge.MIME = {}));
    let mime = new Map([
        [MIME.TEXT, ["ts", "json", "html", "htm", "css", "js", "txt"]],
        [MIME.AUDIO, ["mp3", "wav", "ogg"]],
        [MIME.IMAGE, ["png", "jpg", "jpeg", "tif", "tga", "gif"]]
    ]);
    const fs = require("fs");
    const { Dirent, PathLike, renameSync, removeSync, readdirSync, readFileSync, copySync } = require("fs");
    const { basename, dirname, join } = require("path");
    class DirectoryEntry {
        constructor(_path, _pathRelative, _dirent, _stats) {
            this.path = _path;
            this.pathRelative = _pathRelative;
            this.dirent = _dirent;
            this.stats = _stats;
        }
        static createRoot(_path) {
            let dirent = new Dirent();
            dirent.name = basename(_path);
            dirent.isRoot = true;
            return new DirectoryEntry(_path, "", dirent, null);
        }
        get name() {
            return this.dirent.name;
        }
        set name(_name) {
            let newPath = join(dirname(this.path), _name);
            renameSync(this.path, newPath);
            this.path = newPath;
            this.dirent.name = _name;
        }
        get isDirectory() {
            return this.dirent.isDirectory() || this.dirent.isRoot;
        }
        get type() {
            return this.isDirectory ? "Directory" : "File";
        }
        delete() {
            removeSync(this.path);
        }
        getDirectoryContent() {
            let dirents = readdirSync(this.path, { withFileTypes: true });
            let content = [];
            for (let dirent of dirents) {
                let path = join(this.path, dirent.name);
                let pathRelative = join(this.pathRelative, dirent.name);
                let stats = fs.statSync(path);
                let entry = new DirectoryEntry(path, pathRelative, dirent, stats);
                content.push(entry);
            }
            return content;
        }
        getFileContent() {
            let content = readFileSync(this.path, "utf8");
            return content;
        }
        addEntry(_entry) {
            copySync(_entry.path, join(this.path, _entry.name));
        }
        getMimeType() {
            let extension = this.name.split(".").pop();
            for (let type of mime) {
                if (type[1].indexOf(extension) > -1)
                    return type[0];
            }
            return MIME.UNKNOWN;
        }
    }
    Fudge.DirectoryEntry = DirectoryEntry;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    const fs = require("fs");
    async function saveProject() {
        if (!await Fudge.project.openDialog())
            return;
        let filename = Fudge.remote.dialog.showOpenDialogSync(null, {
            properties: ["openDirectory", "createDirectory"], title: "Select a folder to save the project to", buttonLabel: "Save Project"
        });
        if (!filename)
            return;
        filename = filename[0] + "/a.b";
        console.log(filename);
        if (Fudge.project.files.index.overwrite) {
            let html = Fudge.project.getProjectHTML();
            let htmlFileName = new URL(Fudge.project.files.index.filename, filename);
            fs.writeFileSync(htmlFileName, html);
        }
        if (Fudge.project.files.style.overwrite) {
            let cssFileName = new URL(Fudge.project.files.style.filename, filename);
            fs.writeFileSync(cssFileName, Fudge.project.getProjectCSS());
        }
        if (Fudge.project.files.internal.overwrite) {
            let jsonFileName = new URL(Fudge.project.files.internal.filename, filename);
            console.log(jsonFileName);
            fs.writeFileSync(jsonFileName, Fudge.project.getProjectJSON());
        }
    }
    Fudge.saveProject = saveProject;
    async function saveMesh(jsonString) {
        let filename = Fudge.remote.dialog.showOpenDialogSync(null, {
            properties: ["openDirectory", "createDirectory"], title: "Select a folder to save the project to", buttonLabel: "Save Project"
        });
        if (!filename)
            return;
        let url = new URL("mesh.json", filename[0] + "\\");
        fs.writeFileSync(url, jsonString);
    }
    Fudge.saveMesh = saveMesh;
    async function promptLoadProject() {
        let filenames = Fudge.remote.dialog.showOpenDialogSync(null, {
            title: "Load Project", buttonLabel: "Load Project", properties: ["openFile"],
            filters: [{ name: "HTML-File", extensions: ["html", "htm"] }]
        });
        if (!filenames)
            return null;
        return new URL(filenames[0]);
    }
    Fudge.promptLoadProject = promptLoadProject;
    async function loadProject(_url) {
        let content = fs.readFileSync(_url, { encoding: "utf-8" });
        ƒ.Debug.groupCollapsed("File content");
        ƒ.Debug.info(content);
        ƒ.Debug.groupEnd();
        const parser = new DOMParser();
        const dom = parser.parseFromString(content, "application/xhtml+xml");
        const head = dom.querySelector("head");
        console.log(head);
        ƒ.Project.clear();
        Fudge.project.title = head.querySelector("title").textContent;
        Fudge.project.files.index.filename = _url.toString().split("/").pop();
        Fudge.project.files.index.overwrite = false;
        let css = head.querySelector("link[rel=stylesheet]");
        Fudge.project.files.style.filename = css.getAttribute("href");
        Fudge.project.files.style.overwrite = false;
        //TODO: should old scripts be removed from memory first? How?
        const scripts = head.querySelectorAll("script");
        for (let script of scripts) {
            if (script.getAttribute("editor") == "true") {
                let url = script.getAttribute("src");
                ƒ.Debug.fudge("Load script: ", url);
                await ƒ.Project.loadScript(new URL(url, _url).toString());
                console.log("ComponentScripts", ƒ.Project.getComponentScripts());
                console.log("Script Namespaces", ƒ.Project.scriptNamespaces);
                Fudge.project.files.script.filename = url;
                Reflect.set(Fudge.project.files.script, "include", true);
            }
        }
        const resourceLinks = head.querySelectorAll("link[type=resources]");
        for (let resourceLink of resourceLinks) {
            let resourceFile = resourceLink.getAttribute("src");
            ƒ.Project.baseURL = _url;
            let reconstruction = await ƒ.Project.loadResources(new URL(resourceFile, _url).toString());
            ƒ.Debug.groupCollapsed("Deserialized");
            ƒ.Debug.info(reconstruction);
            ƒ.Debug.groupEnd();
            Fudge.project.files.internal.filename = resourceFile;
            Fudge.project.files.internal.overwrite = true;
        }
    }
    Fudge.loadProject = loadProject;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    class FileInfo extends ƒ.Mutable {
        constructor(_overwrite, _filename) {
            super();
            this.overwrite = _overwrite;
            this.filename = _filename;
        }
        reduceMutator(_mutator) { }
    }
    class Files extends ƒ.Mutable {
        constructor() {
            super();
            this.index = new FileInfo(true, "");
            this.style = new FileInfo(true, "");
            this.internal = new FileInfo(true, "");
            this.script = new FileInfo(true, "");
            Reflect.deleteProperty(this.script, "overwrite");
            Reflect.set(this.script, "include", false);
            this.script.filename = "?.js";
        }
        reduceMutator(_mutator) { }
    }
    Fudge.Files = Files;
    class Project extends ƒ.Mutable {
        constructor() {
            super();
            this.files = new Files();
            this.title = "NewProject";
            this.includePhysics = false;
            this.includeAutoViewScript = true;
            this.graphToStartWith = "";
            this.hndChange = (_event) => {
                let mutator = ƒui.Controller.getMutator(this, ƒui.Dialog.dom, this.getMutator());
                console.log(mutator, this);
                if (mutator.title != this.title) {
                    this.updateFilenames(mutator.title, false, mutator);
                    ƒui.Controller.updateUserInterface(this, ƒui.Dialog.dom, mutator);
                }
            };
            this.updateFilenames("NewProject", true, this);
        }
        async openDialog() {
            let promise = ƒui.Dialog.prompt(Fudge.project, false, "Review project settings", "Adjust settings and press OK", "OK", "Cancel");
            ƒui.Dialog.dom.addEventListener("change" /* CHANGE */, this.hndChange);
            if (await promise) {
                console.log("OK");
                let mutator = ƒui.Controller.getMutator(this, ƒui.Dialog.dom, this.getMutator());
                this.mutate(mutator);
                return true;
            }
            else
                return false;
        }
        getProjectJSON() {
            let serialization = ƒ.Project.serialize();
            let json = ƒ.Serializer.stringify(serialization);
            return json;
        }
        getProjectCSS() {
            let content = "";
            content += "html, body {\n  padding: 0px;\n  margin: 0px;\n  width: 100%;\n  height: 100%;\n overflow: hidden;\n}\n\n";
            content += "dialog { \n  text-align: center; \n}\n\n";
            content += "canvas.fullscreen { \n  width: 100vw; \n  height: 100vh; \n}";
            return content;
        }
        getProjectHTML() {
            let html = document.implementation.createHTMLDocument(this.title);
            html.head.appendChild(createTag("meta", { charset: "utf-8" }));
            html.head.appendChild(html.createComment("Load FUDGE"));
            html.head.appendChild(createTag("script", { type: "text/javascript", src: "../../../Core/Build/FudgeCore.js" }));
            html.head.appendChild(createTag("script", { type: "text/javascript", src: "../../../Aid/Build/FudgeAid.js" }));
            html.head.appendChild(html.createComment("Link stylesheet and internal resources"));
            html.head.appendChild(createTag("link", { rel: "stylesheet", href: this.files.style.filename }));
            html.head.appendChild(createTag("link", { type: "resources", src: this.files.internal.filename }));
            if (Reflect.get(this.files.script, "include")) {
                html.head.appendChild(html.createComment("Load custom scripts"));
                html.head.appendChild(createTag("script", { type: "text/javascript", src: this.files.script.filename, editor: "true" }));
            }
            if (this.includeAutoViewScript) {
                html.head.appendChild(html.createComment("Auto-View"));
                html.head.appendChild(this.getAutoViewScript(this.graphToStartWith));
            }
            html.body.appendChild(html.createComment("Dialog shown at startup only"));
            let dialog = createTag("dialog");
            dialog.appendChild(createTag("h1", {}, this.title));
            dialog.appendChild(createTag("p", {}, "click to start"));
            html.body.appendChild(dialog);
            html.body.appendChild(html.createComment("Canvas for FUDGE to render to"));
            html.body.appendChild(createTag("canvas", { class: "fullscreen" }));
            function createTag(_tag, _attributes = {}, _content) {
                let element = document.createElement(_tag);
                for (let attribute in _attributes)
                    element.setAttribute(attribute, _attributes[attribute]);
                if (_content)
                    element.innerHTML = _content;
                return element;
            }
            let result = (new XMLSerializer()).serializeToString(html);
            result = result.replaceAll("><", ">\n<");
            return result;
        }
        getGraphs() {
            let graphs = ƒ.Project.getResourcesOfType(ƒ.Graph);
            let result = {};
            for (let id in graphs) {
                let graph = graphs[id];
                result[graph.name] = id;
            }
            return result;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.graphToStartWith)
                types.graphToStartWith = this.getGraphs();
            return types;
        }
        reduceMutator(_mutator) { }
        updateFilenames(_title, _all = false, _mutator) {
            let files = { html: _mutator.files.index, css: _mutator.files.style, json: _mutator.files.internal };
            for (let key in files) {
                let fileInfo = files[key];
                fileInfo.overwrite = _all || fileInfo.overwrite;
                if (fileInfo.overwrite)
                    fileInfo.filename = _title + "." + key;
            }
        }
        getAutoViewScript(_graphId) {
            let code;
            code = (function (_graphId) {
                window.addEventListener("load", init);
                // show dialog for startup
                let dialog;
                function init(_event) {
                    dialog = document.querySelector("dialog");
                    dialog.addEventListener("click", function (_event) {
                        dialog.close();
                        startInteractiveViewport();
                    });
                    dialog.showModal();
                }
                // setup and start interactive viewport
                async function startInteractiveViewport() {
                    // load resources referenced in the link-tag
                    await FudgeCore.Project.loadResourcesFromHTML();
                    // pick the graph to show
                    let graph = FudgeCore.Project.resources[_graphId];
                    // setup the viewport
                    let cmpCamera = new FudgeCore.ComponentCamera();
                    let canvas = document.querySelector("canvas");
                    let viewport = new FudgeCore.Viewport();
                    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
                    // hide the cursor when interacting, also suppressing right-click menu
                    canvas.addEventListener("mousedown", canvas.requestPointerLock);
                    canvas.addEventListener("mouseup", function () { document.exitPointerLock(); });
                    // make the camera interactive (complex method in FudgeAid)
                    FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
                    // setup audio
                    let cmpListener = new ƒ.ComponentAudioListener();
                    cmpCamera.getContainer().addComponent(cmpListener);
                    FudgeCore.AudioManager.default.listenWith(cmpListener);
                    FudgeCore.AudioManager.default.listenTo(graph);
                    // draw viewport once for immediate feedback
                    viewport.draw();
                }
            }).toString();
            code = "(" + code + `)("${_graphId}");\n`;
            let script = document.createElement("script");
            script.textContent = code;
            return script;
        }
    }
    Fudge.Project = Project;
})(Fudge || (Fudge = {}));
///<reference types="../../../node_modules/electron/Electron"/>
///<reference types="../../../Aid/Build/FudgeAid"/>
///<reference types="../../../UserInterface/Build/FudgeUserInterface"/>
///<reference path="Project.ts"/>
var Fudge;
///<reference types="../../../node_modules/electron/Electron"/>
///<reference types="../../../Aid/Build/FudgeAid"/>
///<reference types="../../../UserInterface/Build/FudgeUserInterface"/>
///<reference path="Project.ts"/>
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒaid = FudgeAid;
    Fudge.ipcRenderer = require("electron").ipcRenderer;
    Fudge.remote = require("electron").remote;
    Fudge.project = new Fudge.Project();
    let modellerNode;
    /**
     * The uppermost container for all panels controlling data flow between.
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class Page {
        static async start() {
            // TODO: At this point of time, the project is just a single node. A project is much more complex...
            let node = null;
            Page.setupGoldenLayout();
            ƒ.Project.mode = ƒ.MODE.EDITOR;
            // TODO: create a new Panel containing a ViewData by default. More Views can be added by the user or by configuration
            Page.setupMainListeners();
            Page.setupPageListeners();
            // for testing:
            Fudge.ipcRenderer.emit(Fudge.MENU.PANEL_PROJECT_OPEN);
            Fudge.ipcRenderer.emit(Fudge.MENU.PANEL_GRAPH_OPEN);
            //ipcRenderer.emit(MENU.PANEL_MODELLER_OPEN);
            // ipcRenderer.emit(MENU.PROJECT_LOAD);
        }
        static setupGoldenLayout() {
            let config = {
                settings: { showPopoutIcon: false },
                content: [{
                        id: "root", type: "row", isClosable: false,
                        content: [
                        // { type: "component", componentName: "Welcome", title: "Welcome", componentState: {} }
                        ]
                    }]
            };
            this.goldenLayout = new GoldenLayout(config); //This might be a problem because it can't use a specific place to put it.
            this.goldenLayout.registerComponent("Welcome", welcome);
            this.goldenLayout.registerComponent(Fudge.PANEL.GRAPH, Fudge.PanelGraph);
            this.goldenLayout.registerComponent(Fudge.PANEL.PROJECT, Fudge.PanelProject);
            this.goldenLayout.registerComponent(Fudge.PANEL.MODELLER, Fudge.PanelModeller);
            this.goldenLayout.init();
        }
        static add(_panel, _title, _state) {
            let config = {
                type: "stack",
                content: [{
                        type: "component", componentName: _panel.name, componentState: _state,
                        title: _title, id: this.generateID(_panel.name)
                    }]
            };
            let inner = this.goldenLayout.root.contentItems[0];
            let item = Page.goldenLayout.createContentItem(config);
            inner.addChild(item);
            this.panels.push(item.getComponentsByName(_panel.name)[0]);
        }
        static find(_type) {
            let result = [];
            // for (let panel of Page.panels) {
            //   if (panel instanceof _type)
            //     result.push(panel);
            // }
            result = Page.panels.filter((_panel) => { return _panel instanceof _type; });
            return result;
        }
        static generateID(_name) {
            return _name + Page.idCounter++;
        }
        //#region Page-Events from DOM
        static setupPageListeners() {
            document.addEventListener(Fudge.EVENT_EDITOR.SET_GRAPH, Page.hndEvent);
            document.addEventListener("mutate" /* MUTATE */, Page.hndEvent);
            document.addEventListener(Fudge.EVENT_EDITOR.UPDATE, Page.hndEvent);
            document.addEventListener(Fudge.EVENT_EDITOR.DESTROY, Page.hndEvent);
        }
        /** Send custom copies of the given event to the views */
        static broadcastEvent(_event) {
            for (let panel of Page.panels) {
                let event = new CustomEvent(_event.type, { bubbles: false, cancelable: true, detail: _event.detail });
                panel.dom.dispatchEvent(event);
            }
        }
        static hndEvent(_event) {
            // ƒ.Debug.fudge("Page received", _event.type, _event);
            switch (_event.type) {
                case Fudge.EVENT_EDITOR.DESTROY:
                    let view = _event.detail;
                    console.log("Page received DESTROY", view);
                    if (view instanceof Fudge.Panel)
                        Page.panels.splice(Page.panels.indexOf(view), 1);
                    break;
                case Fudge.EVENT_EDITOR.SET_GRAPH:
                    let panel = Page.find(Fudge.PanelGraph);
                    if (!panel.length)
                        Page.add(Fudge.PanelGraph, "Graph", Object({ node: new ƒaid.NodeCoordinateSystem("WorldCooSys") }));
                // break;
                default:
                    Page.broadcastEvent(_event);
                    break;
            }
        }
        //#endregion
        //#region Main-Events from Electron
        static setupMainListeners() {
            Fudge.ipcRenderer.on(Fudge.MENU.PROJECT_SAVE, (_event, _args) => {
                //saveProject();
                switch (this.currentPanel) {
                    case Fudge.PANEL.PROJECT:
                        Fudge.saveProject();
                        break;
                    case Fudge.PANEL.MODELLER:
                        let mesh = modellerNode.getComponent(ƒ.ComponentMesh).mesh;
                        Fudge.saveMesh(mesh.export());
                        break;
                }
            });
            Fudge.ipcRenderer.on(Fudge.MENU.PROJECT_LOAD, async (_event, _args) => {
                let url = await Fudge.promptLoadProject();
                if (url)
                    await Fudge.loadProject(url);
                // Page.broadcastEvent(new CustomEvent(EVENT_EDITOR.SET_GRAPH, { detail: node }));
                Page.broadcastEvent(new CustomEvent(Fudge.EVENT_EDITOR.SET_PROJECT));
            });
            Fudge.ipcRenderer.on(Fudge.MENU.PANEL_GRAPH_OPEN, (_event, _args) => {
                let node = new ƒaid.NodeCoordinateSystem("WorldCooSys");
                Page.add(Fudge.PanelGraph, "Graph", Object({ node: node }));
                Page.broadcastEvent(new CustomEvent(Fudge.EVENT_EDITOR.UPDATE, { detail: node }));
            });
            Fudge.ipcRenderer.on(Fudge.MENU.PANEL_PROJECT_OPEN, (_event, _args) => {
                this.currentPanel = Fudge.PANEL.PROJECT;
                Page.add(Fudge.PanelProject, "Project", null); //Object.create(null,  {node: { writable: true, value: node }}));
            });
            Fudge.ipcRenderer.on(Fudge.MENU.PANEL_ANIMATION_OPEN, (_event, _args) => {
                //   let panel: Panel = PanelManager.instance.createPanelFromTemplate(new ViewAnimationTemplate(), "Animation Panel");
                //   PanelManager.instance.addPanel(panel);
            });
            Fudge.ipcRenderer.on(Fudge.MENU.PANEL_MODELLER_OPEN, (_event, _args) => {
                let node = new ƒ.Node("graph");
                let defaultNode = new ƒaid.Node("Default", new ƒ.Matrix4x4(), new ƒ.Material("mtr", ƒ.ShaderFlat, new ƒ.CoatColored()), new Fudge.ModifiableMesh());
                modellerNode = defaultNode;
                node.addChild(defaultNode);
                this.currentPanel = Fudge.PANEL.MODELLER;
                Page.add(Fudge.PanelModeller, "Modeller", Object({ node: node }));
            });
        }
    }
    Page.idCounter = 0;
    Page.panels = [];
    Page.currentPanel = Fudge.PANEL.PROJECT;
    Fudge.Page = Page;
    function welcome(container, state) {
        container.getElement().html("<div>Welcome</div>");
    }
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class AnimationList {
        constructor(_mutator, _listContainer) {
            this.collectMutator = () => {
                let children = this.listRoot.children;
                // for (let child of children) {
                //   this.mutator[(<ƒui.CollapsableAnimationList>child).name] = (<ƒui.CollapsableAnimationList>child).mutator;
                // }
                ƒ.Debug.info(this.mutator);
                return this.mutator;
            };
            this.toggleCollapse = (_event) => {
                _event.preventDefault();
                // console.log(_event.target instanceof ƒui.CollapsableAnimationList);
                // if (_event.target instanceof ƒui.CollapsableAnimationList) {
                //   let target: ƒui.CollapsableAnimationList = <ƒui.CollapsableAnimationList>_event.target;
                //   target.collapse(target);
                // }
            };
            this.mutator = _mutator;
            this.listRoot = document.createElement("ul");
            this.index = {};
            this.listRoot = this.buildFromMutator(this.mutator);
            _listContainer.append(this.listRoot);
            _listContainer.addEventListener("collapse" /* COLLAPSE */, this.toggleCollapse);
            // _listContainer.addEventListener(ƒui.EVENT.UPDATE, this.collectMutator);
            _listContainer.addEventListener("mutate" /* MUTATE */, this.collectMutator);
        }
        getMutator() {
            return this.mutator;
        }
        setMutator(_mutator) {
            this.mutator = _mutator;
            let hule = this.buildFromMutator(this.mutator);
            this.listRoot.replaceWith(hule);
            this.listRoot = hule;
        }
        getElementIndex() {
            return this.index;
        }
        updateMutator(_update) {
            this.mutator = this.updateMutatorEntry(_update, this.mutator);
            this.updateEntry(this.mutator, this.index);
        }
        updateEntry(_update, _index) {
            for (let key in _update) {
                if (typeof _update[key] == "object") {
                    this.updateEntry(_update[key], _index[key]);
                }
                else if (typeof _update[key] == "string" || "number") {
                    let element = _index[key];
                    element.value = _update[key];
                }
            }
        }
        updateMutatorEntry(_update, _toUpdate) {
            let updatedMutator = _toUpdate;
            for (let key in _update) {
                if (typeof updatedMutator[key] == "object") {
                    if (typeof updatedMutator[key] == "object") {
                        updatedMutator[key] = this.updateMutatorEntry(_update[key], updatedMutator[key]);
                    }
                }
                else if (typeof _update[key] == "string" || "number") {
                    if (typeof updatedMutator[key] == "string" || "number") {
                        updatedMutator[key] = _update[key];
                    }
                }
            }
            return updatedMutator;
        }
        buildFromMutator(_mutator) {
            let listRoot = document.createElement("ul");
            // for (let key in _mutator) {
            //   let listElement: ƒui.CollapsableAnimationList = new ƒui.CollapsableAnimationList((<ƒ.Mutator>this.mutator[key]), key);
            //   listRoot.append(listElement);
            //   this.index[key] = listElement.getElementIndex();
            //   console.log(this.index);
            // }
            return listRoot;
        }
    }
    Fudge.AnimationList = AnimationList;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    class CameraControl {
        constructor(viewport) {
            this.target = ƒ.Vector3.ZERO();
            this.onclick = (_event) => {
                switch (_event.button) {
                    case 1: this.currentRotation = this.viewport.camera.pivot.rotation;
                }
            };
            this.handleMove = (_event) => {
                if ((_event.buttons & 4) === 4) {
                    _event.preventDefault();
                    if (_event.shiftKey) {
                        this.moveCamera(_event);
                    }
                    else {
                        this.rotateCamera(_event);
                    }
                }
            };
            this.zoom = (_event) => {
                _event.preventDefault();
                let cameraPivot = this.viewport.camera.pivot;
                let delta = _event.deltaY * 0.01;
                try {
                    let normTrans = ƒ.Vector3.NORMALIZATION(cameraPivot.translation);
                    cameraPivot.translation = new ƒ.Vector3(cameraPivot.translation.x + (normTrans.x - this.target.x) * delta, cameraPivot.translation.y + (normTrans.y - this.target.y) * delta, cameraPivot.translation.z + (normTrans.z - this.target.z) * delta);
                }
                catch (_error) {
                    ƒ.Debug.log(_error);
                }
            };
            this.viewport = viewport;
            this.viewport.adjustingFrames = true;
            this.currentRotation = viewport.camera.pivot.rotation;
            this.viewport.addEventListener("\u0192pointerdown" /* DOWN */, this.onclick);
            this.viewport.activatePointerEvent("\u0192pointerdown" /* DOWN */, true);
            this.viewport.addEventListener("\u0192pointermove" /* MOVE */, this.handleMove);
            this.viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
            this.viewport.addEventListener("\u0192wheel" /* WHEEL */, this.zoom);
            this.viewport.activateWheelEvent("\u0192wheel" /* WHEEL */, true);
            viewport.setFocus(true);
        }
        rotateCamera(_event) {
            let currentTranslation = this.viewport.camera.pivot.translation;
            let magicalScaleDivisor = 4;
            let angleYaxis = _event.movementX / magicalScaleDivisor;
            let mtxYrot = ƒ.Matrix4x4.ROTATION_Y(angleYaxis);
            currentTranslation = this.multiplyMatrixes(mtxYrot, currentTranslation);
            let cameraRotation = this.viewport.camera.pivot.rotation;
            let degreeToRad = Math.PI / 180;
            let angleZAxis = Math.sin(degreeToRad * cameraRotation.y) * (_event.movementY / magicalScaleDivisor);
            let angleXAxis = -(Math.cos(degreeToRad * cameraRotation.y) * (_event.movementY / magicalScaleDivisor));
            angleZAxis = Math.min(Math.max(-89, angleZAxis), 89);
            angleXAxis = Math.min(Math.max(-89, angleXAxis), 89);
            let mtxXrot = ƒ.Matrix4x4.ROTATION_X(angleXAxis);
            currentTranslation = this.multiplyMatrixes(mtxXrot, currentTranslation);
            let mtxZrot = ƒ.Matrix4x4.ROTATION_Z(angleZAxis);
            this.viewport.camera.pivot.translation = this.multiplyMatrixes(mtxZrot, currentTranslation);
            let rotation = ƒ.Matrix4x4.MULTIPLICATION(ƒ.Matrix4x4.MULTIPLICATION(mtxYrot, mtxXrot), mtxZrot).rotation;
            this.viewport.camera.pivot.rotation = rotation;
            this.viewport.camera.pivot.lookAt(this.target);
        }
        moveCamera(_event) {
            let currentTranslation = this.viewport.camera.pivot.translation;
            let distanceToTarget = ƒ.Vector3.DIFFERENCE(currentTranslation, this.target).magnitude;
            let cameraRotation = this.viewport.camera.pivot.rotation;
            let degreeToRad = Math.PI / 180;
            let cosX = Math.cos(cameraRotation.x * degreeToRad);
            let cosY = Math.cos(cameraRotation.y * degreeToRad);
            let sinX = Math.sin(cameraRotation.x * degreeToRad);
            let sinY = Math.sin(cameraRotation.y * degreeToRad);
            let movementXscaled = _event.movementX / 100;
            let movementYscaled = _event.movementY / 100;
            let translationChange = new ƒ.Vector3(-cosY * movementXscaled - sinX * sinY * movementYscaled, -cosX * movementYscaled, sinY * movementXscaled - sinX * cosY * movementYscaled);
            this.viewport.camera.pivot.translation = new ƒ.Vector3(currentTranslation.x + translationChange.x, currentTranslation.y + translationChange.y, currentTranslation.z + translationChange.z);
            let rayToCenter = this.viewport.getRayFromClient(new ƒ.Vector2(this.viewport.getCanvasRectangle().width / 2, this.viewport.getCanvasRectangle().height / 2));
            rayToCenter.direction.scale(distanceToTarget);
            let rayEnd = ƒ.Vector3.SUM(rayToCenter.origin, rayToCenter.direction);
            this.target = rayEnd;
        }
        multiplyMatrixes(mtx, vector) {
            let x = ƒ.Vector3.DOT(mtx.getX(), vector);
            let y = ƒ.Vector3.DOT(mtx.getY(), vector);
            let z = ƒ.Vector3.DOT(mtx.getZ(), vector);
            return new ƒ.Vector3(x, y, z);
        }
    }
    Fudge.CameraControl = CameraControl;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    /**
     * Base class for all [[View]]s to support generic functionality
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class View {
        constructor(_container, _state) {
            //#region  ContextMenu
            this.openContextMenu = (_event) => {
                this.contextMenu.popup();
            };
            this.hndEventCommon = (_event) => {
                switch (_event.type) {
                    case Fudge.EVENT_EDITOR.SET_PROJECT:
                        this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
                        break;
                }
            };
            this.dom = document.createElement("div");
            this.dom.style.height = "100%";
            this.dom.style.overflow = "auto";
            this.dom.setAttribute("view", this.constructor.name);
            _container.getElement().append(this.dom);
            this.container = _container;
            this.container.on("destroy", (_e) => this.dom.dispatchEvent(new CustomEvent(Fudge.EVENT_EDITOR.DESTROY, { bubbles: true, detail: _e["instance"] })));
            // console.log(this.contextMenuCallback);
            this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SET_PROJECT, this.hndEventCommon);
            this.id = View.registerViewForDragDrop(this);
        }
        static getViewSource(_event) {
            for (let item of _event.dataTransfer.items)
                if (item.type.startsWith("sourceview"))
                    return View.views[item.type.split(":").pop()];
            return null;
        }
        static registerViewForDragDrop(_this) {
            View.views[View.idCount] = _this;
            // when drag starts, add identifier to the event in a way that allows dragover to process the soure
            _this.dom.addEventListener("dragstart" /* DRAG_START */, (_event) => {
                _event.stopPropagation();
                _event.dataTransfer.setData("SourceView:" + _this.id.toString(), "typesHack");
            });
            // when dragging over a view, get the original source view for dragging and call hndDragOver
            _this.dom.addEventListener("dragover" /* DRAG_OVER */, (_event) => {
                _event.stopPropagation();
                let viewSource = View.getViewSource(_event);
                _this.hndDragOver(_event, viewSource);
            });
            // when dropping into a view, get the original source view for dragging and call hndDrop
            _this.dom.addEventListener("drop" /* DROP */, (_event) => {
                // _event.stopPropagation();
                let viewSource = View.getViewSource(_event);
                _this.hndDrop(_event, viewSource);
            }, true);
            return View.idCount++;
        }
        setTitle(_title) {
            this.container.setTitle(_title);
        }
        getDragDropSources() {
            return [];
        }
        getContextMenu(_callback) {
            console.log(Fudge.ipcRenderer);
            const menu = new Fudge.remote.Menu();
            // ContextMenu.appendCopyPaste(menu);
            return menu;
        }
        contextMenuCallback(_item, _window, _event) {
            ƒ.Debug.info(`ContextMenu: Item-id=${Fudge.CONTEXTMENU[_item.id]}`);
        }
        //#endregion
        //#region Events
        hndDrop(_event, _source) {
            // console.log(_source, _event);
        }
        hndDragOver(_event, _source) {
            // _event.dataTransfer.dropEffect = "link";
        }
    }
    View.views = {};
    View.idCount = 0;
    Fudge.View = View;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    /**
     * List the external resources
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewExternal extends Fudge.View {
        constructor(_container, _state) {
            super(_container, _state);
            this.hndEvent = (_event) => {
                this.setProject();
            };
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SET_PROJECT, this.hndEvent);
        }
        setProject() {
            while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild))
                ;
            let path = new URL(".", ƒ.Project.baseURL).pathname;
            path = path.substr(1); // strip leading slash
            let root = Fudge.DirectoryEntry.createRoot(path);
            this.tree = new ƒui.Tree(new Fudge.ControllerTreeDirectory(), root);
            this.dom.appendChild(this.tree);
            this.tree.getItems()[0].expand(true);
        }
        getSelection() {
            return this.tree.controller.selection;
        }
        getDragDropSources() {
            return this.tree.controller.dragDrop.sources;
        }
    }
    Fudge.ViewExternal = ViewExternal;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    Fudge.typesOfResources = [
        ƒ.Mesh
    ];
    /**
     * List the internal resources
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewInternal extends Fudge.View {
        constructor(_container, _state) {
            super(_container, _state);
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case Fudge.EVENT_EDITOR.SET_PROJECT:
                    case Fudge.EVENT_EDITOR.UPDATE:
                        this.listResources();
                        break;
                    // case ƒui.EVENT.SELECT:
                    //   console.log(_event.detail.data);
                    //   break;
                }
            };
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SET_PROJECT, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.UPDATE, this.hndEvent);
            this.dom.addEventListener("contextmenu" /* CONTEXTMENU */, this.openContextMenu);
        }
        listResources() {
            while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild))
                ;
            this.table = new ƒui.Table(new Fudge.ControllerTableResource(), Object.values(ƒ.Project.resources));
            this.dom.appendChild(this.table);
        }
        getSelection() {
            return this.table.controller.selection;
        }
        getDragDropSources() {
            return this.table.controller.dragDrop.sources;
        }
        // #region  ContextMenu
        getContextMenu(_callback) {
            const menu = new Fudge.remote.Menu();
            let item;
            item = new Fudge.remote.MenuItem({
                label: "Create Mesh",
                submenu: Fudge.ContextMenu.getSubclassMenu(Fudge.CONTEXTMENU.CREATE_MESH, ƒ.Mesh.subclasses, _callback)
            });
            menu.append(item);
            item = new Fudge.remote.MenuItem({
                label: "Create Material",
                submenu: Fudge.ContextMenu.getSubclassMenu(Fudge.CONTEXTMENU.CREATE_MATERIAL, ƒ.Shader.subclasses, _callback)
            });
            menu.append(item);
            item = new Fudge.remote.MenuItem({ label: "Create Graph", id: String(Fudge.CONTEXTMENU.CREATE_GRAPH), click: _callback, accelerator: process.platform == "darwin" ? "G" : "G" });
            menu.append(item);
            // ContextMenu.appendCopyPaste(menu);
            return menu;
        }
        async contextMenuCallback(_item, _window, _event) {
            ƒ.Debug.fudge(`MenuSelect | id: ${Fudge.CONTEXTMENU[_item.id]} | event: ${_event}`);
            let iSubclass = _item["iSubclass"];
            switch (Number(_item.id)) {
                case Fudge.CONTEXTMENU.CREATE_MESH:
                    if (!iSubclass) {
                        alert("Funky Electron-Error... please try again");
                        return;
                    }
                    let typeMesh = ƒ.Mesh.subclasses[iSubclass];
                    //@ts-ignore
                    let meshNew = new typeMesh();
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.UPDATE, { bubbles: true }));
                    this.table.selectInterval(meshNew, meshNew);
                    break;
                case Fudge.CONTEXTMENU.CREATE_MATERIAL:
                    if (!iSubclass) {
                        alert("Funky Electron-Error... please try again");
                        return;
                    }
                    let typeShader = ƒ.Shader.subclasses[iSubclass];
                    let mtrNew = new ƒ.Material("NewMaterial", typeShader);
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.UPDATE, { bubbles: true }));
                    this.table.selectInterval(mtrNew, mtrNew);
                    break;
                case Fudge.CONTEXTMENU.CREATE_GRAPH:
                    let graph = await ƒ.Project.registerAsGraph(new ƒ.Node("NewGraph"));
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.UPDATE, { bubbles: true }));
                    this.table.selectInterval(graph, graph);
                    break;
                // case CONTEXTMENU.EDIT:
                //   let resource: ƒ.SerializableResource = this.table.getFocussed();
                //   this.dom.dispatchEvent(new CustomEvent(EVENT_EDITOR.SET_GRAPH, { bubbles: true, detail: resource }));
                //   break;
            }
        }
        //#endregion
        hndDragOver(_event, _viewSource) {
            _event.dataTransfer.dropEffect = "none";
            if (this.dom != _event.target)
                return;
            if (!(_viewSource instanceof Fudge.ViewExternal || _viewSource instanceof Fudge.ViewHierarchy))
                return;
            if (_viewSource instanceof Fudge.ViewExternal) {
                let sources = _viewSource.getDragDropSources();
                for (let source of sources)
                    if (source.getMimeType() != Fudge.MIME.AUDIO && source.getMimeType() != Fudge.MIME.IMAGE)
                        return;
            }
            _event.dataTransfer.dropEffect = "link";
            _event.preventDefault();
            _event.stopPropagation();
        }
        async hndDrop(_event, _viewSource) {
            if (_viewSource instanceof Fudge.ViewHierarchy) {
                let sources = _viewSource.getDragDropSources();
                for (let source of sources) {
                    await ƒ.Project.registerAsGraph(source, true);
                }
            }
            else if (_viewSource instanceof Fudge.ViewExternal) {
                let sources = _viewSource.getDragDropSources();
                for (let source of sources) {
                    switch (source.getMimeType()) {
                        case Fudge.MIME.AUDIO:
                            console.log(new ƒ.Audio(source.pathRelative));
                            break;
                        case Fudge.MIME.IMAGE:
                            console.log(new ƒ.TextureImage(source.pathRelative));
                            break;
                    }
                }
            }
            this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.UPDATE, { bubbles: true }));
        }
    }
    Fudge.ViewInternal = ViewInternal;
})(Fudge || (Fudge = {}));
///<reference path="../View/View.ts"/>
///<reference path="../View/Project/ViewExternal.ts"/>
///<reference path="../View/Project/ViewInternal.ts"/>
var Fudge;
///<reference path="../View/View.ts"/>
///<reference path="../View/Project/ViewExternal.ts"/>
///<reference path="../View/Project/ViewInternal.ts"/>
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    let filter = {
        UrlOnTexture: { fromViews: [Fudge.ViewExternal], onKeyAttribute: "url", onTypeAttribute: "TextureImage", ofType: Fudge.DirectoryEntry, dropEffect: "link" },
        UrlOnAudio: { fromViews: [Fudge.ViewExternal], onKeyAttribute: "url", onTypeAttribute: "Audio", ofType: Fudge.DirectoryEntry, dropEffect: "link" },
        MaterialOnComponentMaterial: { fromViews: [Fudge.ViewInternal], onTypeAttribute: "Material", onType: ƒ.ComponentMaterial, ofType: ƒ.Material, dropEffect: "link" },
        MeshOnComponentMesh: { fromViews: [Fudge.ViewInternal], onType: ƒ.ComponentMesh, ofType: ƒ.Mesh, dropEffect: "link" },
        MeshOnMeshLabel: { fromViews: [Fudge.ViewInternal], onKeyAttribute: "mesh", ofType: ƒ.Mesh, dropEffect: "link" },
        TextureOnMaterial: { fromViews: [Fudge.ViewInternal], onType: ƒ.Material, ofType: ƒ.Texture, dropEffect: "link" }
    };
    class ControllerComponent extends ƒui.Controller {
        constructor(_mutable, _domElement) {
            super(_mutable, _domElement);
            this.hndDragOver = (_event) => {
                // url on texture
                if (this.filterDragDrop(_event, filter.UrlOnTexture, checkMimeType(Fudge.MIME.IMAGE)))
                    return;
                // url on audio
                if (this.filterDragDrop(_event, filter.UrlOnAudio, checkMimeType(Fudge.MIME.AUDIO)))
                    return;
                // Material on ComponentMaterial
                if (this.filterDragDrop(_event, filter.MaterialOnComponentMaterial))
                    return;
                // Mesh on ComponentMesh
                if (this.filterDragDrop(_event, filter.MeshOnComponentMesh, (_sources) => {
                    let key = this.getAncestorWithType(_event.target).getAttribute("key");
                    return (key == "mesh");
                }))
                    return;
                // Mesh on MeshLabel
                if (this.filterDragDrop(_event, filter.MeshOnMeshLabel))
                    return;
                // Texture on Material
                if (this.filterDragDrop(_event, filter.TextureOnMaterial))
                    return;
                function checkMimeType(_mime) {
                    return (_sources) => {
                        let sources = _sources;
                        return (sources.length == 1 && sources[0].getMimeType() == _mime);
                    };
                }
            };
            this.hndDrop = (_event) => {
                let setExternalLink = (_sources) => {
                    let sources = _sources;
                    _event.target.value = sources[0].pathRelative;
                    this.mutateOnInput(_event);
                    return true;
                };
                let setResource = (_sources) => {
                    let ancestor = this.getAncestorWithType(_event.target);
                    let key = ancestor.getAttribute("key");
                    if (!this.mutable[key])
                        return false;
                    this.mutable[key] = _sources[0];
                    this.domElement.dispatchEvent(new Event(Fudge.EVENT_EDITOR.UPDATE, { bubbles: true }));
                    return true;
                };
                let setMesh = (_sources) => {
                    this.mutable["mesh"] = _sources[0];
                    this.domElement.dispatchEvent(new Event(Fudge.EVENT_EDITOR.UPDATE, { bubbles: true }));
                    return true;
                };
                let setTexture = (_sources) => {
                    this.mutable["coat"]["texture"] = _sources[0];
                    this.domElement.dispatchEvent(new Event(Fudge.EVENT_EDITOR.UPDATE, { bubbles: true }));
                    return true;
                };
                // texture
                if (this.filterDragDrop(_event, filter.UrlOnTexture, setExternalLink))
                    return;
                // audio
                if (this.filterDragDrop(_event, filter.UrlOnAudio, setExternalLink))
                    return;
                // Material on ComponentMaterial
                if (this.filterDragDrop(_event, filter.MaterialOnComponentMaterial, setResource))
                    return;
                // Mesh on ComponentMesh
                if (this.filterDragDrop(_event, filter.MeshOnComponentMesh, setResource))
                    return;
                // Mesh on MeshLabel
                if (this.filterDragDrop(_event, filter.MeshOnMeshLabel, setMesh))
                    return;
                // Texture on Material
                if (this.filterDragDrop(_event, filter.TextureOnMaterial, setTexture))
                    return;
            };
            this.domElement.addEventListener("input", this.mutateOnInput); // this should be obsolete
            this.domElement.addEventListener("dragover" /* DRAG_OVER */, this.hndDragOver);
            this.domElement.addEventListener("drop" /* DROP */, this.hndDrop);
            // this.domElement.addEventListener(ƒui.EVENT.UPDATE, this.hndUpdate);
        }
        filterDragDrop(_event, _filter, _callback = () => true) {
            let target = _event.target;
            let typeElement = target.parentElement.getAttribute("key");
            let typeComponent = this.getAncestorWithType(target).getAttribute("type");
            if (_filter.onKeyAttribute && typeElement != _filter.onKeyAttribute)
                return false;
            if (_filter.onTypeAttribute && typeComponent != _filter.onTypeAttribute)
                return false;
            if (_filter.onType && !(this.mutable instanceof _filter.onType))
                return false;
            let viewSource = Fudge.View.getViewSource(_event);
            if (filter.fromViews) {
                if (!_filter.fromViews.find((_view) => viewSource instanceof _view))
                    return false;
            }
            let sources = viewSource.getDragDropSources();
            if (!(sources[0] instanceof _filter.ofType))
                return false;
            if (!_callback(sources))
                return false;
            _event.dataTransfer.dropEffect = "link";
            _event.preventDefault();
            _event.stopPropagation();
            return true;
        }
        getAncestorWithType(_target) {
            let element = _target;
            while (element) {
                let type = element.getAttribute("type");
                if (type)
                    return element;
                element = element.parentElement;
            }
            return null;
        }
    }
    Fudge.ControllerComponent = ControllerComponent;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒui = FudgeUserInterface;
    class ControllerTableResource extends ƒui.TableController {
        static getHead() {
            let head = [];
            head.push({ label: "Name", key: "name", sortable: true, editable: true });
            head.push({ label: "Type", key: "type", sortable: true, editable: false });
            head.push({ label: "Id", key: "idResource", sortable: false, editable: false });
            return head;
        }
        getHead() {
            return ControllerTableResource.head;
        }
        getLabel(_object) { return ""; }
        rename(_object, _new) { return false; }
        delete(_focussed) { return null; }
        copy(_originals) { return null; }
        sort(_data, _key, _direction) {
            function compare(_a, _b) {
                return _direction * (_a[_key] == _b[_key] ? 0 : (_a[_key] > _b[_key] ? 1 : -1));
            }
            _data.sort(compare);
        }
    }
    ControllerTableResource.head = ControllerTableResource.getHead();
    Fudge.ControllerTableResource = ControllerTableResource;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒui = FudgeUserInterface;
    class ScriptInfo {
        constructor(_script, _namespace) {
            this.isComponent = false;
            this.isComponentScript = false;
            this.script = _script;
            this.name = _script.name;
            this.namespace = _namespace;
            let chain = _script["__proto__"];
            this.superClass = chain.name;
            do {
                this.isComponent ||= (chain.name == "Component");
                this.isComponentScript ||= (chain.name == "ComponentScript");
                chain = chain["__proto__"];
            } while (chain);
        }
    }
    Fudge.ScriptInfo = ScriptInfo;
    class ControllerTableScript extends ƒui.TableController {
        static getHead() {
            let head = [];
            head.push({ label: "Name", key: "name", sortable: true, editable: false });
            head.push({ label: "Super", key: "superClass", sortable: true, editable: false });
            head.push({ label: "Namespace", key: "namespace", sortable: true, editable: false });
            return head;
        }
        getHead() {
            return ControllerTableScript.head;
        }
        getLabel(_object) { return ""; }
        rename(_object, _new) { return false; }
        delete(_focussed) { return null; }
        copy(_originals) { return null; }
        sort(_data, _key, _direction) {
            function compare(_a, _b) {
                return _direction * (_a[_key] == _b[_key] ? 0 : (_a[_key] > _b[_key] ? 1 : -1));
            }
            _data.sort(compare);
        }
    }
    ControllerTableScript.head = ControllerTableScript.getHead();
    Fudge.ControllerTableScript = ControllerTableScript;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒUi = FudgeUserInterface;
    class ControllerTreeDirectory extends ƒUi.TreeController {
        getLabel(_entry) {
            return _entry.name;
        }
        rename(_entry, _new) {
            _entry.name = _new;
            return true;
        }
        hasChildren(_entry) {
            return _entry.isDirectory;
        }
        getChildren(_entry) {
            return _entry.getDirectoryContent();
        }
        delete(_focussed) {
            // delete selection independend of focussed item
            let deleted = [];
            let expend = this.selection.length > 0 ? this.selection : _focussed;
            for (let entry of this.selection || expend) {
                entry.delete();
                deleted.push(entry);
            }
            this.selection.splice(0);
            return deleted;
        }
        addChildren(_entries, _target) {
            for (let entry of _entries) {
                _target.addEntry(entry);
                entry.delete();
            }
            return _entries;
        }
        async copy(_originals) {
            // copies can not be created at this point, but when copying the files. See addChildren
            return _originals;
        }
    }
    Fudge.ControllerTreeDirectory = ControllerTreeDirectory;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    class ControllerTreeNode extends ƒUi.TreeController {
        getLabel(_node) {
            return _node.name;
        }
        rename(_node, _new) {
            _node.name = _new;
            return true;
        }
        hasChildren(_node) {
            return _node.getChildren().length > 0;
        }
        getChildren(_node) {
            return _node.getChildren();
        }
        delete(_focussed) {
            // delete selection independend of focussed item
            let deleted = [];
            let expend = this.selection.length > 0 ? this.selection : _focussed;
            for (let node of expend)
                if (node.getParent()) {
                    node.getParent().removeChild(node);
                    deleted.push(node);
                }
            this.selection.splice(0);
            return deleted;
        }
        addChildren(_children, _target) {
            // disallow drop for sources being ancestor to target
            let move = [];
            for (let child of _children)
                if (!_target.isDescendantOf(child))
                    move.push(child);
            for (let node of move)
                _target.addChild(node);
            return move;
        }
        async copy(_originals) {
            // try to create copies and return them for paste operation
            let copies = [];
            for (let original of _originals) {
                let serialization = ƒ.Serializer.serialize(original);
                let copy = await ƒ.Serializer.deserialize(serialization);
                copies.push(copy);
            }
            return copies;
        }
    }
    Fudge.ControllerTreeNode = ControllerTreeNode;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    class Controller {
        constructor(viewport, editableNode) {
            // could make an array of Array<{someinterface, string}> to support undo for different objects
            this.states = [];
            // TODO: change those shortcuts
            this.controlModesMap = new Map([
                [Fudge.ControlMode.OBJECT_MODE, { type: new Fudge.ObjectMode(), shortcut: "p" }],
                [Fudge.ControlMode.EDIT_MODE, { type: new Fudge.EditMode(), shortcut: "d" }]
            ]);
            this.viewport = viewport;
            this.currentControlMode = this.controlModesMap.get(Fudge.ControlMode.OBJECT_MODE).type;
            this.editableNode = editableNode;
            this.saveState(this.editableNode.getComponent(ƒ.ComponentMesh).mesh.getState());
            this.setInteractionMode(Fudge.InteractionMode.IDLE);
        }
        get controlMode() {
            return this.currentControlMode;
        }
        get controlModes() {
            return this.controlModesMap;
        }
        onmouseup(_event) {
            this.interactionMode.onmouseup(_event);
        }
        onmousedown(_event) {
            let state = this.interactionMode.onmousedown(_event);
            if (state != null)
                this.saveState(state);
        }
        onmove(_event) {
            this.interactionMode.onmove(_event);
        }
        onkeydown(_event) {
            if (_event.ctrlKey)
                return;
            let state = this.interactionMode.onkeydown(_event);
            if (state != null)
                this.saveState(state);
        }
        onkeyup(_event) {
            this.interactionMode.onkeyup(_event);
        }
        switchMode(_event) {
            if (_event.ctrlKey) {
                if (_event.key === "z") {
                    this.loadState();
                }
                for (let controlMode of this.controlModesMap.keys()) {
                    if (this.controlModesMap.get(controlMode).shortcut === _event.key) {
                        this.setControlMode(controlMode);
                        break;
                    }
                }
                let selectedMode;
                for (let interactionMode in this.currentControlMode.modes) {
                    if (this.currentControlMode.modes[interactionMode].shortcut === _event.key) {
                        selectedMode = interactionMode;
                    }
                }
                if (selectedMode)
                    this.setInteractionMode(selectedMode);
            }
        }
        setControlMode(mode) {
            if (!mode)
                return;
            this.currentControlMode.formerMode = this.interactionMode;
            this.currentControlMode = this.controlModesMap.get(mode).type;
            console.log(mode);
            this.interactionMode?.cleanup();
            this.interactionMode = this.currentControlMode.formerMode || new Fudge.IdleMode(this.viewport, this.editableNode);
            this.interactionMode.initialize();
            console.log("Current Mode: " + this.interactionMode.type);
        }
        // maybe add type attributes to the interaction modes to alter behaviour based on those attributes
        setInteractionMode(mode) {
            this.interactionMode?.cleanup();
            let type = this.currentControlMode.modes[mode]?.type || Fudge.IdleMode;
            let selection = this.interactionMode?.selection;
            this.interactionMode = new type(this.viewport, this.editableNode);
            if (selection && this.controlMode.type === Fudge.ControlMode.EDIT_MODE)
                this.interactionMode.selection = selection;
            console.log("Current Mode: " + this.interactionMode.type);
        }
        drawSelection() {
            this.interactionMode.drawCircleAtSelection();
        }
        loadState() {
            if (this.states.length <= 0)
                return;
            let mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
            mesh.retrieveState(this.states[this.states.length - 1]);
            this.states.pop();
        }
        saveState(state) {
            this.states.push(state);
            if (this.states.length > 20) {
                this.states.shift();
            }
        }
    }
    Fudge.Controller = Controller;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let ControlMode;
    (function (ControlMode) {
        ControlMode["OBJECT_MODE"] = "ObjectMode";
        ControlMode["EDIT_MODE"] = "EditMode";
    })(ControlMode = Fudge.ControlMode || (Fudge.ControlMode = {}));
    let InteractionMode;
    (function (InteractionMode) {
        InteractionMode["SELECT"] = "Select";
        InteractionMode["TRANSLATE"] = "Translate";
        InteractionMode["ROTATE"] = "Rotate";
        InteractionMode["SCALE"] = "Scale";
        InteractionMode["EXTRUDE"] = "Extrude";
        InteractionMode["IDLE"] = "Idle";
    })(InteractionMode = Fudge.InteractionMode || (Fudge.InteractionMode = {}));
    let Axis;
    (function (Axis) {
        Axis["X"] = "X";
        Axis["Y"] = "Y";
        Axis["Z"] = "Z";
    })(Axis = Fudge.Axis || (Fudge.Axis = {}));
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class AbstractControlMode {
    }
    Fudge.AbstractControlMode = AbstractControlMode;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class EditMode extends Fudge.AbstractControlMode {
        constructor() {
            super(...arguments);
            this.type = Fudge.ControlMode.EDIT_MODE;
            this.modes = {
                [Fudge.InteractionMode.SELECT]: { type: Fudge.EditSelection, shortcut: "s" },
                [Fudge.InteractionMode.ROTATE]: { type: Fudge.EditRotation, shortcut: "r" },
                [Fudge.InteractionMode.TRANSLATE]: { type: Fudge.EditTranslation, shortcut: "t" },
                [Fudge.InteractionMode.EXTRUDE]: { type: Fudge.Extrude, shortcut: "e" },
                [Fudge.InteractionMode.SCALE]: { type: Fudge.EditScalation, shortcut: "c" }
            };
        }
    }
    Fudge.EditMode = EditMode;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class ObjectMode extends Fudge.AbstractControlMode {
        constructor() {
            super(...arguments);
            this.type = Fudge.ControlMode.OBJECT_MODE;
            this.modes = {
                [Fudge.InteractionMode.ROTATE]: { type: Fudge.ObjectRotation, shortcut: "r" },
                [Fudge.InteractionMode.TRANSLATE]: { type: Fudge.ObjectTranslation, shortcut: "t" },
                [Fudge.InteractionMode.SCALE]: { type: Fudge.ObjectScalation, shortcut: "c" }
            };
        }
    }
    Fudge.ObjectMode = ObjectMode;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    class IInteractionMode {
        constructor(viewport, editableNode) {
            this.viewport = viewport;
            this.editableNode = editableNode;
            this.selection = [];
            this.initialize();
        }
        drawCircleAtSelection() {
            let crx2d = this.viewport.getCanvas().getContext("2d");
            for (let vertex of this.selection) {
                let pos = this.viewport.pointWorldToClient(this.editableNode.getComponent(ƒ.ComponentMesh).mesh.uniqueVertices[vertex].position);
                crx2d.beginPath();
                crx2d.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
                crx2d.fillStyle = "white";
                crx2d.fill();
            }
        }
        getPosRenderFrom(_event) {
            let mousePos = new ƒ.Vector2(_event.canvasX, _event.canvasY);
            return this.viewport.pointClientToRender(new ƒ.Vector2(mousePos.x, this.viewport.getClientRectangle().height - mousePos.y));
        }
        createNormalArrows() {
            for (let node of this.viewport.getGraph().getChildrenByName("normal")) {
                this.viewport.getGraph().removeChild(node);
            }
            let mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
            for (let i = 0; i < mesh.vertices.length; i += 3) {
                let vertex = new ƒ.Vector3(mesh.vertices[i], mesh.vertices[i + 1], mesh.vertices[i + 2]);
                let normal = new ƒ.Vector3(mesh.normalsFace[i], mesh.normalsFace[i + 1], mesh.normalsFace[i + 2]);
                let normalArrow = new ƒAid.Node("normal", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("NormalMtr", ƒ.ShaderFlat));
                let shaft = new ƒAid.Node("Shaft", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("NormalMtr", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("yellow"))), new ƒ.MeshCube());
                let head = new ƒAid.Node("Head", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("NormalMtr", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("yellow"))), new ƒ.MeshPyramid());
                shaft.mtxLocal.scale(new ƒ.Vector3(0.01, 0.01, 1));
                head.mtxLocal.translateZ(0.5);
                head.mtxLocal.rotateX(90);
                head.mtxLocal.scale(new ƒ.Vector3(0.05, 0.05, 0.1));
                shaft.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("yellow");
                head.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("yellow");
                normalArrow.addChild(shaft);
                normalArrow.addChild(head);
                normalArrow.mtxLocal.translation = vertex;
                let vector = ƒ.Vector3.SUM(vertex, normal);
                try {
                    normalArrow.mtxLocal.lookAt(vector);
                }
                catch {
                    if (normal.y > 0) {
                        normalArrow.mtxLocal.rotateX(-90);
                    }
                    else {
                        normalArrow.mtxLocal.rotateX(90);
                    }
                }
                this.viewport.getGraph().addChild(normalArrow);
            }
        }
        copyVertices() {
            let vertices = this.editableNode.getComponent(ƒ.ComponentMesh).mesh.uniqueVertices;
            let copyOfSelectedVertices = new Map();
            for (let vertexIndex of this.selection) {
                copyOfSelectedVertices.set(vertexIndex, new ƒ.Vector3(vertices[vertexIndex].position.x, vertices[vertexIndex].position.y, vertices[vertexIndex].position.z));
            }
            return copyOfSelectedVertices;
        }
        getNewPosition(_event, distance) {
            let ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));
            return ƒ.Vector3.SUM(ray.origin, ƒ.Vector3.SCALE(ray.direction, distance));
        }
        getDistanceFromRayToCenterOfNode(_event, distance) {
            return ƒ.Vector3.DIFFERENCE(this.getNewPosition(_event, distance), this.editableNode.getComponent(ƒ.ComponentMesh).mesh.getCentroid());
        }
        getDistanceFromCameraToCenterOfNode() {
            return ƒ.Vector3.DIFFERENCE(this.editableNode.mtxLocal.translation, this.viewport.camera.pivot.translation).magnitude;
        }
    }
    Fudge.IInteractionMode = IInteractionMode;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class IdleMode extends Fudge.IInteractionMode {
        constructor() {
            super(...arguments);
            this.type = Fudge.InteractionMode.IDLE;
        }
        initialize() {
            //@ts-ignore
        }
        onmousedown(_event) {
            return null;
        }
        onmouseup(_event) {
            //@ts-ignore
        }
        onmove(_event) {
            //@ts-ignore
        }
        onkeydown(_event) {
            return null;
        }
        onkeyup(_event) {
            //
        }
        cleanup() {
            //@ts-ignore
        }
    }
    Fudge.IdleMode = IdleMode;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class Extrude extends Fudge.IInteractionMode {
        constructor() {
            super(...arguments);
            this.type = Fudge.InteractionMode.EXTRUDE;
            this.isExtruded = false;
        }
        onmousedown(_event) {
            if (!this.selection)
                return;
            let mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
            let state = mesh.getState();
            this.selection = mesh.extrude(this.selection);
            this.isExtruded = true;
            this.distance = ƒ.Vector3.DIFFERENCE(this.editableNode.mtxLocal.translation, this.viewport.camera.pivot.translation).magnitude;
            this.offset = this.getDistanceFromRayToCenterOfNode(_event, this.distance);
            this.copyOfSelectedVertices = new Map();
            let vertices = mesh.uniqueVertices;
            for (let vertexIndex of this.selection) {
                this.copyOfSelectedVertices.set(vertexIndex, new ƒ.Vector3(vertices[vertexIndex].position.x, vertices[vertexIndex].position.y, vertices[vertexIndex].position.z));
            }
            return state;
        }
        onmouseup(_event) {
            if (!this.isExtruded)
                return;
            this.isExtruded = false;
            let mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
            // maybe change this after all idk looks weird atm
            mesh.updateNormals();
            this.createNormalArrows();
        }
        onmove(_event) {
            if (!this.isExtruded)
                return;
            let mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
            mesh.updatePositionOfVertices(this.selection, this.copyOfSelectedVertices, this.getDistanceFromRayToCenterOfNode(_event, this.distance), this.offset);
        }
        onkeydown(_event) {
            return null;
        }
        onkeyup(_event) {
        }
        initialize() {
            this.createNormalArrows();
        }
        cleanup() {
            for (let node of this.viewport.getGraph().getChildrenByName("normal")) {
                this.viewport.getGraph().removeChild(node);
            }
        }
    }
    Fudge.Extrude = Extrude;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class AbstractRotation extends Fudge.IInteractionMode {
        constructor(viewport, editableNode) {
            super(viewport, editableNode);
            // TODO: maybe get rid of type properties, only useful for debugging anyways
            this.type = Fudge.InteractionMode.ROTATE;
        }
        initialize() {
            let widget = new Fudge.RotationWidget();
            let mtx = new ƒ.Matrix4x4();
            mtx.translation = this.editableNode.getComponent(ƒ.ComponentMesh).mesh.getCentroid();
            widget.addComponent(new ƒ.ComponentTransform(mtx));
            this.viewport.getGraph().addChild(widget);
            this.axesSelectionHandler = new Fudge.AxesSelectionHandler(widget);
        }
        onmousedown(_event) {
            this.viewport.createPickBuffers();
            let posRender = this.getPosRenderFrom(_event);
            this.previousMousePos = new ƒ.Vector2(_event.clientX, _event.clientY);
            this.axesSelectionHandler.pickWidget(this.viewport.pickNodeAt(posRender));
            return this.editableNode.getComponent(ƒ.ComponentMesh).mesh.getState();
        }
        onmouseup(_event) {
            this.axesSelectionHandler.releaseComponent();
            let mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
            mesh.updateNormals();
            this.createNormalArrows();
        }
        onmove(_event) {
            if (!this.axesSelectionHandler.isValidSelection()) {
                if (this.axesSelectionHandler.isAxisSelectedViaKeyboard()) {
                    this.previousMousePos = new ƒ.Vector2(_event.clientX, _event.clientY);
                    this.axesSelectionHandler.isSelectedViaKeyboard = true;
                }
                return;
            }
            let rotationMatrix = this.getRotationVector(_event);
            let mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
            mesh.rotateBy(rotationMatrix, this.editableNode.getComponent(ƒ.ComponentMesh).mesh.getCentroid(), this.selection);
        }
        onkeydown(_event) {
            let result = null;
            if (this.axesSelectionHandler.addAxisOf(_event.key)) {
                result = this.editableNode.getComponent(ƒ.ComponentMesh).mesh.getState();
            }
            return result;
        }
        onkeyup(_event) {
            this.axesSelectionHandler.removeAxisOf(_event.key);
            this.editableNode.getComponent(ƒ.ComponentMesh).mesh.updateNormals();
        }
        cleanup() {
            this.viewport.getGraph().removeChild(this.axesSelectionHandler.widget);
        }
        getRotationVector(_event) {
            let mousePos = new ƒ.Vector2(_event.clientX, _event.clientY);
            let meshCenterClient = this.viewport.pointWorldToClient(this.editableNode.getComponent(ƒ.ComponentMesh).mesh.getCentroid());
            //let intersection: ƒ.Vector3 = this.getIntersection(renderPos);
            //let cameraNorm: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(this.viewport.camera.pivot.translation);
            // let angle: number = this.getAngle(this.getOrthogonalVector(intersection, cameraNorm), this.getOrthogonalVector(this.previousIntersection, cameraNorm));
            // angle = angle * (180 / Math.PI);
            let newClientPosition = new ƒ.Vector2(mousePos.x - meshCenterClient.x, mousePos.y - meshCenterClient.y);
            let oldClientPosition = new ƒ.Vector2(this.previousMousePos.x - meshCenterClient.x, this.previousMousePos.y - meshCenterClient.y);
            let angle = this.getAngle(newClientPosition, oldClientPosition);
            angle = angle * (180 / Math.PI);
            let selectedAxes = this.axesSelectionHandler.getSelectedAxes();
            let rotationMatrix;
            /*
              TODO: check if we can make this work with multiple axis, but seems very hard to predict and utilize
              maybe free rotate like in blender is a better option
              at the moment the last selected axis is used, maybe find a better solution here too
            */
            switch (selectedAxes[selectedAxes.length - 1]) {
                case Fudge.Axis.X:
                    rotationMatrix = ƒ.Matrix4x4.ROTATION_X(angle);
                    break;
                case Fudge.Axis.Y:
                    rotationMatrix = ƒ.Matrix4x4.ROTATION_Y(angle);
                    break;
                case Fudge.Axis.Z:
                    rotationMatrix = ƒ.Matrix4x4.ROTATION_Z(angle);
                    break;
            }
            this.previousMousePos = mousePos;
            return rotationMatrix;
        }
        getAngle(first, second) {
            return Math.atan2(first.x, first.y) - Math.atan2(second.x, second.y);
        }
        /*
          those functions are not used anymore since angle calculation is now done in client space, could get removed later
        */
        getOrthogonalVector(posAtIntersection, cameraTranslationNorm) {
            return new ƒ.Vector2(+posAtIntersection.y + posAtIntersection.z * cameraTranslationNorm.y, +posAtIntersection.z * Math.abs(cameraTranslationNorm.x)
                - posAtIntersection.x * Math.abs(cameraTranslationNorm.z)
                + posAtIntersection.x * cameraTranslationNorm.y);
            // swapped signs, should work too
            // - posAtIntersection.y - posAtIntersection.z * cameraTranslationNorm.y, 
            // - posAtIntersection.z * Math.abs(cameraTranslationNorm.x)
            // - posAtIntersection.x * Math.abs(cameraTranslationNorm.z) 
            // + posAtIntersection.x * cameraTranslationNorm.y);
        }
        getIntersection(posRender) {
            let ray = this.viewport.getRayFromClient(posRender);
            return ray.intersectPlane(new ƒ.Vector3(0, 0, 0), this.viewport.camera.pivot.translation);
        }
    }
    Fudge.AbstractRotation = AbstractRotation;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class EditRotation extends Fudge.AbstractRotation {
    }
    Fudge.EditRotation = EditRotation;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    class ObjectRotation extends Fudge.AbstractRotation {
        constructor(viewport, editableNode) {
            super(viewport, editableNode);
            this.selection = Array.from(Array(this.editableNode.getComponent(ƒ.ComponentMesh).mesh.uniqueVertices.length).keys());
        }
    }
    Fudge.ObjectRotation = ObjectRotation;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class AbstractScalation extends Fudge.IInteractionMode {
        initialize() {
            let widget = new Fudge.ScalationWidget();
            // mtx.translation = this.editableNode.mtxLocal.translation;
            // mtx.rotation = this.editableNode.mtxLocal.rotation;
            // widget.addComponent(new ƒ.ComponentTransform(mtx));
            this.viewport.getGraph().addChild(widget);
            this.axesSelectionHandler = new Fudge.AxesSelectionHandler(widget);
        }
        onmousedown(_event) {
            let posRender = this.getPosRenderFrom(_event);
            this.viewport.createPickBuffers();
            this.axesSelectionHandler.pickWidget(this.viewport.pickNodeAt(posRender));
            if (this.axesSelectionHandler.wasPicked || this.axesSelectionHandler.isAxisSelectedViaKeyboard()) {
                this.setValues(_event);
            }
            return this.editableNode.getComponent(ƒ.ComponentMesh).mesh.getState();
        }
        onmouseup(_event) {
            this.axesSelectionHandler.releaseComponent();
        }
        onmove(_event) {
            if (!this.axesSelectionHandler.isValidSelection()) {
                if (this.axesSelectionHandler.isAxisSelectedViaKeyboard()) {
                    this.setValues(_event);
                    this.axesSelectionHandler.isSelectedViaKeyboard = true;
                }
                return;
            }
            let selectedAxes = this.axesSelectionHandler.getSelectedAxes();
            if (selectedAxes.length <= 0)
                return;
            let newPosition = this.getNewPosition(_event, this.distanceToCenterOfNode);
            let diff = ƒ.Vector3.DIFFERENCE(newPosition, this.oldPosition);
            let mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
            let scaleMatrix;
            // let abs: number = ƒ.Vector3.DIFFERENCE(diff, this.distanceRayToCenter);
            // TODO: Fix offset and this should be correct
            let abs = ƒ.Vector3.DIFFERENCE(newPosition, mesh.getCentroid()).magnitude;
            // let abs: number = ƒ.Vector3.DOT(newPosition, this.distanceRayToCenter);
            let scaleVector = ƒ.Vector3.ONE();
            for (let pickedAxis of selectedAxes) {
                switch (pickedAxis) {
                    case Fudge.Axis.X:
                        scaleVector.x = abs;
                        break;
                    case Fudge.Axis.Y:
                        scaleVector.y = abs;
                        break;
                    case Fudge.Axis.Z:
                        scaleVector.z = abs;
                        break;
                }
            }
            scaleMatrix = ƒ.Matrix4x4.SCALING(scaleVector);
            mesh.scaleBy(scaleMatrix, this.copyOfSelectedVertices, this.selection);
        }
        onkeydown(_event) {
            let result = null;
            if (this.axesSelectionHandler.addAxisOf(_event.key)) {
                result = this.editableNode.getComponent(ƒ.ComponentMesh).mesh.getState();
            }
            return result;
        }
        onkeyup(_event) {
            this.axesSelectionHandler.removeAxisOf(_event.key);
        }
        cleanup() {
            this.viewport.getGraph().removeChild(this.axesSelectionHandler.widget);
        }
        setValues(_event) {
            this.distanceToCenterOfNode = this.getDistanceFromCameraToCenterOfNode();
            this.oldPosition = this.getNewPosition(_event, this.distanceToCenterOfNode);
            this.distanceRayToCenter = ƒ.Vector3.DIFFERENCE(this.oldPosition, this.editableNode.getComponent(ƒ.ComponentMesh).mesh.getCentroid());
            this.copyOfSelectedVertices = this.copyVertices();
        }
    }
    Fudge.AbstractScalation = AbstractScalation;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class EditScalation extends Fudge.AbstractScalation {
    }
    Fudge.EditScalation = EditScalation;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class ObjectScalation extends Fudge.AbstractScalation {
        constructor(viewport, editableNode) {
            super(viewport, editableNode);
            this.selection = Array.from(Array(this.editableNode.getComponent(ƒ.ComponentMesh).mesh.uniqueVertices.length).keys());
        }
    }
    Fudge.ObjectScalation = ObjectScalation;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class AbstractSelection extends Fudge.IInteractionMode {
        constructor() {
            super(...arguments);
            this.type = Fudge.InteractionMode.SELECT;
        }
        cleanup() {
            //
        }
    }
    Fudge.AbstractSelection = AbstractSelection;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    class EditSelection extends Fudge.AbstractSelection {
        constructor() {
            super(...arguments);
            this.selection = [];
        }
        initialize() {
        }
        onmousedown(_event) {
            let mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
            let vertices = mesh.uniqueVertices;
            let nearestVertexIndex;
            let shortestDistanceToCam = Number.MAX_VALUE;
            let shortestDistanceToRay = Number.MAX_VALUE;
            let vertexWasPicked = false;
            let ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));
            for (let i = 0; i < vertices.length; i++) {
                let vertex = vertices[i].position;
                let vertexTranslation = ƒ.Vector3.SUM(this.editableNode.mtxLocal.translation, vertex);
                let distanceToRay = ray.getDistance(vertexTranslation).magnitude;
                let distanceToCam = ƒ.Vector3.DIFFERENCE(this.viewport.camera.pivot.translation, vertexTranslation).magnitude;
                if (distanceToRay < 0.1) {
                    vertexWasPicked = true;
                    if (distanceToRay - shortestDistanceToRay < -0.05) {
                        shortestDistanceToCam = distanceToCam;
                        shortestDistanceToRay = distanceToRay;
                        nearestVertexIndex = i;
                    }
                    else if (distanceToRay - shortestDistanceToRay < 0.03 && distanceToCam < shortestDistanceToCam) {
                        shortestDistanceToCam = distanceToCam;
                        shortestDistanceToRay = distanceToRay;
                        nearestVertexIndex = i;
                    }
                }
            }
            if (!vertexWasPicked) {
                this.selection = [];
            }
            else {
                let wasSelectedAlready = this.removeSelectedVertexIfAlreadySelected(nearestVertexIndex);
                if (!wasSelectedAlready)
                    this.selection.push(nearestVertexIndex);
            }
            this.drawCircleAtSelection();
            console.log("vertices selected: " + this.selection);
            return null;
        }
        onmouseup(_event) {
            //
        }
        onmove(_event) {
            //@ts-ignore
        }
        onkeydown(_event) {
            if (_event.key === "Delete") {
                this.editableNode.getComponent(ƒ.ComponentMesh).mesh.removeFace(this.selection);
                this.selection = [];
            }
            return null;
        }
        onkeyup(_event) {
            //
        }
        removeSelectedVertexIfAlreadySelected(selectedVertex) {
            let wasSelectedAlready = false;
            for (let i = 0; i < this.selection.length; i++) {
                if (this.selection[i] == selectedVertex) {
                    this.selection.splice(i, 1);
                    wasSelectedAlready = true;
                }
            }
            return wasSelectedAlready;
        }
    }
    Fudge.EditSelection = EditSelection;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class AbstractTranslation extends Fudge.IInteractionMode {
        constructor() {
            super(...arguments);
            this.type = Fudge.InteractionMode.TRANSLATE;
            this.dragging = false;
        }
        initialize() {
            let widget = new Fudge.TranslationWidget();
            let mtx = new ƒ.Matrix4x4();
            mtx.translation = this.editableNode.mtxLocal.translation;
            //mtx.rotation = this.editableNode.mtxLocal.rotation;
            widget.addComponent(new ƒ.ComponentTransform(mtx));
            this.viewport.getGraph().addChild(widget);
            this.axesSelectionHandler = new Fudge.AxesSelectionHandler(widget);
        }
        onmousedown(_event) {
            this.viewport.createPickBuffers();
            let posRender = this.getPosRenderFrom(_event);
            let nodeWasPicked = false;
            let additionalNodes = this.axesSelectionHandler.pickWidget(this.viewport.pickNodeAt(posRender));
            for (let node of additionalNodes) {
                if (node === this.editableNode)
                    nodeWasPicked = true;
            }
            if (nodeWasPicked && !this.axesSelectionHandler.wasPicked) {
                this.dragging = true;
            }
            this.copyVerticesAndCalculateDistance(_event);
            this.oldPosition = this.getNewPosition(_event, this.distance);
            return this.editableNode.getComponent(ƒ.ComponentMesh).mesh.getState();
        }
        onmouseup(_event) {
            this.dragging = false;
            let mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
            this.axesSelectionHandler.releaseComponent();
            mesh.updateNormals();
            this.axesSelectionHandler.widget.mtxLocal.translation = this.editableNode.getComponent(ƒ.ComponentMesh).mesh.getCentroid(this.selection);
            // this.createNormalArrows();
        }
        onmove(_event) {
            if (!this.axesSelectionHandler.isValidSelection() && !this.dragging) {
                if (this.axesSelectionHandler.isAxisSelectedViaKeyboard()) {
                    this.copyVerticesAndCalculateDistance(_event);
                    this.oldPosition = this.getNewPosition(_event, this.distance);
                    this.axesSelectionHandler.isSelectedViaKeyboard = true;
                }
                return;
            }
            let newPos = this.getNewPosition(_event, this.distance);
            let diff = ƒ.Vector3.DIFFERENCE(newPos, this.oldPosition);
            let translationVector = new ƒ.Vector3(0, 0, 0);
            let selectedAxes = this.axesSelectionHandler.getSelectedAxes();
            if (!this.dragging) {
                for (let axis of selectedAxes) {
                    switch (axis) {
                        case Fudge.Axis.X:
                            translationVector.x = diff.x;
                            break;
                        case Fudge.Axis.Y:
                            translationVector.y = diff.y;
                            break;
                        case Fudge.Axis.Z:
                            translationVector.z = diff.z;
                            break;
                    }
                }
            }
            else {
                translationVector = diff;
            }
            let mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
            mesh.translateVertices(translationVector, this.selection);
            this.oldPosition = newPos;
        }
        onkeydown(_event) {
            let result = null;
            if (this.axesSelectionHandler.addAxisOf(_event.key)) {
                result = this.editableNode.getComponent(ƒ.ComponentMesh).mesh.getState();
            }
            return result;
        }
        onkeyup(_event) {
            this.axesSelectionHandler.removeAxisOf(_event.key);
        }
        cleanup() {
            this.viewport.getGraph().removeChild(this.axesSelectionHandler.widget);
        }
        copyVerticesAndCalculateDistance(_event) {
            this.distance = this.getDistanceFromCameraToCenterOfNode();
            this.offset = this.getDistanceFromRayToCenterOfNode(_event, this.distance);
            let mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
            let vertices = mesh.uniqueVertices;
            this.copyOfSelectedVertices = new Map();
            for (let vertexIndex of this.selection) {
                this.copyOfSelectedVertices.set(vertexIndex, new ƒ.Vector3(vertices[vertexIndex].position.x, vertices[vertexIndex].position.y, vertices[vertexIndex].position.z));
            }
        }
    }
    Fudge.AbstractTranslation = AbstractTranslation;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class EditTranslation extends Fudge.AbstractTranslation {
    }
    Fudge.EditTranslation = EditTranslation;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class ObjectTranslation extends Fudge.AbstractTranslation {
        constructor(viewport, editableNode) {
            super(viewport, editableNode);
            this.selection = Array.from(Array(this.editableNode.getComponent(ƒ.ComponentMesh).mesh.uniqueVertices.length).keys());
        }
    }
    Fudge.ObjectTranslation = ObjectTranslation;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class ModifiableMesh extends ƒ.Mesh {
        constructor() {
            super();
            this._uniqueVertices = [
                new Fudge.UniqueVertex(new ƒ.Vector3(-1, 1, 1), new Map([[0, [2, 5]], [8, [22]], [16, [31]]])),
                new Fudge.UniqueVertex(new ƒ.Vector3(-1, -1, 1), new Map([[1, [0]], [9, [19, 21]], [17, [26, 29]]])),
                new Fudge.UniqueVertex(new ƒ.Vector3(1, -1, 1), new Map([[2, [1, 3]], [10, [12]], [18, [28]]])),
                new Fudge.UniqueVertex(new ƒ.Vector3(1, 1, 1), new Map([[3, [4]], [11, [14, 17]], [19, [32, 35]]])),
                new Fudge.UniqueVertex(new ƒ.Vector3(-1, 1, -1), new Map([[4, [10]], [12, [20, 23]], [20, [30, 34]]])),
                new Fudge.UniqueVertex(new ƒ.Vector3(-1, -1, -1), new Map([[5, [7, 9]], [13, [18]], [21, [24]]])),
                new Fudge.UniqueVertex(new ƒ.Vector3(1, -1, -1), new Map([[6, [6]], [14, [13, 15]], [22, [25, 27]]])),
                new Fudge.UniqueVertex(new ƒ.Vector3(1, 1, -1), new Map([[7, [8, 11]], [15, [16]], [23, [33]]]))
            ];
            // this._uniqueVertices = [
            //   new UniqueVertex(new ƒ.Vector3(-1, 1, 1),   {0: [2, 5 ], 8:  [22    ], 16: [31    ]}),
            //   new UniqueVertex(new ƒ.Vector3(-1, -1, 1),  {1: [0    ], 9:  [19, 21], 17: [26, 29]}),
            //   new UniqueVertex(new ƒ.Vector3(1, -1, 1),   {2: [1, 3 ], 10: [12    ], 18: [28    ]}),
            //   new UniqueVertex(new ƒ.Vector3(1, 1, 1),    {3: [4    ], 11: [14, 17], 19: [32, 35]}),
            //   new UniqueVertex(new ƒ.Vector3(-1, 1, -1),  {4: [10   ], 12: [20, 23], 20: [30, 34]}),
            //   new UniqueVertex(new ƒ.Vector3(-1, -1, -1), {5: [7, 9 ], 13: [18    ], 21: [24    ]}),
            //   new UniqueVertex(new ƒ.Vector3(1, -1, -1),  {6: [6    ], 14: [13, 15], 22: [25, 27]}),
            //   new UniqueVertex(new ƒ.Vector3(1, 1, -1),   {7: [8, 11], 15: [16    ], 23: [33    ]}),
            // ];
            // this._uniqueVertices = [
            //   new UniqueVertex(new ƒ.Vector3(-1, 1, 1), [0, 8, 16]),
            //   new UniqueVertex(new ƒ.Vector3(-1, -1, 1), [1, 9, 17]),
            //   new UniqueVertex(new ƒ.Vector3(1, -1, 1), [2, 10, 18]),
            //   new UniqueVertex(new ƒ.Vector3(1, 1, 1), [3, 11, 19]),
            //   new UniqueVertex(new ƒ.Vector3(-1, 1, -1), [4, 12, 20]),
            //   new UniqueVertex(new ƒ.Vector3(-1, -1, -1), [5, 13, 21]),
            //   new UniqueVertex(new ƒ.Vector3(1, -1, -1), [6, 14, 22]),
            //   new UniqueVertex(new ƒ.Vector3(1, 1, -1), [7, 15, 23])
            // ];
            // TODO: maybe get around looping at bit less here
            for (let vertex of this._uniqueVertices) {
                vertex.position.x = vertex.position.x / 2;
                vertex.position.y = vertex.position.y / 2;
                vertex.position.z = vertex.position.z / 2;
            }
            this.create();
        }
        get uniqueVertices() {
            return this._uniqueVertices;
        }
        getState() {
            let serializable = [];
            for (let vertex of this._uniqueVertices) {
                let vertexSerialization = {};
                vertexSerialization.position = [vertex.position.x, vertex.position.y, vertex.position.z];
                let indicesSerialized = [];
                for (let index of vertex.indices.keys()) {
                    indicesSerialized.push({
                        vertexIndex: index,
                        triangleIndices: vertex.indices.get(index)
                    });
                }
                vertexSerialization.indices = indicesSerialized;
                serializable.push(vertexSerialization);
            }
            return JSON.stringify(serializable);
        }
        retrieveState(state) {
            let data = JSON.parse(state);
            let result = [];
            for (let vertex of data) {
                let position = new ƒ.Vector3(vertex.position[0], vertex.position[1], vertex.position[2]);
                let indicesMap = new Map();
                for (let indices of vertex.indices) {
                    indicesMap.set(indices.vertexIndex, indices.triangleIndices);
                }
                let uniqueVertex = new Fudge.UniqueVertex(position, indicesMap);
                result.push(uniqueVertex);
            }
            this._uniqueVertices = result;
            this.create();
            console.log(result);
        }
        export() {
            let serialization = {
                vertices: Array.from(this.vertices),
                indices: Array.from(this.indices),
                normals: Array.from(this.normalsFace),
                textureCoordinates: Array.from(this.textureUVs)
            };
            return JSON.stringify(serialization, null, 2);
            // console.log(serialization);
        }
        getCentroid(selection = Array.from(Array(this.uniqueVertices.length).keys())) {
            let sum = new ƒ.Vector3();
            let numberOfVertices = 0;
            for (let index of selection) {
                sum.x += (this._uniqueVertices[index].position.x * this._uniqueVertices[index].indices.size);
                sum.y += (this._uniqueVertices[index].position.y * this._uniqueVertices[index].indices.size);
                sum.z += (this._uniqueVertices[index].position.z * this._uniqueVertices[index].indices.size);
                numberOfVertices += this._uniqueVertices[index].indices.size;
            }
            sum.x /= numberOfVertices;
            sum.y /= numberOfVertices;
            sum.z /= numberOfVertices;
            return sum;
        }
        removeFace(selection) {
            let starttime = new Date().getTime();
            let correctVertices = this.findCorrectFace(selection);
            let removedIndices = [];
            for (let vertex of correctVertices.keys()) {
                let result = this._uniqueVertices[correctVertices.get(vertex)].indices.get(vertex);
                removedIndices.push(...result);
                this._uniqueVertices[correctVertices.get(vertex)].indices.delete(vertex);
            }
            removedIndices.sort();
            for (let vertex of this._uniqueVertices) {
                let tempMap = new Map(vertex.indices);
                //let keys: IterableIterator<number> = vertex.indices.keys();
                for (let [vertexIndex, indicesIndex] of tempMap) {
                    for (let i = 0; i < indicesIndex.length; i++) {
                        let index = indicesIndex[i];
                        let subtraction = 0;
                        for (let removedIndex of removedIndices) {
                            if (removedIndex < index)
                                subtraction++;
                        }
                        index -= subtraction;
                        indicesIndex[i] = index;
                    }
                    let vertexSubtraction = 0;
                    for (let removedVertex of correctVertices.keys()) {
                        if (removedVertex < vertexIndex)
                            vertexSubtraction++;
                    }
                    if (vertexSubtraction != 0) {
                        let indicesTemp = indicesIndex;
                        vertex.indices.delete(vertexIndex);
                        vertex.indices.set(vertexIndex - vertexSubtraction, indicesTemp);
                    }
                }
            }
            this.vertices = this.createVertices();
            this.indices = this.createIndices();
            this.normalsFace = this.calculateFaceNormals();
            this.createRenderBuffers();
            console.log(new Date().getTime() - starttime);
        }
        updateNormals() {
            this.normalsFace = this.createFaceNormals();
            this.createRenderBuffers();
        }
        scaleBy(matrix, oldVertices, selection = Array.from(Array(this.uniqueVertices.length).keys())) {
            for (let vertexIndex of selection) {
                let currentVertex = oldVertices.get(vertexIndex);
                let newVertex = new ƒ.Vector3(currentVertex.x, currentVertex.y, currentVertex.z);
                newVertex.transform(matrix);
                this._uniqueVertices[vertexIndex].position = newVertex;
            }
            this.vertices = this.createVertices();
            this.createRenderBuffers();
        }
        translateVertices(difference, selection) {
            for (let vertexIndex of selection) {
                this._uniqueVertices[vertexIndex].position.add(difference);
            }
            this.vertices = this.createVertices();
            this.createRenderBuffers();
        }
        rotateBy(matrix, center, selection = Array.from(Array(this.uniqueVertices.length).keys())) {
            // TODO: actually rotate around world coordinates here
            for (let vertexIndex of selection) {
                let newVertexPos = ƒ.Vector3.DIFFERENCE(this.uniqueVertices[vertexIndex].position, center);
                newVertexPos.transform(matrix);
                this.uniqueVertices[vertexIndex].position = ƒ.Vector3.SUM(newVertexPos, center);
            }
            this.vertices = this.createVertices();
            // this.updateNormals(this.findOrderOfTrigonFromSelectedVertex(selection));
            this.createRenderBuffers();
        }
        extrude(selectedIndices) {
            let faceVertices = this.findCorrectFace(selectedIndices);
            this.addIndicesToNewVertices(this.findEdgesFrom(faceVertices), this.getNewVertices(faceVertices));
            this.vertices = this.createVertices();
            this.indices = this.createIndices();
            let newSelection = [];
            for (let i = 0; i < faceVertices.size; i++)
                newSelection.push(this.uniqueVertices.length - faceVertices.size + i);
            // let trigons: Array<Array<number>> = this.findOrderOfTrigonFromSelectedVertex(newSelection);
            // this.updateNormals(trigons);
            this.createRenderBuffers();
            return newSelection;
        }
        updatePositionOfVertices(selectedIndices, oldVertexPositions, diffToOldPosition, offset) {
            if (!selectedIndices)
                return;
            for (let selection of selectedIndices) {
                let currentVertex = oldVertexPositions.get(selection);
                this.updatePositionOfVertex(selection, new ƒ.Vector3(currentVertex.x + diffToOldPosition.x - offset.x, currentVertex.y + diffToOldPosition.y - offset.y, currentVertex.z + diffToOldPosition.z - offset.z));
            }
            // let trigons: Array<number> = this.findOrderOfTrigonFromSelectedVertex(selectedIndices);
            // this.updateNormals(trigons);
            this.createRenderBuffers();
        }
        addIndicesToNewVertices(edges, mapping) {
            let vertexToUniqueVertexMap = mapping.vertexToUniqueVertex;
            let reverse = mapping.reverse;
            let originalToNewVertex = mapping.originalToNewVertex;
            let newTriangles = [];
            let isLowMap = new Map();
            for (let edge of edges.keys()) {
                let aPlusNArray = reverse.get(edge);
                let bPlusNArray = reverse.get(edges.get(edge));
                let a;
                let b;
                let aPlusN;
                let bPlusN;
                if (isLowMap.get(edge) || isLowMap.get(edges.get(edge))) {
                    a = originalToNewVertex.get(edge);
                    b = originalToNewVertex.get(edges.get(edge));
                    aPlusN = aPlusNArray[2];
                    bPlusN = bPlusNArray[2];
                    isLowMap.set(edge, false);
                    isLowMap.set(edges.get(edge), false);
                }
                else {
                    a = edge;
                    b = edges.get(edge);
                    aPlusN = aPlusNArray[1];
                    bPlusN = bPlusNArray[1];
                    isLowMap.set(edge, true);
                    isLowMap.set(edges.get(edge), true);
                }
                newTriangles.push(a);
                newTriangles.push(b);
                newTriangles.push(bPlusN);
                newTriangles.push(bPlusN);
                newTriangles.push(aPlusN);
                newTriangles.push(a);
            }
            for (let i = 0; i < newTriangles.length; i++) {
                this.uniqueVertices[vertexToUniqueVertexMap.get(newTriangles[i])].indices.get(newTriangles[i]).push(this.indices.length + i);
            }
        }
        /*
          loops over the selection and adds a new vertex for every selected vertex
          which new vertex belongs to which original vertex is then stored in an object and returned for further processing
        */
        getNewVertices(faceVertices) {
            let originalLength = this.uniqueVertices.length;
            // use an index here to take care of ordering
            let iterator = 0;
            let vertexToUniqueVertex = new Map();
            let reverse = new Map();
            let originalToNewVertexMap = new Map();
            for (let faceVertex of faceVertices.keys()) {
                // get the indices from the original face; they will be deleted later
                let indexArray = this._uniqueVertices[faceVertices.get(faceVertex)].indices.get(faceVertex);
                // TODO: set position to old position and only move in onmove function
                let newVertex = new Fudge.UniqueVertex(new ƒ.Vector3(this.vertices[faceVertex * ModifiableMesh.vertexSize + 0], this.vertices[faceVertex * ModifiableMesh.vertexSize + 1], this.vertices[faceVertex * ModifiableMesh.vertexSize + 2]), new Map());
                reverse.set(faceVertex, []);
                let lengthOffset = faceVertices.size;
                // one index is added for the new vertex for every index of the original vertex
                for (let oldVertex of this.uniqueVertices[faceVertices.get(faceVertex)].indices.keys()) {
                    newVertex.indices.set(this.vertices.length / ModifiableMesh.vertexSize + iterator + lengthOffset, []);
                    vertexToUniqueVertex.set(this.vertices.length / ModifiableMesh.vertexSize + iterator + lengthOffset, originalLength + iterator);
                    reverse.get(faceVertex).push(this.vertices.length / ModifiableMesh.vertexSize + iterator + lengthOffset);
                    lengthOffset += faceVertices.size;
                }
                // add one more set of vertices to the original face
                this.uniqueVertices[faceVertices.get(faceVertex)].indices.set(this.vertices.length / 3 + iterator, []);
                vertexToUniqueVertex.set(this.vertices.length / ModifiableMesh.vertexSize + iterator, faceVertices.get(faceVertex));
                originalToNewVertexMap.set(faceVertex, this.vertices.length / ModifiableMesh.vertexSize + iterator);
                // the new front face has the indices of the original face
                for (let index of indexArray) {
                    newVertex.indices.get(this.vertices.length / ModifiableMesh.vertexSize + iterator + faceVertices.size).push(index);
                }
                // the old front face is deleted
                vertexToUniqueVertex.set(faceVertex, faceVertices.get(faceVertex));
                this._uniqueVertices[faceVertices.get(faceVertex)].indices.set(faceVertex, []);
                this.uniqueVertices.push(newVertex);
                iterator++;
            }
            return { vertexToUniqueVertex: vertexToUniqueVertex, reverse: reverse, originalToNewVertex: originalToNewVertexMap };
        }
        /*
          find the boundary edges from selection
        */
        findEdgesFrom(selection) {
            let indices = [];
            for (let vertex of selection.keys()) {
                let indicesArray = this.uniqueVertices[selection.get(vertex)].indices.get(vertex);
                for (let index of indicesArray) {
                    indices.push(index);
                }
            }
            indices.sort();
            let edges = new Map();
            //let triangles: Array<number> = [];
            // find the boundary edges, internal edges (duplicates) are deleted
            for (let i = 0; i < indices.length; i++) {
                if (edges.get(this.indices[indices[(i + 1) % indices.length]]) == this.indices[indices[i]]) {
                    edges.delete(this.indices[indices[(i + 1) % indices.length]]);
                }
                else {
                    edges.set(this.indices[indices[i]], this.indices[indices[(i + 1) % indices.length]]);
                }
                //triangles.push(this.indices[indices[i]]);
            }
            return edges;
        }
        // hacky method needs revamp
        findCorrectFace(selectedIndices) {
            let faceVerticesMap = new Map();
            let normalToVertexTable = new Map();
            // this will likely not work after some processing because of floating point precision 
            for (let selectedIndex of selectedIndices) {
                for (let vertexIndex of this._uniqueVertices[selectedIndex].indices.keys()) {
                    let normal = new ƒ.Vector3(this.normalsFace[vertexIndex * ModifiableMesh.vertexSize], this.normalsFace[vertexIndex * ModifiableMesh.vertexSize + 1], this.normalsFace[vertexIndex * ModifiableMesh.vertexSize + 2]);
                    if (!normalToVertexTable.has(normal.toString())) {
                        normalToVertexTable.set(normal.toString(), [{ selectedIndex: selectedIndex, vertexIndex: vertexIndex }]);
                    }
                    else {
                        normalToVertexTable.get(normal.toString()).push({ selectedIndex: selectedIndex, vertexIndex: vertexIndex });
                    }
                }
            }
            for (let normal of normalToVertexTable.keys()) {
                if (normalToVertexTable.get(normal).length == selectedIndices.length) {
                    for (let indices of normalToVertexTable.get(normal)) {
                        faceVerticesMap.set(indices.vertexIndex, indices.selectedIndex);
                    }
                }
            }
            return faceVerticesMap;
        }
        // tslint:disable-next-line: member-ordering
        updatePositionOfVertex(vertexIndex, newPosition) {
            this._uniqueVertices[vertexIndex].position = newPosition;
            for (let index of this._uniqueVertices[vertexIndex].indices.keys()) {
                this.vertices.set([this._uniqueVertices[vertexIndex].position.x, this._uniqueVertices[vertexIndex].position.y, this._uniqueVertices[vertexIndex].position.z], index * ModifiableMesh.vertexSize);
            }
        }
        /*
          finds the ordering of the trigons by searching for the selected vertex in the indices array
          returns an array with another array which stores the correct ordering
          not used anymore since we just recompute all the normals at the end
        */
        // tslint:disable-next-line: member-ordering
        findOrderOfTrigonFromSelectedVertex(selectedIndices) {
            // let trigons: Array<Array<number>> = [];
            let trigons = [];
            for (let selectedIndex of selectedIndices) {
                for (let vertexIndex of this._uniqueVertices[selectedIndex].indices.keys()) {
                    for (let indexInIndicesArray of this._uniqueVertices[selectedIndex].indices.get(vertexIndex)) {
                        // let trigon: Array<number> = [];
                        switch (indexInIndicesArray % 3) {
                            case 0:
                                trigons.push(this.indices[indexInIndicesArray], this.indices[indexInIndicesArray + 1], this.indices[indexInIndicesArray + 2]);
                                break;
                            case 1:
                                trigons.push(this.indices[indexInIndicesArray - 1], this.indices[indexInIndicesArray], this.indices[indexInIndicesArray + 1]);
                                break;
                            case 2:
                                trigons.push(this.indices[indexInIndicesArray - 2], this.indices[indexInIndicesArray - 1], this.indices[indexInIndicesArray]);
                                break;
                        }
                        // trigons.push(trigon);  
                    }
                }
            }
            return trigons;
        }
        // tslint:disable-next-line: member-ordering
        createVertices() {
            // TODO maybe don't loop here too somehow?
            let length = 0;
            for (let vertex of this._uniqueVertices) {
                length += vertex.indices.size * ModifiableMesh.vertexSize;
            }
            let vertices = new Float32Array(length);
            for (let vertex of this._uniqueVertices) {
                for (let index of vertex.indices.keys()) {
                    vertices.set([vertex.position.x, vertex.position.y, vertex.position.z], index * ModifiableMesh.vertexSize);
                }
            }
            return vertices;
        }
        // tslint:disable-next-line: member-ordering
        createTextureUVs() {
            let textureUVs = new Float32Array([
                // front
                /*0*/ 0, 0, /*1*/ 0, 1, /*2*/ 1, 1, /*3*/ 1, 0,
                // back
                /*4*/ 3, 0, /*5*/ 3, 1, /*6*/ 2, 1, /*7*/ 2, 0,
                // right / left
                /*0,8*/ 0, 0, /*1,9*/ 0, 1, /*2,10*/ 1, 1, /*3,11*/ 1, 0,
                /*4,12*/ -1, 0, /*5,13*/ -1, 1, /*6,14*/ 2, 1, /*7,15*/ 2, 0,
                // bottom / top
                /*0,16*/ 1, 0, /*1,17*/ 1, 1, /*2,18*/ 1, 2, /*3,19*/ 1, -1,
                /*4,20*/ 0, 0, /*5,21*/ 0, 1, /*6,22*/ 0, 2, /*7,23*/ 0, -1
            ]);
            return textureUVs;
        }
        // tslint:disable-next-line: member-ordering
        createIndices() {
            // let indices: Uint16Array = new Uint16Array([
            //   // front 0-5
            //   1, 2, 0, 2, 3, 0,
            //   // back 6-11
            //   6, 5, 7, 5, 4, 7,
            //   // right 12-17
            //   2 + 8, 6 + 8, 3 + 8, 6 + 8, 7 + 8, 3 + 8,
            //   // left 18-23
            //   5 + 8, 1 + 8, 4 + 8, 1 + 8, 0 + 8, 4 + 8,
            //   // bottom 24-29
            //   5 + 16, 6 + 16, 1 + 16, 6 + 16, 2 + 16, 1 + 16,
            //   // top 30-35
            //   4 + 16, 0 + 16, 3 + 16, 7 + 16, 4 + 16, 3 + 16
            // ]);
            let indexArray = [];
            for (let vertex of this._uniqueVertices) {
                for (let index of vertex.indices.keys()) {
                    let array = vertex.indices.get(index);
                    for (let value of array) {
                        indexArray[value] = index;
                    }
                }
            }
            return new Uint16Array(indexArray);
        }
        // tslint:disable-next-line: member-ordering
        createFaceNormals(trigons = Array.from(this.indices)) {
            // let normals: Float32Array = new Float32Array([
            //   // front
            //   /*0*/ 0, 0, 1, /*1*/ 0, 0, 1, /*2*/ 0, 0, 1, /*3*/ 0, 0, 1,
            //   // back
            //   /*4*/ 0, 0, -1, /*5*/ 0, 0, -1, /*6*/ 0, 0, -1, /*7*/ 0, 0, -1,
            //   // right
            //   /*8*/ -1, 0, 0, /*9*/ -1, 0, 0, /*10*/ 1, 0, 0, /*11*/ 1, 0, 0,
            //   // left
            //   /*12*/ -1, 0, 0, /*13*/ -1, 0, 0, /*14*/ 1, 0, 0, /*15*/ 1, 0, 0,
            //   // bottom
            //   /*16*/ 0, 1, 0, /*17*/ 0, -1, 0, /*18*/ 0, -1, 0, /*19*/ 0, 1, 0,
            //   // top 
            //   /*20*/ 0, 1, 0, /*21*/ 0, -1, 0, /*22*/ 0, -1, 0, /*23*/ 0, 1, 0
            // ]);
            return this.calculateNormals(trigons);
        }
        /*
          likely a small performance optimization for very big meshes
          TODO: needs fix
        */
        // private updateNormals(trigons: Array<number>): void { // Array<Array<number>>
        //   let newNormals: Float32Array = new Float32Array(this.vertices.length);
        //   // TODO: fix incase length of vertices decreases
        //   newNormals.set(this.normalsFace);
        //   this.normalsFace = this.calculateNormals(trigons, newNormals);
        //   // for (let trigon of trigons) {
        //   //   let vertexA: ƒ.Vector3 = new ƒ.Vector3(this.vertices[3 * trigon[0]], this.vertices[3 * trigon[0] + 1], this.vertices[3 * trigon[0] + 2]);
        //   //   let vertexB: ƒ.Vector3 = new ƒ.Vector3(this.vertices[3 * trigon[1]], this.vertices[3 * trigon[1] + 1], this.vertices[3 * trigon[1] + 2]);
        //   //   let vertexC: ƒ.Vector3 = new ƒ.Vector3(this.vertices[3 * trigon[2]], this.vertices[3 * trigon[2] + 1], this.vertices[3 * trigon[2] + 2]);
        //   //   let newNormal: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(ƒ.Vector3.CROSS(ƒ.Vector3.DIFFERENCE(vertexB, vertexA), ƒ.Vector3.DIFFERENCE(vertexC, vertexB)));
        //   //   newNormals.set([newNormal.x, newNormal.y, newNormal.z], 3 * trigon[0]);
        //   //   newNormals.set([newNormal.x, newNormal.y, newNormal.z], 3 * trigon[1]);
        //   //   newNormals.set([newNormal.x, newNormal.y, newNormal.z], 3 * trigon[2]);
        //   // }
        //   // this.normalsFace = newNormals;
        // }
        calculateNormals(trigons, normals = new Float32Array(this.vertices.length)) {
            for (let index = 0; index < trigons.length; index += ModifiableMesh.vertexSize) {
                let vertexA = new ƒ.Vector3(this.vertices[ModifiableMesh.vertexSize * trigons[index]], this.vertices[ModifiableMesh.vertexSize * trigons[index] + 1], this.vertices[3 * this.indices[index] + 2]);
                let vertexB = new ƒ.Vector3(this.vertices[ModifiableMesh.vertexSize * trigons[index + 1]], this.vertices[ModifiableMesh.vertexSize * trigons[index + 1] + 1], this.vertices[3 * this.indices[index + 1] + 2]);
                let vertexC = new ƒ.Vector3(this.vertices[ModifiableMesh.vertexSize * trigons[index + 2]], this.vertices[ModifiableMesh.vertexSize * trigons[index + 2] + 1], this.vertices[3 * this.indices[index + 2] + 2]);
                let newNormal = ƒ.Vector3.NORMALIZATION(ƒ.Vector3.CROSS(ƒ.Vector3.DIFFERENCE(vertexB, vertexA), ƒ.Vector3.DIFFERENCE(vertexC, vertexB)));
                normals.set([newNormal.x, newNormal.y, newNormal.z], ModifiableMesh.vertexSize * trigons[index]);
                normals.set([newNormal.x, newNormal.y, newNormal.z], ModifiableMesh.vertexSize * trigons[index + 1]);
                normals.set([newNormal.x, newNormal.y, newNormal.z], ModifiableMesh.vertexSize * trigons[index + 2]);
            }
            return normals;
        }
    }
    ModifiableMesh.vertexSize = ƒ.Mesh.getBufferSpecification().size;
    Fudge.ModifiableMesh = ModifiableMesh;
})(Fudge || (Fudge = {}));
// let test: Array<{vertexIndex: number, indices: number[]}> = [];
// for (let selectedIndex of selectedIndices) {
//   for (let vertexIndex in this._uniqueVertices[selectedIndex].indices) {
//     for (let indexInIndicesArray of this._uniqueVertices[selectedIndex].indices[vertexIndex]) {
//       let arrayToCheck: number[] = [];
//       switch (indexInIndicesArray % 3) {
//         case 0: 
//           arrayToCheck.push(this.indices[indexInIndicesArray + 1]);
//           arrayToCheck.push(this.indices[indexInIndicesArray + 2]);
//           break;
//         case 1:
//           arrayToCheck.push(this.indices[indexInIndicesArray - 1]);
//           arrayToCheck.push(this.indices[indexInIndicesArray + 1]);
//           break;
//         case 2:
//           arrayToCheck.push(this.indices[indexInIndicesArray - 1]);
//           arrayToCheck.push(this.indices[indexInIndicesArray - 2]);
//           break;
//       }
//       test.push({vertexIndex: Number.parseInt(vertexIndex), indices: arrayToCheck});
//     }
//   }
// }
// // for (let obj of test) {
// //   for (let selectedIndex of selectedIndices) {
// //     let wasSelected: boolean = true;
// //     let index: number;
// //     for (let vertexIndex in this.uniqueVertices[selectedIndex].indices) {
// //       if (!obj.indices.includes(Number.parseInt(vertexIndex))) {
// //         index = Number.parseInt(vertexIndex);
// //         wasSelected = false;
// //       } 
// //     }
// //     if (wasSelected) 
// //       faceVertices.push(index);
// //   }
// // } 
// for (let i: number = 0; i < test.length; i++) {
//   for (let j: number = 0; j < test.length; i++) {
//     if (i == j)
//       continue;
//     if (test[i].indices[0] == test[j].indices[0] || 
//       test[i].indices[1] == test[j].indices[1] || 
//       test[i].indices[1] == test[j].indices[0] ||
//       test[i].indices[0] == test[j].indices[1] || 
//       test[i].indices[0] == test[j].vertexIndex ||
//       test[i].indices[1] == test[j].vertexIndex ||
//       test[i].vertexIndex == test[j].indices[0] ||
//       test[i].vertexIndex == test[j].indices[1] ||
//       test[i].vertexIndex == test[j].vertexIndex) 
//       faceVertices.push(test[i].vertexIndex);
//   }
// }
var Fudge;
(function (Fudge) {
    class UniqueVertex {
        constructor(_position, _indices) {
            this.position = _position;
            this.indices = _indices;
        }
    }
    Fudge.UniqueVertex = UniqueVertex;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class AxesSelectionHandler {
        constructor(widget) {
            this.isSelectedViaKeyboard = false;
            this.selectedAxes = [];
            this.axisIsPicked = false;
            this._widget = widget;
        }
        get widget() {
            return this._widget;
        }
        get wasPicked() {
            return this.axisIsPicked;
        }
        releaseComponent() {
            if (this.axisIsPicked) {
                this.axisIsPicked = false;
                this._widget.releaseComponent();
            }
        }
        pickWidget(_hits) {
            let result = this._widget.isHitWidgetComponent(_hits);
            this.pickedAxis = result.axis;
            if (this.pickedAxis)
                this.axisIsPicked = true;
            return result.additionalNodes;
        }
        isValidSelection() {
            return this.axisIsPicked || this.isSelectedViaKeyboard;
        }
        getSelectedAxes() {
            let selectedAxes = this.selectedAxes.slice();
            if (!this.selectedAxes.includes(this.pickedAxis) && this.axisIsPicked) {
                selectedAxes.push(this.pickedAxis);
            }
            return selectedAxes;
        }
        addAxisOf(_key) {
            let isNewSelection = false;
            let selectedAxis = this.getSelectedAxisBy(_key);
            if (!this.selectedAxes.includes(selectedAxis) && selectedAxis) {
                this.selectedAxes.push(selectedAxis);
                this._widget.updateWidget(selectedAxis);
                isNewSelection = true;
            }
            return isNewSelection;
        }
        removeAxisOf(_key) {
            let selectedAxis = this.getSelectedAxisBy(_key);
            if (!selectedAxis)
                return;
            let index = this.selectedAxes.indexOf(selectedAxis);
            if (index != -1) {
                this._widget.removeUnselectedAxis(this.selectedAxes[index]);
                this.selectedAxes.splice(index, 1);
                if (!this.isAxisSelectedViaKeyboard())
                    this.isSelectedViaKeyboard = false;
            }
        }
        isAxisSelectedViaKeyboard() {
            return this.selectedAxes.length > 0;
        }
        getSelectedAxisBy(_key) {
            let selectedAxis;
            switch (_key) {
                case "x":
                    selectedAxis = Fudge.Axis.X;
                    break;
                case "y":
                    selectedAxis = Fudge.Axis.Y;
                    break;
                case "z":
                    selectedAxis = Fudge.Axis.Z;
                    break;
            }
            return selectedAxis;
        }
    }
    Fudge.AxesSelectionHandler = AxesSelectionHandler;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class IWidget extends ƒ.Node {
        constructor() {
            super(...arguments);
            this.componentToOriginalColorMap = new Map();
        }
        getAxisFromWidgetComponent(_component) {
            return this.componentToAxisMap.get(_component);
        }
        releaseComponent(pickedComponent = this.pickedComponent) {
            pickedComponent.getComponent(ƒ.ComponentMaterial).clrPrimary = this.componentToOriginalColorMap.get(pickedComponent);
        }
        getComponentFromAxis(_axis) {
            for (let component of this.componentToAxisMap.keys()) {
                if (this.componentToAxisMap.get(component) == _axis)
                    return component;
            }
            return null;
        }
        updateWidget(_axis) {
            this.changeColorOfComponent(this.getComponentFromAxis(_axis));
        }
        removeUnselectedAxis(_axis) {
            let component = this.getComponentFromAxis(_axis);
            this.releaseComponent(component);
        }
    }
    Fudge.IWidget = IWidget;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    class RotationWidget extends Fudge.IWidget {
        constructor(_name = "RotationWidget", _transform) {
            super(_name);
            this.componentToAxisMap = new Map();
            let yRotWidget = new Fudge.WidgetCircle("Y_Rotation", new ƒ.Color(0, 1, 0), new ƒ.Matrix4x4());
            let xRotWidget = new Fudge.WidgetCircle("X_Rotation", new ƒ.Color(1, 0, 0), ƒ.Matrix4x4.ROTATION_Z(90));
            let zRotWidget = new Fudge.WidgetCircle("Z_Rotation", new ƒ.Color(0, 0, 1), ƒ.Matrix4x4.ROTATION_X(90));
            this.componentToAxisMap.set(xRotWidget, Fudge.Axis.X);
            this.componentToAxisMap.set(yRotWidget, Fudge.Axis.Y);
            this.componentToAxisMap.set(zRotWidget, Fudge.Axis.Z);
            this.addChild(yRotWidget);
            this.addChild(xRotWidget);
            this.addChild(zRotWidget);
            this.fillColorDict();
        }
        isHitWidgetComponent(_hits) {
            let additionalNodes = [];
            let lowestZBuffer = Number.MAX_VALUE;
            let wasPicked = false;
            let pickedAxis;
            for (let hit of _hits) {
                if (hit.zBuffer != 0) {
                    let isCircle = false;
                    for (let circle of this.getChildren()) {
                        if (circle == hit.node) {
                            isCircle = true;
                            if (hit.zBuffer > lowestZBuffer)
                                continue;
                            wasPicked = true;
                            this.pickedComponent = circle;
                            lowestZBuffer = hit.zBuffer;
                        }
                    }
                    if (!isCircle)
                        additionalNodes.push(hit.node);
                }
            }
            if (wasPicked) {
                pickedAxis = this.getAxisFromWidgetComponent(this.pickedComponent);
                this.changeColorOfComponent(this.pickedComponent);
            }
            return { axis: pickedAxis, additionalNodes: additionalNodes };
        }
        changeColorOfComponent(component) {
            component.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(1, 1, 1, 1);
        }
        fillColorDict() {
            for (let circle of this.getChildren()) {
                this.componentToOriginalColorMap.set(circle, circle.getComponent(ƒ.ComponentMaterial).clrPrimary);
            }
        }
    }
    Fudge.RotationWidget = RotationWidget;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    class ScalationWidget extends Fudge.IWidget {
        constructor(_name = "ScalationWidget", _transform = new ƒ.Matrix4x4()) {
            super(_name);
            this.componentToAxisMap = new Map();
            let xScaleWidget = new Fudge.WidgetPillar("X_Scalation", new ƒ.Color(1, 0, 0));
            let yScaleWidget = new Fudge.WidgetPillar("Y_Scalation", new ƒ.Color(0, 1, 0));
            let zScaleWidget = new Fudge.WidgetPillar("Z_Scalation", new ƒ.Color(0, 0, 1));
            this.componentToAxisMap.set(xScaleWidget, Fudge.Axis.X);
            this.componentToAxisMap.set(yScaleWidget, Fudge.Axis.Y);
            this.componentToAxisMap.set(zScaleWidget, Fudge.Axis.Z);
            xScaleWidget.mtxLocal.rotateZ(-90);
            zScaleWidget.mtxLocal.rotateX(90);
            this.addChild(yScaleWidget);
            this.addChild(xScaleWidget);
            this.addChild(zScaleWidget);
            this.fillColorDict();
        }
        isHitWidgetComponent(_hits) {
            let additionalNodes = [];
            let lowestZBuffer = Number.MAX_VALUE;
            let pickedAxis;
            let wasPicked = false;
            for (let hit of _hits) {
                if (hit.zBuffer == 0)
                    continue;
                let isCircle = false;
                for (let pillar of this.getChildren()) {
                    for (let child of pillar.getChildren()) {
                        if (child == hit.node) {
                            isCircle = true;
                            if (hit.zBuffer > lowestZBuffer)
                                continue;
                            lowestZBuffer = hit.zBuffer;
                            wasPicked = true;
                            this.pickedComponent = pillar;
                        }
                    }
                }
                if (!isCircle)
                    additionalNodes.push(hit.node);
            }
            if (wasPicked) {
                pickedAxis = this.getAxisFromWidgetComponent(this.pickedComponent);
                this.changeColorOfComponent(this.pickedComponent);
            }
            return { axis: pickedAxis, additionalNodes: additionalNodes };
        }
        changeColorOfComponent(component) {
            component.getChildren().forEach(child => child.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(1, 1, 1, 1));
        }
        releaseComponent(pickedComponent = this.pickedComponent) {
            pickedComponent.getChildren().forEach(child => child.getComponent(ƒ.ComponentMaterial).clrPrimary = this.componentToOriginalColorMap.get(pickedComponent));
        }
        fillColorDict() {
            for (let circle of this.getChildren()) {
                this.componentToOriginalColorMap.set(circle, circle.getChildren()[0].getComponent(ƒ.ComponentMaterial).clrPrimary);
            }
        }
    }
    Fudge.ScalationWidget = ScalationWidget;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒAid = FudgeAid;
    class TranslationWidget extends Fudge.IWidget {
        constructor(_name = "CoordinateSystem", _transform) {
            super(_name);
            this.componentToAxisMap = new Map();
            let arrowRed = new ƒAid.NodeArrow("ArrowRed", new ƒ.Color(1, 0, 0, 1));
            let arrowGreen = new ƒAid.NodeArrow("ArrowGreen", new ƒ.Color(0, 1, 0, 1));
            let arrowBlue = new ƒAid.NodeArrow("ArrowBlue", new ƒ.Color(0, 0, 1, 1));
            this.componentToAxisMap.set(arrowRed, Fudge.Axis.X);
            this.componentToAxisMap.set(arrowGreen, Fudge.Axis.Y);
            this.componentToAxisMap.set(arrowBlue, Fudge.Axis.Z);
            arrowRed.mtxLocal.rotateZ(-90);
            arrowBlue.mtxLocal.rotateX(90);
            this.addChild(arrowRed);
            this.addChild(arrowGreen);
            this.addChild(arrowBlue);
            this.fillColorDict();
        }
        isHitWidgetComponent(_hits) {
            let additionalNodes = [];
            let lowestZBuffer = Number.MAX_VALUE;
            let pickedAxis;
            let wasPicked = false;
            for (let hit of _hits) {
                if (hit.zBuffer == 0)
                    continue;
                let isCircle = false;
                for (let arrow of this.getChildren()) {
                    for (let child of arrow.getChildren()) {
                        if (child == hit.node) {
                            isCircle = true;
                            if (hit.zBuffer > lowestZBuffer)
                                continue;
                            lowestZBuffer = hit.zBuffer;
                            wasPicked = true;
                            this.pickedComponent = arrow;
                        }
                    }
                }
                if (!isCircle)
                    additionalNodes.push(hit.node);
            }
            if (wasPicked) {
                pickedAxis = this.getAxisFromWidgetComponent(this.pickedComponent);
                this.changeColorOfComponent(this.pickedComponent);
            }
            return { axis: pickedAxis, additionalNodes: additionalNodes };
        }
        releaseComponent(pickedComponent = this.pickedComponent) {
            pickedComponent.getChildren().forEach(child => child.getComponent(ƒ.ComponentMaterial).clrPrimary = this.componentToOriginalColorMap.get(pickedComponent));
        }
        changeColorOfComponent(component) {
            component.getChildren().forEach(child => child.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(1, 1, 1, 1));
        }
        fillColorDict() {
            for (let circle of this.getChildren()) {
                this.componentToOriginalColorMap.set(circle, circle.getChildren()[0].getComponent(ƒ.ComponentMaterial).clrPrimary);
            }
        }
    }
    Fudge.TranslationWidget = TranslationWidget;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    class WidgetCircle extends ƒ.Node {
        constructor(_name, _color, _transform) {
            super(_name);
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshTorus("MeshTorus", 0.03)));
            let compMat = new ƒ.ComponentMaterial(new ƒ.Material("Circle", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white"))));
            compMat.clrPrimary = _color;
            this.addComponent(compMat);
            this.addComponent(new ƒ.ComponentTransform(_transform));
        }
    }
    Fudge.WidgetCircle = WidgetCircle;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒAid = FudgeAid;
    class WidgetPillar extends ƒAid.Node {
        constructor(_name, _color) {
            super(_name, ƒ.Matrix4x4.IDENTITY());
            let shaft = new ƒAid.Node("Shaft", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("MaterialShaft", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white"))), new ƒ.MeshCube());
            let head = new ƒAid.Node("Head", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("MaterialHead", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white"))), new ƒ.MeshCube());
            shaft.mtxLocal.scale(new ƒ.Vector3(0.01, 1, 0.01));
            head.mtxLocal.translateY(0.5);
            head.mtxLocal.scale(new ƒ.Vector3(0.05, 0.1, 0.05));
            shaft.getComponent(ƒ.ComponentMaterial).clrPrimary = _color;
            head.getComponent(ƒ.ComponentMaterial).clrPrimary = _color;
            this.addChild(shaft);
            this.addChild(head);
        }
    }
    Fudge.WidgetPillar = WidgetPillar;
})(Fudge || (Fudge = {}));
///<reference path="../View/View.ts"/>
var Fudge;
///<reference path="../View/View.ts"/>
(function (Fudge) {
    /**
     * Base class for all [[Panel]]s aggregating [[View]]s
     * Subclasses are presets for common panels. A user might add or delete [[View]]s at runtime
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    // TODO: class might become a customcomponent for HTML! = this.dom
    class Panel extends Fudge.View {
        constructor(_container, _state) {
            super(_container, _state);
            this.views = [];
            /** Send custom copies of the given event to the views */
            this.broadcastEvent = (_event) => {
                // console.log("views", this.views);
                for (let view of this.views) {
                    let event = new CustomEvent(_event.type, { bubbles: false, cancelable: true, detail: _event.detail });
                    view.dom.dispatchEvent(event);
                }
            };
            this.addViewComponent = (_component) => {
                this.views.push(_component.instance);
            };
            this.dom.style.width = "100%";
            this.dom.style.overflow = "visible";
            this.dom.removeAttribute("view");
            this.dom.setAttribute("panel", this.constructor.name);
            let config = {
                settings: { showPopoutIcon: false },
                content: [{
                        type: "row", content: []
                    }]
            };
            this.goldenLayout = new GoldenLayout(config, this.dom);
            this.goldenLayout.on("stateChanged", () => this.goldenLayout.updateSize());
            this.goldenLayout.on("componentCreated", this.addViewComponent);
            this.goldenLayout.init();
        }
    }
    Fudge.Panel = Panel;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
    * Shows a graph and offers means for manipulation
    * @authors Monika Galkewitsch, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
    */
    class PanelGraph extends Fudge.Panel {
        constructor(_container, _state) {
            super(_container, _state);
            this.hndEvent = (_event) => {
                if (_event.type == Fudge.EVENT_EDITOR.SET_GRAPH)
                    this.setGraph(_event.detail);
                this.broadcastEvent(_event);
                // _event.stopPropagation();
            };
            this.hndFocusNode = (_event) => {
                let event = new CustomEvent(Fudge.EVENT_EDITOR.FOCUS_NODE, { bubbles: false, detail: _event.detail.data });
                this.broadcastEvent(event);
            };
            this.goldenLayout.registerComponent(Fudge.VIEW.RENDER, Fudge.ViewRender);
            this.goldenLayout.registerComponent(Fudge.VIEW.COMPONENTS, Fudge.ViewComponents);
            this.goldenLayout.registerComponent(Fudge.VIEW.HIERARCHY, Fudge.ViewHierarchy);
            let inner = this.goldenLayout.root.contentItems[0];
            inner.addChild({
                type: "column", content: [{
                        type: "component", componentName: Fudge.VIEW.RENDER, componentState: _state, title: "Render"
                    }]
            });
            inner.addChild({
                type: "column", content: [
                    { type: "component", componentName: Fudge.VIEW.HIERARCHY, componentState: _state, title: "Hierarchy" },
                    { type: "component", componentName: Fudge.VIEW.COMPONENTS, componentState: _state, title: "Components" }
                ]
            });
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SET_GRAPH, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SET_PROJECT, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.UPDATE, this.hndEvent);
            this.dom.addEventListener("mutate" /* MUTATE */, this.hndEvent);
            this.dom.addEventListener("itemselect" /* SELECT */, this.hndFocusNode);
            this.dom.addEventListener("rename" /* RENAME */, this.broadcastEvent);
        }
        setGraph(_node) {
            this.node = _node;
        }
        getNode() {
            return this.node;
        }
    }
    Fudge.PanelGraph = PanelGraph;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class PanelModeller extends Fudge.Panel {
        constructor(_container, _state) {
            super(_container, _state);
            this.goldenLayout.registerComponent(Fudge.VIEW.MODELLER, Fudge.ViewModellerScene);
            this.goldenLayout.registerComponent(Fudge.VIEW.HIERARCHY, Fudge.ViewHierarchy);
            this.goldenLayout.registerComponent(Fudge.VIEW.PROPERTIES, Fudge.ViewObjectProperties);
            let inner = this.goldenLayout.root.contentItems[0];
            inner.addChild({
                type: "column", content: [{
                        type: "component", componentName: Fudge.VIEW.MODELLER, componentState: _state, title: "Scene"
                    }]
            });
            inner.addChild({
                type: "column", content: [
                    { type: "component", componentName: Fudge.VIEW.HIERARCHY, componentState: _state, title: "Hierarchy" },
                    { type: "component", componentName: Fudge.VIEW.PROPERTIES, componentState: _state, title: "Properties" }
                ]
            });
        }
        cleanup() {
            throw new Error("Method not implemented.");
        }
    }
    Fudge.PanelModeller = PanelModeller;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Display the project structure and offer functions for creation, deletion and adjustment of resources
     * @authors Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class PanelProject extends Fudge.Panel {
        constructor(_container, _state) {
            super(_container, _state);
            this.hndEvent = (_event) => {
                // if (_event.type == EVENT_EDITOR.SET_PROJECT)
                //   this.setGraph(_event.detail);
                this.broadcastEvent(_event);
            };
            this.goldenLayout.registerComponent(Fudge.VIEW.INTERNAL, Fudge.ViewInternal);
            this.goldenLayout.registerComponent(Fudge.VIEW.EXTERNAL, Fudge.ViewExternal);
            this.goldenLayout.registerComponent(Fudge.VIEW.PROPERTIES, Fudge.ViewProperties);
            this.goldenLayout.registerComponent(Fudge.VIEW.PREVIEW, Fudge.ViewPreview);
            this.goldenLayout.registerComponent(Fudge.VIEW.SCRIPT, Fudge.ViewScript);
            let inner = this.goldenLayout.root.contentItems[0];
            inner.addChild({
                type: "column", content: [
                    { type: "component", componentName: Fudge.VIEW.PREVIEW, componentState: _state, title: "Preview" },
                    { type: "component", componentName: Fudge.VIEW.PROPERTIES, componentState: _state, title: "Properties" }
                ]
            });
            inner.addChild({
                type: "column", content: [
                    { type: "component", componentName: Fudge.VIEW.INTERNAL, componentState: _state, title: "Internal" },
                    { type: "component", componentName: Fudge.VIEW.EXTERNAL, componentState: _state, title: "External" },
                    { type: "component", componentName: Fudge.VIEW.SCRIPT, componentState: _state, title: "Script" }
                ]
            });
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SET_PROJECT, this.hndEvent);
            this.dom.addEventListener("itemselect" /* SELECT */, this.hndEvent);
            this.dom.addEventListener("mutate" /* MUTATE */, this.hndEvent);
            // this.dom.addEventListener(ƒui.EVENT.MUTATE, this.hndEvent);
            this.broadcastEvent(new Event(Fudge.EVENT_EDITOR.SET_PROJECT));
        }
    }
    Fudge.PanelProject = PanelProject;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class ViewAnimation extends Fudge.View {
        constructor(_container, _state) {
            super(_container, _state);
            this.time = new FudgeCore.Time();
            this.playing = false;
            this.playbackTime = 500;
            this.openAnimation();
            this.fillContent();
            this.installListeners();
        }
        openAnimation() {
            //TODO replace with file opening dialoge
            let seq1 = new FudgeCore.AnimationSequence();
            seq1.addKey(new FudgeCore.AnimationKey(0, 0));
            seq1.addKey(new FudgeCore.AnimationKey(500, 45));
            seq1.addKey(new FudgeCore.AnimationKey(1500, -45));
            seq1.addKey(new FudgeCore.AnimationKey(2000, 0));
            let seq2 = new FudgeCore.AnimationSequence();
            // seq2.addKey(new FudgeCore.AnimationKey(0, 0));
            seq2.addKey(new FudgeCore.AnimationKey(500, 0, 0, 0.02));
            seq2.addKey(new FudgeCore.AnimationKey(1000, 5));
            seq2.addKey(new FudgeCore.AnimationKey(1500, 0, -0.02));
            this.animation = new FudgeCore.Animation("TestAnimation", {
                components: {
                    ComponentTransform: [
                        {
                            "ƒ.ComponentTransform": {
                                position: {
                                    x: new FudgeCore.AnimationSequence(),
                                    y: seq2,
                                    z: new FudgeCore.AnimationSequence()
                                },
                                rotation: {
                                    x: new FudgeCore.AnimationSequence(),
                                    y: seq1,
                                    z: new FudgeCore.AnimationSequence()
                                }
                            }
                        }
                    ]
                }
            }, 60);
            this.animation.labels["One"] = 200;
            this.animation.labels["Two"] = 750;
            this.animation.setEvent("EventOne", 500);
            this.animation.setEvent("EventTwo", 1000);
            this.node = new FudgeCore.Node("Testnode");
            this.cmpAnimator = new FudgeCore.ComponentAnimator(this.animation);
        }
        fillContent() {
            // this.content = document.createElement("span");
            // this.content.id = "TESTID";
            this.toolbar = document.createElement("div");
            this.toolbar.id = "toolbar";
            this.toolbar.style.width = "300px";
            this.toolbar.style.height = "80px";
            this.toolbar.style.borderBottom = "1px solid black";
            this.fillToolbar(this.toolbar);
            this.attributeList = document.createElement("div");
            this.attributeList.id = "attributeList";
            this.attributeList.style.width = "300px";
            // this.attributeList.addEventListener(FudgeUserInterface.EVENT.UPDATE, this.changeAttribute.bind(this));
            this.attributeList.addEventListener("change" /* CHANGE */, this.changeAttribute.bind(this));
            //TODO: Add Moni's custom Element here
            this.controller = new Fudge.AnimationList(this.animation.getMutated(this.playbackTime, 0, FudgeCore.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS), this.attributeList);
            this.canvas = document.createElement("canvas");
            this.canvas.width = 1500;
            this.canvas.height = 500;
            this.canvas.style.position = "absolute";
            this.canvas.style.left = "300px";
            this.canvas.style.top = "0px";
            this.canvas.style.borderLeft = "1px solid black";
            this.crc = this.canvas.getContext("2d");
            this.hover = document.createElement("span");
            this.hover.style.background = "black";
            this.hover.style.color = "white";
            this.hover.style.position = "absolute";
            this.hover.style.display = "none";
            this.dom.appendChild(this.toolbar);
            this.dom.appendChild(this.attributeList);
            // this.content.appendChild(this.canvasSheet);
            this.dom.appendChild(this.canvas);
            this.dom.appendChild(this.hover);
            // this.sheet = new ViewAnimationSheetDope(this, this.crc, null, new FudgeCore.Vector2(.5, 0.5), new FudgeCore.Vector2(0, 0));
            this.sheet = new Fudge.ViewAnimationSheetCurve(this, this.crc, null, new FudgeCore.Vector2(0.5, 2), new FudgeCore.Vector2(0, 200));
            this.sheet.redraw(this.playbackTime);
            // sheet.translate();
        }
        installListeners() {
            this.canvas.addEventListener("click", this.mouseClick.bind(this));
            this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
            this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
            this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
            this.toolbar.addEventListener("click", this.toolbarClick.bind(this));
            this.toolbar.addEventListener("change", this.toolbarChange.bind(this));
            requestAnimationFrame(this.playAnimation.bind(this));
        }
        mouseClick(_e) {
            // console.log(_e);
        }
        mouseDown(_e) {
            if (_e.offsetY < 50) {
                this.setTime(_e.offsetX / this.sheet.scale.x);
                return;
            }
            let obj = this.sheet.getObjectAtPoint(_e.offsetX, _e.offsetY);
            if (!obj)
                return;
            // TODO: events should bubble to panel
            if (obj["label"]) {
                console.log(obj["label"]);
                this.dom.dispatchEvent(new CustomEvent("itemselect" /* SELECT */, { detail: { name: obj["label"], time: this.animation.labels[obj["label"]] } }));
            }
            else if (obj["event"]) {
                console.log(obj["event"]);
                this.dom.dispatchEvent(new CustomEvent("itemselect" /* SELECT */, { detail: { name: obj["event"], time: this.animation.events[obj["event"]] } }));
            }
            else if (obj["key"]) {
                console.log(obj["key"]);
                this.dom.dispatchEvent(new CustomEvent("itemselect" /* SELECT */, { detail: obj["key"] }));
            }
            console.log(obj);
        }
        mouseMove(_e) {
            _e.preventDefault();
            if (_e.buttons != 1)
                return;
            if (_e.offsetY < 50) {
                this.setTime(_e.offsetX / this.sheet.scale.x);
                return;
            }
        }
        mouseUp(_e) {
            // console.log(_e);
            //
        }
        fillToolbar(_tb) {
            let playmode = document.createElement("select");
            playmode.id = "playmode";
            for (let m in FudgeCore.ANIMATION_PLAYMODE) {
                if (isNaN(+m)) {
                    let op = document.createElement("option");
                    op.value = m;
                    op.innerText = m;
                    playmode.appendChild(op);
                }
            }
            _tb.appendChild(playmode);
            _tb.appendChild(document.createElement("br"));
            let fpsL = document.createElement("label");
            fpsL.setAttribute("for", "fps");
            fpsL.innerText = "FPS";
            let fpsI = document.createElement("input");
            fpsI.type = "number";
            fpsI.min = "0";
            fpsI.max = "999";
            fpsI.step = "1";
            fpsI.id = "fps";
            fpsI.value = this.animation.fps.toString();
            fpsI.style.width = "40px";
            _tb.appendChild(fpsL);
            _tb.appendChild(fpsI);
            let spsL = document.createElement("label");
            spsL.setAttribute("for", "sps");
            spsL.innerText = "SPS";
            let spsI = document.createElement("input");
            spsI.type = "number";
            spsI.min = "0";
            spsI.max = "999";
            spsI.step = "1";
            spsI.id = "sps";
            spsI.value = this.animation.stepsPerSecond.toString();
            spsI.style.width = "40px";
            _tb.appendChild(spsL);
            _tb.appendChild(spsI);
            _tb.appendChild(document.createElement("br"));
            let buttons = [];
            buttons.push(document.createElement("button"));
            buttons.push(document.createElement("button"));
            buttons.push(document.createElement("button"));
            buttons.push(document.createElement("button"));
            buttons.push(document.createElement("button"));
            buttons.push(document.createElement("button"));
            buttons.push(document.createElement("button"));
            buttons.push(document.createElement("button"));
            buttons.push(document.createElement("button"));
            buttons[0].classList.add("fa", "fa-fast-backward", "start");
            buttons[1].classList.add("fa", "fa-backward", "back");
            buttons[2].classList.add("fa", "fa-play", "play");
            buttons[3].classList.add("fa", "fa-pause", "pause");
            buttons[4].classList.add("fa", "fa-forward", "forward");
            buttons[5].classList.add("fa", "fa-fast-forward", "end");
            buttons[6].classList.add("fa", "fa-file", "add-label");
            buttons[7].classList.add("fa", "fa-bookmark", "add-event");
            buttons[8].classList.add("fa", "fa-plus-square", "add-key");
            buttons[0].id = "start";
            buttons[1].id = "back";
            buttons[2].id = "play";
            buttons[3].id = "pause";
            buttons[4].id = "forward";
            buttons[5].id = "end";
            buttons[6].id = "add-label";
            buttons[7].id = "add-event";
            buttons[8].id = "add-key";
            for (let b of buttons) {
                _tb.appendChild(b);
            }
        }
        toolbarClick(_e) {
            // console.log("click", _e.target);
            let target = _e.target;
            switch (target.id) {
                case "add-label":
                    this.animation.labels[this.randomNameGenerator()] = this.playbackTime;
                    this.sheet.redraw(this.playbackTime);
                    break;
                case "add-event":
                    this.animation.setEvent(this.randomNameGenerator(), this.playbackTime);
                    this.sheet.redraw(this.playbackTime);
                    break;
                case "add-key":
                    break;
                case "start":
                    this.playbackTime = 0;
                    this.updateDisplay();
                    break;
                case "back":
                    this.playbackTime = this.playbackTime -= 1000 / this.animation.stepsPerSecond;
                    this.playbackTime = Math.max(this.playbackTime, 0);
                    this.updateDisplay();
                    break;
                case "play":
                    this.time.set(this.playbackTime);
                    this.playing = true;
                    break;
                case "pause":
                    this.playing = false;
                    break;
                case "forward":
                    this.playbackTime = this.playbackTime += 1000 / this.animation.stepsPerSecond;
                    this.playbackTime = Math.min(this.playbackTime, this.animation.totalTime);
                    this.updateDisplay();
                    break;
                case "end":
                    this.playbackTime = this.animation.totalTime;
                    this.sheet.redraw(this.playbackTime);
                    this.updateDisplay();
                    break;
                default:
                    break;
            }
        }
        toolbarChange(_e) {
            let target = _e.target;
            switch (target.id) {
                case "playmode":
                    this.cmpAnimator.playmode = FudgeCore.ANIMATION_PLAYMODE[target.value];
                    // console.log(FudgeCore.ANIMATION_PLAYMODE[target.value]);
                    break;
                case "fps":
                    // console.log("fps changed to", target.value);
                    if (!isNaN(+target.value))
                        this.animation.fps = +target.value;
                    break;
                case "sps":
                    // console.log("sps changed to", target.value);
                    if (!isNaN(+target.value)) {
                        this.animation.stepsPerSecond = +target.value;
                        this.sheet.redraw(this.playbackTime);
                    }
                    break;
                default:
                    console.log("no clue what you changed...");
                    break;
            }
        }
        changeAttribute(_e) {
            console.log(_e);
            console.log(this.controller.getMutator());
            // console.log("1", this.controller.getMutator());
            // console.log("2", this.controller.collectMutator());
            // this.controller.BuildFromMutator(this.animation.getMutated(this.playbackTime, 1, FudgeCore.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS));
        }
        updateDisplay(_m = null) {
            this.sheet.redraw(this.playbackTime);
            if (!_m)
                _m = this.animation.getMutated(this.playbackTime, 0, this.cmpAnimator.playback);
            // this.attributeList.innerHTML = "";
            // this.attributeList.appendChild(
            // this.controller.BuildFromMutator(_m);
            // this.controller = new FudgeUserInterface.UIAnimationList(_m, this.attributeList); //TODO: remove this hack, because it's horrible!
            this.controller.updateMutator(_m);
        }
        setTime(_time, updateDisplay = true) {
            this.playbackTime = Math.min(this.animation.totalTime, Math.max(0, _time));
            if (updateDisplay)
                this.updateDisplay();
        }
        playAnimation() {
            requestAnimationFrame(this.playAnimation.bind(this));
            if (!this.playing)
                return;
            let t = this.time.get();
            let m = {};
            [m, t] = this.cmpAnimator.updateAnimation(t);
            this.playbackTime = t;
            this.updateDisplay(m);
        }
        randomNameGenerator() {
            let attr = ["red", "blue", "green", "pink", "yellow", "purple", "orange", "fast", "slow", "quick", "boring", "questionable", "king", "queen", "smart", "gold"];
            let anim = ["cow", "fish", "elephant", "cat", "dog", "bat", "chameleon", "caterpillar", "crocodile", "hamster", "horse", "panda", "giraffe", "lukas", "koala", "jellyfish", "lion", "lizard", "platypus", "scorpion", "penguin", "pterodactyl"];
            return attr[Math.floor(Math.random() * attr.length)] + "-" + anim[Math.floor(Math.random() * anim.length)];
        }
    }
    Fudge.ViewAnimation = ViewAnimation;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class ViewAnimationSheet {
        //TODO stop using hardcoded colors
        constructor(_view, _crc, _seq, _scale = new FudgeCore.Vector2(1, 1), _pos = new FudgeCore.Vector2()) {
            this.keys = [];
            this.sequences = [];
            this.labels = [];
            this.events = [];
            this.view = _view;
            this.crc2 = _crc;
            this.seq = _seq;
            this.scale = _scale;
            this.position = _pos;
        }
        moveTo(_time, _value = this.position.y) {
            this.position.x = _time;
            this.position.y = _value;
        }
        translate() {
            this.crc2.translate(this.position.x, this.position.y);
            this.crc2.scale(this.scale.x, this.scale.y);
        }
        redraw(_time) {
            this.clear();
            this.translate();
            this.drawKeys();
            this.drawTimeline();
            this.drawEventsAndLabels();
            this.drawCursor(_time);
        }
        clear() {
            this.crc2.resetTransform();
            let maxDistance = 10000;
            this.crc2.clearRect(0, 0, maxDistance, this.crc2.canvas.height);
        }
        drawTimeline() {
            this.crc2.resetTransform();
            let timelineHeight = 50;
            let maxDistance = 10000;
            let timeline = new Path2D();
            this.crc2.fillStyle = "#7a7a7a";
            this.crc2.fillRect(0, 0, maxDistance, timelineHeight + 30);
            timeline.moveTo(0, timelineHeight);
            //TODO make this use some actually sensible numbers, maybe 2x the animation length
            timeline.lineTo(maxDistance, timelineHeight);
            //TODO: make this scale nicely/use the animations SPS
            let baseWidth = 1000;
            let pixelPerSecond = Math.floor(baseWidth * this.scale.x);
            let stepsPerSecond = this.view.animation.stepsPerSecond;
            let stepsPerDisplayText = 1;
            // [stepsPerSecond, stepsPerDisplayText] = this.calculateDisplay(pixelPerSecond);
            let pixelPerStep = pixelPerSecond / stepsPerSecond;
            let steps = 0;
            // console.log(pixelPerSecond, pixelPerStep);
            this.crc2.strokeStyle = "black";
            this.crc2.fillStyle = "black";
            for (let i = 0; i < maxDistance; i += pixelPerStep) {
                timeline.moveTo(i, timelineHeight);
                if (steps % stepsPerDisplayText == 0) {
                    //TODO: stop using hardcoded heights
                    timeline.lineTo(i, timelineHeight - 25);
                    this.crc2.fillText(steps.toString(), i - 3, timelineHeight - 28);
                    if (Math.round(i) % Math.round(1000 * this.scale.x) == 0)
                        //TODO: make the time display independent of the SPS display. Trying to tie the two together was a stupid idea.
                        this.crc2.fillText((Math.round(100 * (i / 1000 / this.scale.x)) / 100).toString() + "s", i - 3, 10);
                }
                else {
                    timeline.lineTo(i, timelineHeight - 20);
                }
                steps++;
            }
            this.crc2.stroke(timeline);
        }
        drawCursor(_time) {
            _time *= this.scale.x;
            let cursor = new Path2D();
            cursor.rect(_time - 3, 0, 6, 50);
            cursor.moveTo(_time, 50);
            cursor.lineTo(_time, this.crc2.canvas.height);
            this.crc2.strokeStyle = "red";
            this.crc2.fillStyle = "red";
            this.crc2.stroke(cursor);
            this.crc2.fill(cursor);
        }
        drawKeys() {
            let inputMutator = this.view.controller.getElementIndex();
            //TODO: stop recreating the sequence elements all the time
            this.sequences = [];
            this.keys = [];
            this.traverseStructures(this.view.animation.animationStructure, inputMutator);
        }
        getObjectAtPoint(_x, _y) {
            for (let l of this.labels) {
                if (this.crc2.isPointInPath(l.path2D, _x, _y)) {
                    return l;
                }
            }
            for (let e of this.events) {
                if (this.crc2.isPointInPath(e.path2D, _x, _y)) {
                    return e;
                }
            }
            _x = _x / this.scale.x - this.position.x;
            _y = _y / this.scale.y - this.position.y / this.scale.y;
            for (let k of this.keys) {
                if (this.crc2.isPointInPath(k.path2D, _x, _y)) {
                    return k;
                }
            }
            return null;
        }
        traverseStructures(_animation, _inputs) {
            for (let i in _animation) {
                if (_animation[i] instanceof FudgeCore.AnimationSequence) {
                    this.drawSequence(_animation[i], _inputs[i]);
                }
                else {
                    this.traverseStructures(_animation[i], _inputs[i]);
                }
            }
        }
        drawKey(_x, _y, _h, _w, _c) {
            let key = new Path2D();
            key.moveTo(_x - _w, _y);
            key.lineTo(_x, _y + _h);
            key.lineTo(_x + _w, _y);
            key.lineTo(_x, _y - _h);
            key.closePath();
            this.crc2.fillStyle = _c;
            this.crc2.strokeStyle = "black";
            this.crc2.lineWidth = 1;
            this.crc2.fill(key);
            this.crc2.stroke(key);
            return key;
        }
        drawEventsAndLabels() {
            let maxDistance = 10000;
            let labelDisplayHeight = 30 + 50;
            let line = new Path2D();
            line.moveTo(0, labelDisplayHeight);
            line.lineTo(maxDistance, labelDisplayHeight);
            this.crc2.strokeStyle = "black";
            this.crc2.fillStyle = "black";
            this.crc2.stroke(line);
            this.labels = [];
            this.events = [];
            if (!this.view.animation)
                return;
            for (let l in this.view.animation.labels) {
                //TODO stop using hardcoded values
                let p = new Path2D;
                this.labels.push({ label: l, path2D: p });
                let position = this.view.animation.labels[l] * this.scale.x;
                p.moveTo(position - 3, labelDisplayHeight - 28);
                p.lineTo(position - 3, labelDisplayHeight - 2);
                p.lineTo(position + 3, labelDisplayHeight - 2);
                p.lineTo(position + 3, labelDisplayHeight - 25);
                p.lineTo(position, labelDisplayHeight - 28);
                p.lineTo(position - 3, labelDisplayHeight - 28);
                this.crc2.fill(p);
                this.crc2.stroke(p);
                let p2 = new Path2D();
                p2.moveTo(position, labelDisplayHeight - 28);
                p2.lineTo(position, labelDisplayHeight - 25);
                p2.lineTo(position + 3, labelDisplayHeight - 25);
                this.crc2.strokeStyle = "white";
                this.crc2.stroke(p2);
                this.crc2.strokeStyle = "black";
            }
            for (let e in this.view.animation.events) {
                let p = new Path2D;
                this.events.push({ event: e, path2D: p });
                let position = this.view.animation.events[e] * this.scale.x;
                p.moveTo(position - 3, labelDisplayHeight - 28);
                p.lineTo(position - 3, labelDisplayHeight - 5);
                p.lineTo(position, labelDisplayHeight - 2);
                p.lineTo(position + 3, labelDisplayHeight - 5);
                p.lineTo(position + 3, labelDisplayHeight - 28);
                p.lineTo(position - 3, labelDisplayHeight - 28);
                // this.crc2.fill(p);
                this.crc2.stroke(p);
            }
        }
        calculateDisplay(_ppS) {
            // let minPixelPerStep: number = 10;
            // let maxPixelPerStep: number = 50;
            // //TODO: use animation SPS
            // let currentPPS: number = _ppS;
            // while (currentPPS < minPixelPerStep || maxPixelPerStep < currentPPS) {
            //   if(currentPPS < minPixelPerStep) {
            //     currentPPS /= 1.5;
            //   }
            // }
            return [60, 10];
        }
    }
    Fudge.ViewAnimationSheet = ViewAnimationSheet;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class ViewAnimationSheetCurve extends Fudge.ViewAnimationSheet {
        drawKeys() {
            this.drawYScale();
            super.drawKeys();
        }
        drawSequence(_sequence, _input) {
            if (_sequence.length <= 0)
                return;
            let rect = _input.getBoundingClientRect();
            let height = rect.height / this.scale.y;
            let width = rect.height / this.scale.x;
            let line = new Path2D();
            line.moveTo(0, _sequence.getKey(0).Value);
            //TODO: stop recreating the sequence element all the time
            //TODO: get color from input element or former sequence element.
            let seq = { color: this.randomColor(), element: _input, sequence: _sequence };
            this.sequences.push(seq);
            for (let i = 0; i < _sequence.length; i++) {
                let k = _sequence.getKey(i);
                this.keys.push({ key: k, path2D: this.drawKey(k.Time, k.Value, height / 2, width / 2, seq.color), sequence: seq });
                line.lineTo(k.Time, k.Value);
            }
            line.lineTo(this.view.animation.totalTime, _sequence.getKey(_sequence.length - 1).Value);
            this.crc2.strokeStyle = seq.color;
            this.crc2.stroke(line);
        }
        drawKey(_x, _y, _h, _w, _c) {
            return super.drawKey(_x, _y, _h, _w, _c);
        }
        drawYScale() {
            let pixelPerValue = this.calcScaleSize();
            let valuePerPixel = 1 / pixelPerValue;
            this.crc2.strokeStyle = "black";
            this.crc2.lineWidth = 1 / this.scale.y;
            let line = new Path2D;
            line.moveTo(0, 0);
            line.lineTo(100000, 0);
            this.crc2.stroke(line);
        }
        calcScaleSize() {
            let min = 10;
            let max = 50;
            let pixelPerValue = this.scale.y;
            while (pixelPerValue < min) {
                pixelPerValue *= 10;
            }
            while (pixelPerValue > max) {
                pixelPerValue /= 2;
            }
            return pixelPerValue;
        }
        randomColor() {
            return "hsl(" + Math.random() * 360 + ", 80%, 80%)";
        }
    }
    Fudge.ViewAnimationSheetCurve = ViewAnimationSheetCurve;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class ViewAnimationSheetDope extends Fudge.ViewAnimationSheet {
        async drawKeys() {
            //TODO: Fix that for some reason the first time this is called the rects return all 0s.
            //TODO: possible optimisation: only regenerate if necessary, otherwise load a saved image. (might lead to problems with the keys not being clickable anymore though)
            // const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            let inputMutator = this.view.controller.getElementIndex();
            // console.log(inputMutator);
            // await delay(1);
            // console.log(inputMutator.components["ComponentTransform"][0]["ƒ.ComponentTransform"]["rotation"]["y"].getBoundingClientRect());
            // }, 1000);
            this.traverseStructures(this.view.animation.animationStructure, inputMutator);
        }
        drawSequence(_sequence, _input) {
            let rect = _input.getBoundingClientRect();
            let y = rect.top - this.view.dom.getBoundingClientRect().top + rect.height / 2;
            let height = rect.height;
            let width = rect.height;
            let line = new Path2D();
            line.moveTo(0, y);
            line.lineTo(this.crc2.canvas.width, y);
            this.crc2.strokeStyle = "black";
            this.crc2.stroke(line);
            let seq = { color: "red", element: _input, sequence: _sequence };
            this.sequences.push(seq);
            for (let i = 0; i < _sequence.length; i++) {
                let k = _sequence.getKey(i);
                this.keys.push({ key: k, path2D: this.drawKey(k.Time * this.scale.x, y, height / 2, width / 2, seq.color), sequence: seq });
            }
        }
    }
    Fudge.ViewAnimationSheetDope = ViewAnimationSheetDope;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    let Menu;
    (function (Menu) {
        Menu["COMPONENTMENU"] = "Add Components";
    })(Menu || (Menu = {}));
    // TODO: examin problem with ƒ.Material when using "typeof ƒ.Mutable" as key to the map
    let resourceToComponent = new Map([
        [ƒ.Audio, ƒ.ComponentAudio],
        [ƒ.Material, ƒ.ComponentMaterial],
        [ƒ.Mesh, ƒ.ComponentMesh]
    ]);
    /**
     * View all components attached to a node
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewComponents extends Fudge.View {
        constructor(_container, _state) {
            super(_container, _state);
            this.expanded = { ComponentTransform: true };
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    // case ƒui.EVENT.RENAME: break;
                    case Fudge.EVENT_EDITOR.SET_GRAPH:
                    case Fudge.EVENT_EDITOR.FOCUS_NODE:
                        this.node = _event.detail;
                    case Fudge.EVENT_EDITOR.UPDATE:
                        this.fillContent();
                        break;
                    case "expand" /* EXPAND */:
                    case "collapse" /* COLLAPSE */:
                        this.expanded[_event.target.getAttribute("type")] = (_event.type == "expand" /* EXPAND */);
                    default:
                        break;
                }
            };
            this.fillContent();
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SET_GRAPH, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.FOCUS_NODE, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.UPDATE, this.hndEvent);
            this.dom.addEventListener("rename" /* RENAME */, this.hndEvent);
            this.dom.addEventListener("expand" /* EXPAND */, this.hndEvent);
            this.dom.addEventListener("collapse" /* COLLAPSE */, this.hndEvent);
            this.dom.addEventListener("contextmenu" /* CONTEXTMENU */, this.openContextMenu);
        }
        //#region  ContextMenu
        getContextMenu(_callback) {
            const menu = new Fudge.remote.Menu();
            let item;
            item = new Fudge.remote.MenuItem({
                label: "Add Component",
                submenu: Fudge.ContextMenu.getSubclassMenu(Fudge.CONTEXTMENU.ADD_COMPONENT, ƒ.Component.subclasses, _callback)
            });
            menu.append(item);
            Fudge.ContextMenu.appendCopyPaste(menu);
            return menu;
        }
        contextMenuCallback(_item, _window, _event) {
            ƒ.Debug.info(`MenuSelect: Item-id=${Fudge.CONTEXTMENU[_item.id]}`);
            switch (Number(_item.id)) {
                case Fudge.CONTEXTMENU.ADD_COMPONENT:
                    let iSubclass = _item["iSubclass"];
                    let component = ƒ.Component.subclasses[iSubclass];
                    //@ts-ignore
                    let cmpNew = new component();
                    ƒ.Debug.info(cmpNew.type, cmpNew);
                    this.node.addComponent(cmpNew);
                    this.dom.dispatchEvent(new CustomEvent("itemselect" /* SELECT */, { bubbles: true, detail: { data: this.node } }));
                    break;
            }
        }
        //#endregion
        hndDragOver(_event, _viewSource) {
            if (!this.node)
                return;
            if (this.dom != _event.target)
                return;
            if (!(_viewSource instanceof Fudge.ViewInternal || _viewSource instanceof Fudge.ViewScript))
                return;
            for (let source of _viewSource.getDragDropSources()) {
                if (source instanceof Fudge.ScriptInfo) {
                    if (!source.isComponent)
                        return;
                }
                else if (!this.findComponentType(source))
                    return;
            }
            _event.dataTransfer.dropEffect = "link";
            _event.preventDefault();
            _event.stopPropagation();
        }
        hndDrop(_event, _viewSource) {
            for (let source of _viewSource.getDragDropSources()) {
                let cmpNew = this.createComponent(source);
                this.node.addComponent(cmpNew);
                this.expanded[cmpNew.type] = true;
            }
            this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.UPDATE, { bubbles: true }));
        }
        fillContent() {
            while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild))
                ;
            if (this.node) {
                if (this.node instanceof ƒ.Node) {
                    this.setTitle(this.node.name);
                    let nodeComponents = this.node.getAllComponents();
                    for (let nodeComponent of nodeComponents) {
                        let fieldset = ƒui.Generator.createFieldSetFromMutable(nodeComponent);
                        let uiComponent = new Fudge.ControllerComponent(nodeComponent, fieldset);
                        fieldset.expand(this.expanded[nodeComponent.type]);
                        this.dom.append(uiComponent.domElement);
                    }
                }
            }
            else {
                let cntEmpty = document.createElement("div");
                this.dom.append(cntEmpty);
            }
        }
        createComponent(_resource) {
            if (_resource instanceof Fudge.ScriptInfo)
                if (_resource.isComponent)
                    return new _resource.script();
            let typeComponent = this.findComponentType(_resource);
            return new typeComponent(_resource);
        }
        findComponentType(_resource) {
            for (let entry of resourceToComponent)
                if (_resource instanceof entry[0])
                    return entry[1];
        }
    }
    Fudge.ViewComponents = ViewComponents;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    /**
     * View the hierarchy of a graph as tree-control
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewHierarchy extends Fudge.View {
        constructor(_container, _state) {
            super(_container, _state);
            //#endregion
            //#region EventHandlers
            this.hndEvent = (_event) => {
                this.setGraph(_event.detail);
            };
            // this.contextMenu = this.getContextMenu(this.contextMenuCallback);
            this.setGraph(_state.node);
            // this.parentPanel.addEventListener(ƒui.EVENT.SELECT, this.setSelectedNode);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SET_GRAPH, this.hndEvent);
        }
        setGraph(_graph) {
            if (!_graph)
                return;
            if (this.tree)
                this.dom.removeChild(this.tree);
            this.graph = _graph;
            // this.selectedNode = null;
            this.tree = new ƒui.Tree(new Fudge.ControllerTreeNode(), this.graph);
            // this.listController.listRoot.addEventListener(ƒui.EVENT.SELECT, this.passEventToPanel);
            //TODO: examine if tree should fire common UI-EVENT for selection instead
            // this.tree.addEventListener(ƒui.EVENT.SELECT, this.passEventToPanel);
            this.tree.addEventListener("contextmenu" /* CONTEXTMENU */, this.openContextMenu);
            this.dom.append(this.tree);
        }
        getSelection() {
            return this.tree.controller.selection;
        }
        getDragDropSources() {
            return this.tree.controller.dragDrop.sources;
        }
        hndDragOver(_event, _viewSource) {
            if (_viewSource == this) {
                _event.stopPropagation();
                return; // continue with standard tree behaviour
            }
            _event.dataTransfer.dropEffect = "none";
            if (_event.target == this.dom)
                return;
            if (!(_viewSource instanceof Fudge.ViewInternal))
                return;
            let source = _viewSource.getDragDropSources()[0];
            if (!(source instanceof ƒ.Graph))
                return;
            _event.dataTransfer.dropEffect = "copy";
            _event.preventDefault();
            _event.stopPropagation();
        }
        async hndDrop(_event, _viewSource) {
            if (_viewSource == this)
                return; // continue with standard tree behaviour
            _event.stopPropagation(); // capture phase, don't pass further down
            let graph = _viewSource.getDragDropSources()[0];
            let instance = await ƒ.Project.createGraphInstance(graph);
            let target = this.tree.controller.dragDrop.target;
            target.appendChild(instance);
            this.tree.findVisible(target).expand(true);
            this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.UPDATE, { bubbles: true }));
        }
        //#region  ContextMenu
        getContextMenu(_callback) {
            const menu = new Fudge.remote.Menu();
            let item;
            item = new Fudge.remote.MenuItem({ label: "Add Node", id: String(Fudge.CONTEXTMENU.ADD_NODE), click: _callback, accelerator: process.platform == "darwin" ? "N" : "N" });
            menu.append(item);
            // item = new remote.MenuItem({
            //   label: "Add Component",
            //   submenu: ContextMenu.getSubclassMenu<typeof ƒ.Component>(CONTEXTMENU.ADD_COMPONENT, ƒ.Component.subclasses, _callback)
            // });
            // menu.append(item);
            // ContextMenu.appendCopyPaste(menu);
            // menu.addListener("menu-will-close", (_event: Electron.Event) => { console.log(_event); });
            return menu;
        }
        contextMenuCallback(_item, _window, _event) {
            ƒ.Debug.info(`MenuSelect: Item-id=${Fudge.CONTEXTMENU[_item.id]}`);
            let focus = this.tree.getFocussed();
            switch (Number(_item.id)) {
                case Fudge.CONTEXTMENU.ADD_NODE:
                    let child = new ƒ.Node("New Node");
                    focus.addChild(child);
                    this.tree.findVisible(focus).expand(true);
                    this.tree.findVisible(child).focus();
                    break;
                // case CONTEXTMENU.ADD_COMPONENT:
                //   let iSubclass: number = _item["iSubclass"];
                //   let component: typeof ƒ.Component = ƒ.Component.subclasses[iSubclass];
                //   //@ts-ignore
                //   let cmpNew: ƒ.Component = new component();
                //   ƒ.Debug.info(cmpNew.type, cmpNew);
                //   focus.addComponent(cmpNew);
                //   this.dom.dispatchEvent(new CustomEvent(ƒui.EVENT.SELECT, { bubbles: true, detail: { data: focus } }));
                //   break;
                case Fudge.CONTEXTMENU.ADD_COMPONENT_SCRIPT:
                    // let script: typeof ƒ.ComponentScript = <typeof ƒ.ComponentScript>_item["Script"];
                    let cmpScript = ƒ.Serializer.reconstruct(_item["Script"]);
                    // let cmpScript: ƒ.ComponentScript = new script(); //Reflect.construct(script); //
                    ƒ.Debug.info(cmpScript.type, cmpScript);
                    focus.addComponent(cmpScript);
                    this.dom.dispatchEvent(new CustomEvent("itemselect" /* SELECT */, { bubbles: true, detail: { data: focus } }));
                    break;
                case Fudge.CONTEXTMENU.DELETE_NODE:
                    focus.getParent().removeChild(focus);
                    break;
            }
        }
    }
    Fudge.ViewHierarchy = ViewHierarchy;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒaid = FudgeAid;
    /**
     * View the rendering of a graph in a viewport with an independent camera
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewRender extends Fudge.View {
        constructor(_container, _state) {
            super(_container, _state);
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case Fudge.EVENT_EDITOR.SET_GRAPH:
                        this.setGraph(_event.detail);
                        break;
                    case "mutate" /* MUTATE */:
                    case Fudge.EVENT_EDITOR.UPDATE:
                        this.redraw();
                }
            };
            // private animate = (_e: Event) => {
            //   this.viewport.setGraph(this.graph);
            //   if (this.canvas.clientHeight > 0 && this.canvas.clientWidth > 0)
            //     this.viewport.draw();
            // }
            this.activeViewport = (_event) => {
                // let event: CustomEvent = new CustomEvent(EVENT_EDITOR.ACTIVATE_VIEWPORT, { detail: this.viewport.camera, bubbles: false });
                _event.cancelBubble = true;
            };
            this.redraw = () => {
                try {
                    this.viewport.draw();
                }
                catch (_error) {
                    //nop
                }
            };
            this.graph = _state["node"];
            this.createUserInterface();
            _container.on("resize", this.redraw);
            this.dom.addEventListener("mutate" /* MUTATE */, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.UPDATE, this.hndEvent);
            this.dom.addEventListener("itemselect" /* SELECT */, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SET_GRAPH, this.hndEvent);
        }
        createUserInterface() {
            let cmpCamera = new ƒ.ComponentCamera();
            cmpCamera.pivot.translate(new ƒ.Vector3(3, 2, 1));
            cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
            cmpCamera.projectCentral(1, 45);
            this.canvas = ƒaid.Canvas.create(true, ƒaid.IMAGE_RENDERING.PIXELATED);
            let container = document.createElement("div");
            container.style.borderWidth = "0px";
            document.body.appendChild(this.canvas);
            this.viewport = new ƒ.Viewport();
            this.viewport.initialize("ViewNode_Viewport", this.graph, cmpCamera, this.canvas);
            this.viewport.draw();
            this.dom.append(this.canvas);
            // ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL);
            // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);
            //Focus cameracontrols on new viewport
            // let event: CustomEvent = new CustomEvent(EVENT_EDITOR.ACTIVATE_VIEWPORT, { detail: this.viewport.camera, bubbles: false });
            this.canvas.addEventListener("click", this.activeViewport);
        }
        setGraph(_node) {
            if (!_node)
                return;
            this.graph = _node;
            this.viewport.setGraph(this.graph);
            this.redraw();
        }
        hndDragOver(_event, _viewSource) {
            _event.dataTransfer.dropEffect = "none";
            // if (this.dom != _event.target)
            //   return;
            if (!(_viewSource instanceof Fudge.ViewInternal))
                return;
            let source = _viewSource.getDragDropSources()[0];
            if (!(source instanceof ƒ.Graph))
                return;
            _event.dataTransfer.dropEffect = "link";
            _event.preventDefault();
            _event.stopPropagation();
        }
        hndDrop(_event, _viewSource) {
            let source = _viewSource.getDragDropSources()[0];
            // this.setGraph(<ƒ.Node>source);
            this.dom.dispatchEvent(new CustomEvent(Fudge.EVENT_EDITOR.SET_GRAPH, { bubbles: true, detail: source }));
        }
    }
    Fudge.ViewRender = ViewRender;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒaid = FudgeAid;
    class ViewModellerScene extends Fudge.View {
        constructor(_container, _state) {
            super(_container, _state);
            this.animate = (_e) => {
                this.viewport.setGraph(this.graph);
                if (this.canvas.clientHeight > 0 && this.canvas.clientWidth > 0)
                    this.viewport.draw();
                this.controller.drawSelection();
            };
            this.onmove = (_event) => {
                this.controller.onmove(_event);
            };
            this.onmouseup = (_event) => {
                switch (_event.button) {
                    case 0: this.controller.onmouseup(_event);
                }
            };
            this.onmousedown = (_event) => {
                switch (_event.button) {
                    case 0: this.controller.onmousedown(_event);
                }
            };
            this.handleKeyboard = (_event) => {
                this.controller.switchMode(_event);
            };
            this.onkeydown = (_event) => {
                this.controller.onkeydown(_event);
            };
            this.onkeyup = (_event) => {
                this.controller.onkeyup(_event);
            };
            this.graph = _state["node"];
            this.createUserInterface();
            ƒaid.addStandardLightComponents(this.graph, new ƒ.Color(0.5, 0.5, 0.5));
            ƒ.RenderOperator.setBackfaceCulling(false);
            this.node = this.graph.getChildrenByName("Default")[0];
            this.controller = new Fudge.Controller(this.viewport, this.node);
            // tslint:disable-next-line: no-unused-expression
            new Fudge.CameraControl(this.viewport);
            // this.dom.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.hndEvent);
            // this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
            this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
            this.viewport.addEventListener("\u0192pointermove" /* MOVE */, this.onmove);
            this.viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
            this.viewport.addEventListener("\u0192pointerup" /* UP */, this.onmouseup);
            this.viewport.activatePointerEvent("\u0192pointerup" /* UP */, true);
            this.viewport.addEventListener("\u0192pointerdown" /* DOWN */, this.onmousedown);
            this.viewport.activatePointerEvent("\u0192pointerdown" /* DOWN */, true);
            this.viewport.addEventListener("\u0192keydown" /* DOWN */, this.handleKeyboard);
            this.viewport.activateKeyboardEvent("\u0192keydown" /* DOWN */, true);
            this.viewport.addEventListener("\u0192keydown" /* DOWN */, this.onkeydown);
            this.viewport.activateKeyboardEvent("\u0192keydown" /* DOWN */, true);
            this.viewport.addEventListener("\u0192keyup" /* UP */, this.onkeyup);
            this.viewport.activateKeyboardEvent("\u0192keyup" /* UP */, true);
            this.viewport.setFocus(true);
            this.dom.addEventListener("contextmenu" /* CONTEXTMENU */, this.openContextMenu);
        }
        createUserInterface() {
            let cmpCamera = new ƒ.ComponentCamera();
            cmpCamera.pivot.translate(new ƒ.Vector3(3, 2, 1));
            cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
            cmpCamera.projectCentral(1, 45);
            //new ƒaid.CameraOrbit(cmpCamera);
            //cmpCamera.pivot.rotateX(90);
            this.canvas = ƒaid.Canvas.create(true, ƒaid.IMAGE_RENDERING.PIXELATED);
            let container = document.createElement("div");
            container.style.borderWidth = "0px";
            document.body.appendChild(this.canvas);
            this.viewport = new ƒ.Viewport();
            this.viewport.initialize("Viewport", this.graph, cmpCamera, this.canvas);
            // ƒaid.Viewport.expandCameraToInteractiveOrbit(this.viewport);
            this.viewport.draw();
            this.dom.append(this.canvas);
            ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL);
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.animate);
        }
        getContextMenu(_callback) {
            const menu = new Fudge.remote.Menu();
            let item;
            let submenu = new Fudge.remote.Menu();
            // submenu.append(new remote.MenuItem({label: "Object"}));
            // item = new remote.MenuItem({
            //   label: "Control Mode",
            //   submenu: ContextMenu.getSubclassMenu<typeof AbstractControlMode>(CONTEXTMENU.CONTROL_MODE, AbstractControlMode.subclasses, _callback)
            // });
            if (!this.controller) {
                return menu;
            }
            for (let mode of this.controller.controlModes.keys()) {
                let subitem = new Fudge.remote.MenuItem({ label: mode, id: String(Fudge.CONTEXTMENU.CONTROL_MODE), click: _callback, accelerator: process.platform == "darwin" ? "Command+" + this.controller.controlModes.get(mode).shortcut : "ctrl+" + this.controller.controlModes.get(mode).shortcut });
                //@ts-ignore
                subitem.overrideProperty("controlMode", mode);
                submenu.append(subitem);
            }
            item = new Fudge.remote.MenuItem({
                label: "Control Mode",
                submenu: submenu
            });
            menu.append(item);
            submenu = new Fudge.remote.Menu();
            // TODO: fix tight coupling here, only retrieve the shortcut from the controller
            for (let mode in this.controller.controlMode.modes) {
                let subitem = new Fudge.remote.MenuItem({ label: mode, id: String(Fudge.CONTEXTMENU.INTERACTION_MODE), click: _callback, accelerator: process.platform == "darwin" ? "Command+" + this.controller.controlMode.modes[mode].shortcut : "ctrl+" + this.controller.controlMode.modes[mode].shortcut });
                //@ts-ignore
                subitem.overrideProperty("interactionMode", mode);
                submenu.append(subitem);
            }
            item = new Fudge.remote.MenuItem({
                label: "Interaction Mode",
                submenu: submenu
            });
            menu.append(item);
            return menu;
        }
        contextMenuCallback(_item, _window, _event) {
            switch (Number(_item.id)) {
                case Fudge.CONTEXTMENU.CONTROL_MODE:
                    // BUG: Sometimes _item does not contain a controlMode property, find out why and fix
                    let controlModeNew = _item["controlMode"];
                    // //@ts-ignore
                    this.controller.setControlMode(controlModeNew);
                    // ƒ.Debug.info(meshNew.type, meshNew);
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.UPDATE, { bubbles: true }));
                    this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
                    break;
                case Fudge.CONTEXTMENU.INTERACTION_MODE:
                    let mode = _item["interactionMode"];
                    this.controller.setInteractionMode(mode);
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.UPDATE, { bubbles: true }));
                    break;
            }
        }
        cleanup() {
            ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.animate);
        }
    }
    Fudge.ViewModellerScene = ViewModellerScene;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒui = FudgeUserInterface;
    class ViewObjectProperties extends Fudge.View {
        constructor(_container, _state) {
            super(_container, _state);
            // this.contextMenu = this.getContextMenu(this.contextMenuCallback);
            this.setObject(_state.node.getChildrenByName("Default")[0]);
            this.fillContent();
            // this.parentPanel.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.setSelectedNode);
            // this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
        }
        setObject(_object) {
            if (!_object)
                return;
            this.currentNode = _object;
        }
        fillContent() {
            this.setTitle(this.currentNode.name);
            let fieldset = ƒui.Generator.createFieldSetFromMutable(this.currentNode.cmpTransform);
            let uiComponent = new Fudge.ControllerComponent(this.currentNode.cmpTransform, fieldset);
            this.dom.append(uiComponent.domElement);
        }
        // protected update = () => {
        // }
        cleanup() {
            throw new Error("Method not implemented.");
        }
    }
    Fudge.ViewObjectProperties = ViewObjectProperties;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒaid = FudgeAid;
    /**
     * Preview a resource
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewPreview extends Fudge.View {
        constructor(_container, _state) {
            super(_container, _state);
            this.hndEvent = (_event) => {
                // console.log(_event.type);
                switch (_event.type) {
                    case "change" /* CHANGE */:
                    case "mutate" /* MUTATE */:
                    case Fudge.EVENT_EDITOR.UPDATE:
                        if (this.resource instanceof ƒ.Audio || this.resource instanceof ƒ.Texture || this.resource instanceof ƒ.Material)
                            this.fillContent();
                        this.redraw();
                        break;
                    default:
                        if (_event.detail.data instanceof Fudge.ScriptInfo)
                            this.resource = _event.detail.data.script;
                        else
                            this.resource = _event.detail.data;
                        this.fillContent();
                        break;
                }
            };
            this.redraw = () => {
                try {
                    this.viewport.draw();
                }
                catch (_error) {
                    //nop
                }
            };
            // create viewport for 3D-resources
            let cmpCamera = new ƒ.ComponentCamera();
            cmpCamera.pivot.translate(new ƒ.Vector3(2, 4, 2));
            cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
            cmpCamera.projectCentral(1, 45);
            let canvas = ƒaid.Canvas.create(true, ƒaid.IMAGE_RENDERING.PIXELATED);
            this.viewport = new ƒ.Viewport();
            this.viewport.initialize("Preview", null, cmpCamera, canvas);
            this.fillContent();
            _container.on("resize", this.redraw);
            this.dom.addEventListener("itemselect" /* SELECT */, this.hndEvent);
            this.dom.addEventListener("mutate" /* MUTATE */, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.UPDATE, this.hndEvent, true);
            // this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
            // this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
            // this.dom.addEventListener(ƒui.EVENT.RENAME, this.hndEvent);
        }
        static createStandardMaterial() {
            let mtrStandard = new ƒ.Material("StandardMaterial", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("white")));
            ƒ.Project.deregister(mtrStandard);
            return mtrStandard;
        }
        static createStandardMesh() {
            let meshStandard = new ƒ.MeshSphere("Sphere", 6, 5);
            ƒ.Project.deregister(meshStandard);
            return meshStandard;
        }
        // #region  ContextMenu
        // protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
        //   const menu: Electron.Menu = new remote.Menu();
        //   let item: Electron.MenuItem;
        //   item = new remote.MenuItem({ label: "Add Component", submenu: [] });
        //   for (let subItem of ContextMenu.getComponents(_callback))
        //     item.submenu.append(subItem);
        //   menu.append(item);
        //   ContextMenu.appendCopyPaste(menu);
        //   return menu;
        // }
        // protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
        //   ƒ.Debug.info(`MenuSelect: Item-id=${CONTEXTMENU[_item.id]}`);
        //   switch (Number(_item.id)) {
        //     case CONTEXTMENU.ADD_COMPONENT:
        //       let iSubclass: number = _item["iSubclass"];
        //       let component: typeof ƒ.Component = ƒ.Component.subclasses[iSubclass];
        //       //@ts-ignore
        //       let cmpNew: ƒ.Component = new component();
        //       ƒ.Debug.info(cmpNew.type, cmpNew);
        //       // this.node.addComponent(cmpNew);
        //       this.dom.dispatchEvent(new CustomEvent(ƒui.EVENT.SELECT, { bubbles: true, detail: { data: this.resource } }));
        //       break;
        //   }
        // }
        //#endregion
        fillContent() {
            this.dom.innerHTML = "";
            if (!this.resource)
                return;
            //@ts-ignore
            let type = this.resource.type || "Function";
            if (this.resource instanceof ƒ.Mesh)
                type = "Mesh";
            // console.log(type);
            let graph;
            let preview;
            switch (type) {
                case "Function":
                    preview = this.createScriptPreview(this.resource);
                    if (preview)
                        this.dom.appendChild(preview);
                    break;
                case "File":
                    preview = this.createFilePreview(this.resource);
                    if (preview)
                        this.dom.appendChild(preview);
                    break;
                case "Mesh":
                    graph = this.createStandardGraph();
                    graph.addComponent(new ƒ.ComponentMesh(this.resource));
                    graph.addComponent(new ƒ.ComponentMaterial(ViewPreview.mtrStandard));
                    this.viewport.draw();
                    break;
                case "Material":
                    graph = this.createStandardGraph();
                    graph.addComponent(new ƒ.ComponentMesh(ViewPreview.meshStandard));
                    graph.addComponent(new ƒ.ComponentMaterial(this.resource));
                    this.viewport.draw();
                    break;
                case "Graph":
                    this.viewport.setGraph(this.resource);
                    this.dom.appendChild(this.viewport.getCanvas());
                    this.viewport.draw();
                    break;
                case "TextureImage":
                    let img = this.resource.image;
                    img.style.border = "1px solid black";
                    this.dom.appendChild(img);
                    break;
                case "Audio":
                    let entry = new Fudge.DirectoryEntry(this.resource.path, "", null, null);
                    this.dom.appendChild(this.createAudioPreview(entry));
                    break;
                default: break;
            }
        }
        createStandardGraph() {
            let graph = new ƒ.Node("PreviewScene");
            ƒaid.addStandardLightComponents(graph);
            this.viewport.setGraph(graph);
            this.dom.appendChild(this.viewport.getCanvas());
            return graph;
        }
        createFilePreview(_entry) {
            let mime = _entry.getMimeType();
            switch (mime) {
                case Fudge.MIME.TEXT: return this.createTextPreview(_entry);
                case Fudge.MIME.AUDIO: return this.createAudioPreview(_entry);
                case Fudge.MIME.IMAGE: return this.createImagePreview(_entry);
            }
            return null;
        }
        createTextPreview(_entry) {
            let pre = document.createElement("pre");
            pre.textContent = _entry.getFileContent();
            return pre;
        }
        createImagePreview(_entry) {
            let img = document.createElement("img");
            img.src = _entry.path;
            img.style.border = "1px solid black";
            return img;
        }
        createAudioPreview(_entry) {
            let audio = document.createElement("audio");
            audio.src = _entry.path;
            audio.play();
            audio.controls = true;
            return audio;
        }
        createScriptPreview(_script) {
            let pre = document.createElement("pre");
            let code = _script.toString();
            code = code.replaceAll("    ", " ");
            pre.textContent = code;
            return pre;
        }
    }
    ViewPreview.mtrStandard = ViewPreview.createStandardMaterial();
    ViewPreview.meshStandard = ViewPreview.createStandardMesh();
    Fudge.ViewPreview = ViewPreview;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    /**
     * View the properties of a resource
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewProperties extends Fudge.View {
        constructor(_container, _state) {
            super(_container, _state);
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "itemselect" /* SELECT */:
                        this.resource = _event.detail.data;
                    default:
                        this.fillContent();
                        break;
                }
            };
            this.fillContent();
            this.dom.addEventListener("itemselect" /* SELECT */, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.UPDATE, this.hndEvent, true);
            // this.dom.addEventListener(EVENT_EDITOR.FOCUS_RESOURCE, this.hndEvent);
            // this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
            // this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
            // this.dom.addEventListener(ƒui.EVENT.RENAME, this.hndEvent);
        }
        //#region  ContextMenu
        // protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
        //   const menu: Electron.Menu = new remote.Menu();
        //   let item: Electron.MenuItem;
        //   item = new remote.MenuItem({ label: "Add Component", submenu: [] });
        //   for (let subItem of ContextMenu.getComponents(_callback))
        //     item.submenu.append(subItem);
        //   menu.append(item);
        //   ContextMenu.appendCopyPaste(menu);
        //   return menu;
        // }
        // protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
        //   ƒ.Debug.info(`MenuSelect: Item-id=${CONTEXTMENU[_item.id]}`);
        //   switch (Number(_item.id)) {
        //     case CONTEXTMENU.ADD_COMPONENT:
        //       let iSubclass: number = _item["iSubclass"];
        //       let component: typeof ƒ.Component = ƒ.Component.subclasses[iSubclass];
        //       //@ts-ignore
        //       let cmpNew: ƒ.Component = new component();
        //       ƒ.Debug.info(cmpNew.type, cmpNew);
        //       // this.node.addComponent(cmpNew);
        //       this.dom.dispatchEvent(new CustomEvent(ƒui.EVENT.SELECT, { bubbles: true, detail: { data: this.resource } }));
        //       break;
        //   }
        // }
        //#endregion
        hndDragOver(_event, _viewSource) {
            // console.log(_event.target, _event.currentTarget);
            // _event.dataTransfer.dropEffect = "link";
            // _event.preventDefault();
            // console.log("DragOver");
        }
        fillContent() {
            while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild))
                ;
            // console.log(this.resource);
            let content = document.createElement("div");
            content.style.whiteSpace = "nowrap";
            if (this.resource) {
                this.setTitle(this.resource.name);
                if (this.resource instanceof ƒ.Mutable) {
                    let fieldset = ƒui.Generator.createFieldSetFromMutable(this.resource);
                    let uiMutable = new Fudge.ControllerComponent(this.resource, fieldset);
                    content = uiMutable.domElement;
                }
                else if (this.resource instanceof Fudge.DirectoryEntry && this.resource.stats) {
                    content.innerHTML += "Size: " + (this.resource.stats["size"] / 1024).toFixed(2) + " KiB<br/>";
                    content.innerHTML += "Created: " + this.resource.stats["birthtime"].toLocaleString() + "<br/>";
                    content.innerHTML += "Modified: " + this.resource.stats["ctime"].toLocaleString() + "<br/>";
                }
                else if (this.resource instanceof ƒ.Graph) {
                    content.innerHTML = this.resource.toHierarchyString();
                }
                else if (this.resource instanceof Fudge.ScriptInfo) {
                    for (let key in this.resource.script) {
                        let value = this.resource.script[key];
                        if (value instanceof Function)
                            value = value.name;
                        if (value instanceof Array)
                            value = "Array(" + value.length + ")";
                        content.innerHTML += key + ": " + value + "<br/>";
                    }
                }
                this.dom.append(content);
            }
        }
    }
    Fudge.ViewProperties = ViewProperties;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    /**
     * List the scripts loaded
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewScript extends Fudge.View {
        constructor(_container, _state) {
            super(_container, _state);
            // #region  ContextMenu
            // protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
            //   const menu: Electron.Menu = new remote.Menu();
            //   return menu;
            // }
            // protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
            //   ƒ.Debug.fudge(`MenuSelect | id: ${CONTEXTMENU[_item.id]} | event: ${_event}`);
            // }
            //#endregion
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case Fudge.EVENT_EDITOR.SET_PROJECT:
                    case Fudge.EVENT_EDITOR.UPDATE:
                        this.listScripts();
                        break;
                    // case ƒui.EVENT.SELECT:
                    //   console.log(_event.detail.data);
                    //   break;
                }
            };
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SET_PROJECT, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.UPDATE, this.hndEvent);
            // this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
        }
        listScripts() {
            while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild))
                ;
            let scriptinfos = [];
            for (let namespace in ƒ.Project.scriptNamespaces) {
                for (let index in ƒ.Project.scriptNamespaces[namespace]) {
                    let script = ƒ.Project.scriptNamespaces[namespace][index];
                    scriptinfos.push(new Fudge.ScriptInfo(script, namespace));
                }
            }
            this.table = new ƒui.Table(new Fudge.ControllerTableScript(), scriptinfos);
            this.dom.appendChild(this.table);
        }
        getSelection() {
            return this.table.controller.selection;
        }
        getDragDropSources() {
            return this.table.controller.dragDrop.sources;
        }
    }
    Fudge.ViewScript = ViewScript;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=Fudge.js.map