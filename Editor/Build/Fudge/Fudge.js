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
        CONTEXTMENU[CONTEXTMENU["EDIT"] = 3] = "EDIT";
        CONTEXTMENU[CONTEXTMENU["CREATE_MESH"] = 4] = "CREATE_MESH";
        CONTEXTMENU[CONTEXTMENU["CREATE_MATERIAL"] = 5] = "CREATE_MATERIAL";
        CONTEXTMENU[CONTEXTMENU["CREATE_GRAPH"] = 6] = "CREATE_GRAPH";
        CONTEXTMENU[CONTEXTMENU["REMOVE_COMPONENT"] = 7] = "REMOVE_COMPONENT";
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
            result = result.replace(/></g, ">\n<");
            // result = result.replaceAll("><", ">\n<");
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
                    FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
                    // pick the graph to show
                    let graph = FudgeCore.Project.resources[_graphId];
                    FudgeCore.Debug.log("Graph:", graph);
                    // setup the viewport
                    let cmpCamera = new FudgeCore.ComponentCamera();
                    let canvas = document.querySelector("canvas");
                    let viewport = new FudgeCore.Viewport();
                    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
                    FudgeCore.Debug.log("Viewport:", viewport);
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
                    FudgeCore.Debug.log("Audio:", FudgeCore.AudioManager.default);
                    // draw viewport once for immediate feedback
                    viewport.draw();
                    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
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
                Fudge.saveProject();
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
                Page.add(Fudge.PanelProject, "Project", null); //Object.create(null,  {node: { writable: true, value: node }}));
            });
            Fudge.ipcRenderer.on(Fudge.MENU.PANEL_ANIMATION_OPEN, (_event, _args) => {
                //   let panel: Panel = PanelManager.instance.createPanelFromTemplate(new ViewAnimationTemplate(), "Animation Panel");
                //   PanelManager.instance.addPanel(panel);
            });
        }
    }
    Page.idCounter = 0;
    Page.panels = [];
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
            this.dom.addEventListener("delete" /* DELETE */, this.hndEvent);
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
            item = new Fudge.remote.MenuItem({ label: "Create Graph", id: String(Fudge.CONTEXTMENU.CREATE_GRAPH), click: _callback, accelerator: "G" });
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
    var ƒUi = FudgeUserInterface;
    let filter = {
        UrlOnTexture: { fromViews: [Fudge.ViewExternal], onKeyAttribute: "url", onTypeAttribute: "TextureImage", ofType: Fudge.DirectoryEntry, dropEffect: "link" },
        UrlOnAudio: { fromViews: [Fudge.ViewExternal], onKeyAttribute: "url", onTypeAttribute: "Audio", ofType: Fudge.DirectoryEntry, dropEffect: "link" },
        MaterialOnComponentMaterial: { fromViews: [Fudge.ViewInternal], onTypeAttribute: "Material", onType: ƒ.ComponentMaterial, ofType: ƒ.Material, dropEffect: "link" },
        MeshOnComponentMesh: { fromViews: [Fudge.ViewInternal], onType: ƒ.ComponentMesh, ofType: ƒ.Mesh, dropEffect: "link" },
        MeshOnMeshLabel: { fromViews: [Fudge.ViewInternal], onKeyAttribute: "mesh", ofType: ƒ.Mesh, dropEffect: "link" },
        TextureOnMaterial: { fromViews: [Fudge.ViewInternal], onType: ƒ.Material, ofType: ƒ.Texture, dropEffect: "link" }
    };
    class ControllerComponent extends ƒUi.Controller {
        constructor(_mutable, _domElement) {
            super(_mutable, _domElement);
            this.hndKey = (_event) => {
                _event.stopPropagation();
                if (_event.code == ƒ.KEYBOARD_CODE.DELETE)
                    this.domElement.dispatchEvent(new CustomEvent("delete" /* DELETE */, { bubbles: true, detail: this }));
            };
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
            this.domElement.addEventListener("input" /* INPUT */, this.mutateOnInput); // this should be obsolete
            this.domElement.addEventListener("dragover" /* DRAG_OVER */, this.hndDragOver);
            this.domElement.addEventListener("drop" /* DROP */, this.hndDrop);
            this.domElement.addEventListener("keydown" /* KEY_DOWN */, this.hndKey);
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
        copy(_originals) { return null; }
        delete(_focussed) {
            return null;
        }
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
                this.isComponent = this.isComponent || (chain.name == "Component");
                this.isComponentScript = this.isComponentScript || (chain.name == "ComponentScript");
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
    class ControllerTreeHierarchy extends ƒUi.TreeController {
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
    Fudge.ControllerTreeHierarchy = ControllerTreeHierarchy;
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
        setGraph(_graph) {
            this.graph = _graph;
        }
        getNode() {
            return this.graph;
        }
    }
    Fudge.PanelGraph = PanelGraph;
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
    var ƒUi = FudgeUserInterface;
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
                    case "delete" /* DELETE */:
                        let component = _event.detail.mutable;
                        this.node.removeComponent(component);
                        this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.UPDATE, { bubbles: true }));
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
            // this.dom.addEventListener(ƒUi.EVENT.RENAME, this.hndEvent);
            this.dom.addEventListener("delete" /* DELETE */, this.hndEvent);
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
            // ContextMenu.appendCopyPaste(menu);
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
                        let details = ƒUi.Generator.createDetailsFromMutable(nodeComponent);
                        let controller = new Fudge.ControllerComponent(nodeComponent, details);
                        details.expand(this.expanded[nodeComponent.type]);
                        this.dom.append(controller.domElement);
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
    var ƒUi = FudgeUserInterface;
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
                switch (_event.type) {
                    case "delete" /* DELETE */:
                        this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.UPDATE, { bubbles: true }));
                        break;
                    default:
                        this.setGraph(_event.detail);
                }
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
            this.tree = new ƒUi.Tree(new Fudge.ControllerTreeHierarchy(), this.graph);
            // this.listController.listRoot.addEventListener(ƒui.EVENT.SELECT, this.passEventToPanel);
            //TODO: examine if tree should fire common UI-EVENT for selection instead
            // this.tree.addEventListener(ƒui.EVENT.SELECT, this.passEventToPanel);
            this.tree.addEventListener("delete" /* DELETE */, this.hndEvent);
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
            }
        }
    }
    Fudge.ViewHierarchy = ViewHierarchy;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
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
                    case "delete" /* DELETE */:
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
            this.dom.addEventListener("delete" /* DELETE */, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SET_GRAPH, this.hndEvent);
        }
        createUserInterface() {
            let cmpCamera = new ƒ.ComponentCamera();
            // cmpCamera.pivot.translate(new ƒ.Vector3(3, 2, 1));
            // cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
            cmpCamera.projectCentral(1, 45);
            this.canvas = ƒAid.Canvas.create(true, ƒAid.IMAGE_RENDERING.PIXELATED);
            let container = document.createElement("div");
            container.style.borderWidth = "0px";
            document.body.appendChild(this.canvas);
            this.viewport = new ƒ.Viewport();
            this.viewport.initialize("ViewNode_Viewport", this.graph, cmpCamera, this.canvas);
            FudgeAid.Viewport.expandCameraToInteractiveOrbit(this.viewport, false);
            this.viewport.draw();
            this.dom.append(this.canvas);
            // ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL);
            // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);
            //Focus cameracontrols on new viewport
            // let event: CustomEvent = new CustomEvent(EVENT_EDITOR.ACTIVATE_VIEWPORT, { detail: this.viewport.camera, bubbles: false });
            this.canvas.addEventListener("click" /* CLICK */, this.activeViewport);
        }
        setGraph(_node) {
            if (!_node)
                return;
            this.graph = _node;
            this.viewport.setBranch(this.graph);
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
    var ƒAid = FudgeAid;
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
                        this.resetCamera();
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
            // cmpCamera.pivot.translate(new ƒ.Vector3(1, 2, 1));
            // cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
            cmpCamera.projectCentral(1, 45);
            let canvas = ƒAid.Canvas.create(true, ƒAid.IMAGE_RENDERING.PIXELATED);
            this.viewport = new ƒ.Viewport();
            this.viewport.initialize("Preview", null, cmpCamera, canvas);
            this.cmrOrbit = ƒAid.Viewport.expandCameraToInteractiveOrbit(this.viewport, false);
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
                    this.redraw();
                    break;
                case "Material":
                    graph = this.createStandardGraph();
                    graph.addComponent(new ƒ.ComponentMesh(ViewPreview.meshStandard));
                    graph.addComponent(new ƒ.ComponentMaterial(this.resource));
                    this.redraw();
                    break;
                case "Graph":
                    this.viewport.setBranch(this.resource);
                    this.dom.appendChild(this.viewport.getCanvas());
                    this.redraw();
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
            ƒAid.addStandardLightComponents(graph);
            this.viewport.setBranch(graph);
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
        resetCamera() {
            this.cmrOrbit.rotationX = -30;
            this.cmrOrbit.rotationY = 30;
            this.cmrOrbit.distance = 3;
            ƒ.Render.prepare(this.cmrOrbit);
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
                    let fieldset = ƒui.Generator.createDetailsFromMutable(this.resource);
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