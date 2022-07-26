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
        static getSubclassMenu(_id, _class, _callback) {
            const menu = new Fudge.remote.Menu();
            for (let iSubclass in _class.subclasses) {
                let subclass = _class.subclasses[iSubclass];
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
        CONTEXTMENU[CONTEXTMENU["ACTIVATE_NODE"] = 1] = "ACTIVATE_NODE";
        CONTEXTMENU[CONTEXTMENU["DELETE_NODE"] = 2] = "DELETE_NODE";
        CONTEXTMENU[CONTEXTMENU["ADD_COMPONENT"] = 3] = "ADD_COMPONENT";
        CONTEXTMENU[CONTEXTMENU["DELETE_COMPONENT"] = 4] = "DELETE_COMPONENT";
        CONTEXTMENU[CONTEXTMENU["ADD_COMPONENT_SCRIPT"] = 5] = "ADD_COMPONENT_SCRIPT";
        CONTEXTMENU[CONTEXTMENU["EDIT"] = 6] = "EDIT";
        CONTEXTMENU[CONTEXTMENU["CREATE_MESH"] = 7] = "CREATE_MESH";
        CONTEXTMENU[CONTEXTMENU["CREATE_MATERIAL"] = 8] = "CREATE_MATERIAL";
        CONTEXTMENU[CONTEXTMENU["CREATE_GRAPH"] = 9] = "CREATE_GRAPH";
        CONTEXTMENU[CONTEXTMENU["CREATE_ANIMATION"] = 10] = "CREATE_ANIMATION";
        CONTEXTMENU[CONTEXTMENU["CREATE_PARTICLE_EFFECT"] = 11] = "CREATE_PARTICLE_EFFECT";
        CONTEXTMENU[CONTEXTMENU["SYNC_INSTANCES"] = 12] = "SYNC_INSTANCES";
        CONTEXTMENU[CONTEXTMENU["REMOVE_COMPONENT"] = 13] = "REMOVE_COMPONENT";
        CONTEXTMENU[CONTEXTMENU["ADD_JOINT"] = 14] = "ADD_JOINT";
        CONTEXTMENU[CONTEXTMENU["DELETE_RESOURCE"] = 15] = "DELETE_RESOURCE";
        CONTEXTMENU[CONTEXTMENU["ILLUMINATE"] = 16] = "ILLUMINATE";
        CONTEXTMENU[CONTEXTMENU["ADD_PROPERTY"] = 17] = "ADD_PROPERTY";
        CONTEXTMENU[CONTEXTMENU["DELETE_PROPERTY"] = 18] = "DELETE_PROPERTY";
        CONTEXTMENU[CONTEXTMENU["ADD_PARTICLE_PATH"] = 19] = "ADD_PARTICLE_PATH";
        CONTEXTMENU[CONTEXTMENU["ADD_PARTICLE_FUNCTION"] = 20] = "ADD_PARTICLE_FUNCTION";
        CONTEXTMENU[CONTEXTMENU["ADD_PARTICLE_CONSTANT"] = 21] = "ADD_PARTICLE_CONSTANT";
    })(CONTEXTMENU = Fudge.CONTEXTMENU || (Fudge.CONTEXTMENU = {}));
    let MENU;
    (function (MENU) {
        MENU["QUIT"] = "quit";
        MENU["PROJECT_NEW"] = "projectNew";
        MENU["PROJECT_SAVE"] = "projectSave";
        MENU["PROJECT_LOAD"] = "projectLoad";
        MENU["DEVTOOLS_OPEN"] = "devtoolsOpen";
        MENU["PANEL_GRAPH_OPEN"] = "panelGraphOpen";
        MENU["PANEL_ANIMATION_OPEN"] = "panelAnimationOpen";
        MENU["PANEL_PROJECT_OPEN"] = "panelProjectOpen";
        MENU["PANEL_HELP_OPEN"] = "panelHelpOpen";
        MENU["PANEL_PARTICLE_SYSTEM_OPEN"] = "panelParticleSystemOpen";
        MENU["FULLSCREEN"] = "fullscreen";
    })(MENU = Fudge.MENU || (Fudge.MENU = {}));
    let PANEL;
    (function (PANEL) {
        PANEL["GRAPH"] = "PanelGraph";
        PANEL["PROJECT"] = "PanelProject";
        PANEL["HELP"] = "PanelHelp";
        PANEL["ANIMATION"] = "PanelAnimation";
        PANEL["PARTICLE_SYSTEM"] = "PanelParticleSystem";
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
        VIEW["PARTICLE_SYSTEM"] = "ViewParticleSystem";
        // SKETCH = ViewSketch,
        // MESH = ViewMesh,
    })(VIEW = Fudge.VIEW || (Fudge.VIEW = {}));
    let TRANSFORM;
    (function (TRANSFORM) {
        TRANSFORM["TRANSLATE"] = "translate";
        TRANSFORM["ROTATE"] = "rotate";
        TRANSFORM["SCALE"] = "scale";
    })(TRANSFORM = Fudge.TRANSFORM || (Fudge.TRANSFORM = {}));
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
        MIME["MESH"] = "mesh";
        MIME["UNKNOWN"] = "unknown";
    })(MIME = Fudge.MIME || (Fudge.MIME = {}));
    let mime = new Map([
        [MIME.TEXT, ["ts", "json", "html", "htm", "css", "js", "txt"]],
        [MIME.MESH, ["obj"]],
        [MIME.AUDIO, ["mp3", "wav", "ogg"]],
        [MIME.IMAGE, ["png", "jpg", "jpeg", "tif", "tga", "gif"]]
    ]);
    const fs = require("fs");
    const { Dirent, PathLike, renameSync, removeSync, readdirSync, readFileSync, copySync } = require("fs");
    const { basename, dirname, join } = require("path");
    class DirectoryEntry {
        path;
        pathRelative;
        dirent;
        stats;
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
    let EVENT_EDITOR;
    (function (EVENT_EDITOR) {
        EVENT_EDITOR["CREATE"] = "EDITOR_CREATE";
        EVENT_EDITOR["SELECT"] = "EDITOR_SELECT";
        EVENT_EDITOR["MODIFY"] = "EDITOR_MODIFY";
        EVENT_EDITOR["DELETE"] = "EDITOR_DELETE";
        EVENT_EDITOR["CLOSE"] = "EDITOR_CLOSE";
        EVENT_EDITOR["TRANSFORM"] = "EDITOR_TRANSFORM";
        EVENT_EDITOR["FOCUS"] = "EDITOR_FOCUS";
        EVENT_EDITOR["ANIMATE"] = "EDITOR_ANIMATE";
    })(EVENT_EDITOR = Fudge.EVENT_EDITOR || (Fudge.EVENT_EDITOR = {}));
    /**
     * Extension of CustomEvent that supports a detail field with the type EventDetail
     */
    class FudgeEvent extends CustomEvent {
    }
    Fudge.FudgeEvent = FudgeEvent;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    const fs = require("fs");
    var ƒui = FudgeUserInterface;
    async function newProject() {
        let filename = Fudge.remote.dialog.showOpenDialogSync(null, {
            properties: ["openDirectory", "createDirectory"], title: "Select/Create a folder to save the project to. The foldername becomes the name of your project", buttonLabel: "Save Project"
        });
        if (!filename)
            return;
        let base = new URL(new URL("file://" + filename[0]).toString() + "/");
        console.log("Path", base.toString());
        Fudge.project = new Fudge.Project(base);
        await saveProject(true);
        let ƒPath = new URL("../../", location.href);
        console.log(ƒPath);
        fs.copyFileSync(new URL("Editor/Source/Template/.gitignore.txt", ƒPath), new URL(".gitignore", base));
        fs.mkdirSync(new URL("Script/Source", base), { recursive: true });
        fs.mkdirSync(new URL("Script/Source/@types", base), { recursive: true });
        fs.mkdirSync(new URL("Script/Build", base), { recursive: true });
        let copyTemplates = {
            "CustomComponentScript.txt": "Source/CustomComponentScript.ts",
            "Main.txt": "Source/Main.ts",
            "tsconfig.txt": "Source/tsconfig.json",
            "Script.txt": " Build/Script.js"
        };
        copyFiles(copyTemplates, new URL("Editor/Source/Template/", ƒPath), new URL("Script/", base));
        let definition = await fetch("https://JirkaDellOro.github.io/FUDGE/Core/Build/FudgeCore.d.ts");
        fs.writeFileSync(new URL("Script/Source/@types/FudgeCore.d.ts", base), await definition.text());
        await loadProject(new URL(Fudge.project.fileIndex, Fudge.project.base));
    }
    Fudge.newProject = newProject;
    function copyFiles(_list, _srcPath, _destPath) {
        for (let copy in _list) {
            let src = new URL(copy, _srcPath);
            let dest = new URL(_list[copy], _destPath);
            fs.copyFileSync(src, dest);
        }
    }
    async function saveProject(_new = false) {
        if (!Fudge.project)
            return false;
        if (!await Fudge.project.openDialog())
            return false;
        if (Fudge.watcher)
            Fudge.watcher.close();
        let base = Fudge.project.base;
        if (_new) {
            let cssFileName = new URL(Fudge.project.fileStyles, base);
            fs.writeFileSync(cssFileName, Fudge.project.getProjectCSS());
        }
        let html = Fudge.project.getProjectHTML(Fudge.project.name);
        let htmlFileName = new URL(Fudge.project.fileIndex, base);
        fs.writeFileSync(htmlFileName, html);
        let jsonFileName = new URL(Fudge.project.fileInternal, base);
        fs.writeFileSync(jsonFileName, Fudge.project.getProjectJSON());
        watchFolder();
        return true;
    }
    Fudge.saveProject = saveProject;
    async function promptLoadProject() {
        let filenames = Fudge.remote.dialog.showOpenDialogSync(null, {
            title: "Load Project", buttonLabel: "Load Project", properties: ["openFile"],
            filters: [{ name: "HTML-File", extensions: ["html", "htm"] }]
        });
        if (!filenames)
            return null;
        return new URL("file://" + filenames[0]);
    }
    Fudge.promptLoadProject = promptLoadProject;
    async function loadProject(_url) {
        let htmlContent = fs.readFileSync(_url, { encoding: "utf-8" });
        ƒ.Debug.groupCollapsed("File content");
        ƒ.Debug.info(htmlContent);
        ƒ.Debug.groupEnd();
        if (Fudge.watcher)
            Fudge.watcher.close();
        Fudge.project = new Fudge.Project(_url);
        await Fudge.project.load(htmlContent);
        watchFolder();
    }
    Fudge.loadProject = loadProject;
    function watchFolder() {
        let dir = new URL(".", Fudge.project.base);
        Fudge.watcher = fs.watch(dir, { recursive: true }, hndFileChange);
        async function hndFileChange(_event, _url) {
            let filename = _url.toString();
            if (filename == Fudge.project.fileIndex || filename == Fudge.project.fileInternal || filename == Fudge.project.fileScript) {
                Fudge.watcher.close();
                let promise = ƒui.Dialog.prompt(null, false, "Important file change", "Reload project?", "Reload", "Cancel");
                if (await promise) {
                    await loadProject(Fudge.project.base);
                }
                else
                    Fudge.watcher = fs.watch(dir, { recursive: true }, hndFileChange);
                document.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY));
            }
        }
    }
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    class Project extends ƒ.Mutable {
        // public title: string = "NewProject";
        base;
        name;
        fileIndex = "index.html";
        fileInternal = "Internal.json";
        fileScript = "Script/Build/Script.js";
        fileStyles = "styles.css";
        #document;
        includeAutoViewScript = true;
        graphAutoView = "";
        constructor(_base) {
            super();
            this.base = _base;
            this.name = _base.toString().split("/").slice(-2, -1)[0];
            this.fileIndex = _base.toString().split("/").pop() || this.fileIndex;
            ƒ.Project.clear();
        }
        async openDialog() {
            let promise = ƒui.Dialog.prompt(Fudge.project, false, "Review project settings", "Adjust settings and press OK", "OK", "Cancel");
            ƒui.Dialog.dom.addEventListener("change" /* CHANGE */, this.hndChange);
            if (await promise) {
                let mutator = ƒui.Controller.getMutator(this, ƒui.Dialog.dom, this.getMutator());
                this.mutate(mutator);
                return true;
            }
            else
                return false;
        }
        hndChange = (_event) => {
            let mutator = ƒui.Controller.getMutator(this, ƒui.Dialog.dom, this.getMutator());
            console.log(mutator, this);
        };
        async load(htmlContent) {
            ƒ.Physics.activeInstance = new ƒ.Physics();
            const parser = new DOMParser();
            this.#document = parser.parseFromString(htmlContent, "text/html");
            const head = this.#document.querySelector("head");
            //TODO: should old scripts be removed from memory first? How?
            const scripts = head.querySelectorAll("script");
            for (let script of scripts) {
                if (script.getAttribute("editor") == "true") {
                    let url = script.getAttribute("src");
                    ƒ.Debug.fudge("Load script: ", url);
                    await ƒ.Project.loadScript(new URL(url, this.base).toString());
                    console.log("ComponentScripts", ƒ.Project.getComponentScripts());
                    console.log("Script Namespaces", ƒ.Project.scriptNamespaces);
                }
            }
            const resourceLink = head.querySelector("link[type=resources]");
            let resourceFile = resourceLink.getAttribute("src");
            Fudge.project.fileInternal = resourceFile;
            ƒ.Project.baseURL = this.base;
            let reconstruction = await ƒ.Project.loadResources(new URL(resourceFile, this.base).toString());
            ƒ.Debug.groupCollapsed("Deserialized");
            ƒ.Debug.info(reconstruction);
            ƒ.Debug.groupEnd();
            let settings = head.querySelector("meta[type=settings]");
            let projectSettings = settings?.getAttribute("project");
            projectSettings = projectSettings?.replace(/'/g, "\"");
            Fudge.project.mutate(JSON.parse(projectSettings || "{}"));
            let panelInfo = settings?.getAttribute("panels");
            panelInfo = panelInfo?.replace(/'/g, "\"");
            Fudge.Page.setPanelInfo(panelInfo || "[]");
            ƒ.Physics.cleanup(); // remove potential rigidbodies
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
        getProjectHTML(_title) {
            if (!this.#document)
                return this.createProjectHTML(_title);
            this.#document.title = _title;
            let settings = this.#document.head.querySelector("meta[type=settings]");
            settings.setAttribute("autoview", this.graphAutoView);
            settings.setAttribute("project", this.settingsStringify());
            settings.setAttribute("panels", this.panelsStringify());
            let autoViewScript = this.#document.querySelector("script[name=autoView]");
            if (this.includeAutoViewScript) {
                if (!autoViewScript)
                    this.#document.head.appendChild(this.getAutoViewScript());
            }
            else if (autoViewScript)
                this.#document.head.removeChild(autoViewScript);
            return this.stringifyHTML(this.#document);
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.graphAutoView)
                types.graphAutoView = this.getGraphs();
            return types;
        }
        reduceMutator(_mutator) {
            delete _mutator.base;
            delete _mutator.fileIndex;
            delete _mutator.fileInternal;
            delete _mutator.fileScript;
            delete _mutator.fileStyles;
        }
        getGraphs() {
            let graphs = ƒ.Project.getResourcesByType(ƒ.Graph);
            let result = {};
            for (let graph of graphs) {
                result[graph.name] = graph.idResource;
            }
            return result;
        }
        createProjectHTML(_title) {
            let html = document.implementation.createHTMLDocument(_title);
            html.head.appendChild(createTag("meta", { charset: "utf-8" }));
            html.head.appendChild(createTag("link", { rel: "stylesheet", href: this.fileStyles }));
            html.head.appendChild(html.createComment("CRLF"));
            html.head.appendChild(html.createComment("Editor settings of this project"));
            html.head.appendChild(createTag("meta", {
                type: "settings", autoview: this.graphAutoView, project: this.settingsStringify(), panels: this.panelsStringify()
            }));
            html.head.appendChild(html.createComment("CRLF"));
            html.head.appendChild(html.createComment("Activate the following line to include the FUDGE-version of Oimo-Physics. You may want to download a local copy to work offline and be independent from future changes!"));
            html.head.appendChild(html.createComment(`<script type="text/javascript" src="../../../Physics/OimoPhysics.js"></script>`));
            html.head.appendChild(html.createComment("CRLF"));
            html.head.appendChild(html.createComment("Load FUDGE. You may want to download local copies to work offline and be independent from future changes! Developers working on FUDGE itself may want to create symlinks"));
            html.head.appendChild(createTag("script", { type: "text/javascript", src: "https://jirkadelloro.github.io/FUDGE/Core/Build/FudgeCore.js" }));
            html.head.appendChild(createTag("script", { type: "text/javascript", src: "https://jirkadelloro.github.io/FUDGE/Aid/Build/FudgeAid.js" }));
            html.head.appendChild(html.createComment("CRLF"));
            html.head.appendChild(html.createComment("Link internal resources. The editor only loads the first, but at runtime, multiple files can contribute"));
            html.head.appendChild(createTag("link", { type: "resources", src: this.fileInternal }));
            html.head.appendChild(html.createComment("CRLF"));
            html.head.appendChild(html.createComment("Load custom scripts"));
            html.head.appendChild(createTag("script", { type: "text/javascript", src: this.fileScript, editor: "true" }));
            html.head.appendChild(html.createComment("CRLF"));
            if (this.includeAutoViewScript)
                html.head.appendChild(this.getAutoViewScript());
            html.body.appendChild(html.createComment("Dialog shown at startup only"));
            let dialog = createTag("dialog");
            dialog.appendChild(createTag("h1", {}, "Title (will be replaced by autoView)"));
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
            return this.stringifyHTML(html);
        }
        getAutoViewScript() {
            let code;
            code = (function (_graphId) {
                /**
                 * AutoView-Script
                 * Loads and displays the selected graph and implements a basic orbit camera
                 * @author Jirka Dell'Oro-Friedl, HFU, 2021
                 */
                window.addEventListener("load", init);
                // show dialog for startup
                let dialog;
                function init(_event) {
                    dialog = document.querySelector("dialog");
                    dialog.querySelector("h1").textContent = document.title;
                    dialog.addEventListener("click", function (_event) {
                        // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
                        dialog.close();
                        startInteractiveViewport();
                    });
                    //@ts-ignore
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
                    if (!graph) {
                        alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
                        return;
                    }
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
                    cmpCamera.node.addComponent(cmpListener);
                    FudgeCore.AudioManager.default.listenWith(cmpListener);
                    FudgeCore.AudioManager.default.listenTo(graph);
                    FudgeCore.Debug.log("Audio:", FudgeCore.AudioManager.default);
                    // draw viewport once for immediate feedback
                    viewport.draw();
                    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
                }
            }).toString();
            code = "(" + code + `)(document.head.querySelector("meta[autoView]").getAttribute("autoView"));\n`;
            let script = document.createElement("script");
            script.setAttribute("name", "autoView");
            script.textContent = code;
            return script;
        }
        settingsStringify() {
            let settings = JSON.stringify(Fudge.project.getMutator());
            settings = settings.replace(/"/g, "'");
            return settings;
        }
        panelsStringify() {
            let panels = Fudge.Page.getPanelInfo();
            panels = panels.replace(/"/g, "'");
            return panels;
        }
        stringifyHTML(_html) {
            let result = (new XMLSerializer()).serializeToString(_html);
            result = result.replace(/></g, ">\n<");
            result = result.replace(/<!--CRLF-->/g, "");
            result = result.replace(/">\n<\/script/g, `"></script`);
            return result;
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
    Fudge.ipcRenderer = require("electron").ipcRenderer; // Replace with:
    Fudge.remote = require("electron").remote;
    /**
     * The uppermost container for all panels controlling data flow between.
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class Page {
        static goldenLayoutModule = globalThis.goldenLayout; // ƒ.General is synonym for any... hack to get GoldenLayout to work
        static modeTransform = Fudge.TRANSFORM.TRANSLATE;
        static idCounter = 0;
        static goldenLayout;
        static panels = [];
        static physics = {};
        static setDefaultProject() {
            if (Fudge.project)
                localStorage.setItem("project", Fudge.project.base.toString());
        }
        static getPanelInfo() {
            let panelInfos = [];
            for (let panel of Page.panels)
                panelInfos.push({ type: panel.constructor.name, state: panel.getState() });
            return JSON.stringify(panelInfos);
        }
        static setPanelInfo(_panelInfos) {
            Page.goldenLayout.clear();
            Page.panels = [];
            let panelInfos = JSON.parse(_panelInfos);
            for (let panelInfo of panelInfos)
                Page.add(Fudge[panelInfo.type], panelInfo.state);
        }
        static setTransform(_mode) {
            Page.modeTransform = _mode;
            ƒ.Debug.fudge(`Transform mode: ${_mode}`);
        }
        static getPhysics(_graph) {
            return Page.physics[_graph.idResource] || (Page.physics[_graph.idResource] = new ƒ.Physics());
        }
        // called by windows load-listener
        static async start() {
            // ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL | ƒ.DEBUG_FILTER.SOURCE);
            console.log("LocalStorage", localStorage);
            Page.setupGoldenLayout();
            ƒ.Project.mode = ƒ.MODE.EDITOR;
            Page.setupMainListeners();
            Page.setupPageListeners();
            // for testing:
            // ipcRenderer.emit(MENU.PANEL_PROJECT_OPEN);
            // ipcRenderer.emit(MENU.PANEL_GRAPH_OPEN);
            // ipcRenderer.emit(MENU.PROJECT_LOAD);
            Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PROJECT_SAVE, on: false });
            Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_PROJECT_OPEN, on: false });
            Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_GRAPH_OPEN, on: false });
            Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_HELP_OPEN, on: true });
            if (localStorage.project) {
                console.log("Load project referenced in local storage", localStorage.project);
                await Page.loadProject(new URL(localStorage.project));
            }
        }
        static setupGoldenLayout() {
            Page.goldenLayout = new Page.goldenLayoutModule.GoldenLayout(); // GoldenLayout 2 as UMD-Module
            Page.goldenLayout.on("itemCreated", Page.hndPanelCreated);
            Page.goldenLayout.registerComponentConstructor(Fudge.PANEL.PROJECT, Fudge.PanelProject);
            Page.goldenLayout.registerComponentConstructor(Fudge.PANEL.GRAPH, Fudge.PanelGraph);
            Page.goldenLayout.registerComponentConstructor(Fudge.PANEL.HELP, Fudge.PanelHelp);
            Page.goldenLayout.registerComponentConstructor(Fudge.PANEL.ANIMATION, Fudge.PanelAnimation);
            Page.goldenLayout.registerComponentConstructor(Fudge.PANEL.PARTICLE_SYSTEM, Fudge.PanelParticleSystem);
            Page.loadLayout();
        }
        static add(_panel, _state) {
            const panelConfig = {
                type: "row",
                content: [
                    {
                        type: "component",
                        componentType: _panel.name,
                        componentState: _state,
                        title: "Panel",
                        id: Page.generateID(_panel.name)
                    }
                ]
            };
            if (!Page.goldenLayout.rootItem) // workaround because golden Layout loses rootItem...
                Page.loadLayout(); // TODO: these two lines appear to be obsolete, the condition is not met
            Page.goldenLayout.rootItem.layoutManager.addItemAtLocation(panelConfig, [{ typeId: 7 /* Root */ }]);
        }
        static find(_type) {
            let result = [];
            result = Page.panels.filter((_panel) => { return _panel instanceof _type; });
            return result;
        }
        static generateID(_name) {
            return _name + Page.idCounter++;
        }
        static loadLayout() {
            let config = {
                settings: { showPopoutIcon: false, showMaximiseIcon: true },
                root: {
                    type: "row",
                    isClosable: false,
                    content: []
                }
            };
            Page.goldenLayout.loadLayout(config);
        }
        //#region Page-Events from DOM
        static setupPageListeners() {
            document.addEventListener(Fudge.EVENT_EDITOR.SELECT, Page.hndEvent);
            document.addEventListener("mutate" /* MUTATE */, Page.hndEvent);
            document.addEventListener(Fudge.EVENT_EDITOR.CLOSE, Page.hndEvent);
            document.addEventListener(Fudge.EVENT_EDITOR.FOCUS, Page.hndEvent);
            document.addEventListener(Fudge.EVENT_EDITOR.ANIMATE, Page.hndEvent);
            document.addEventListener("keyup", Page.hndKey);
        }
        /** Send custom copies of the given event to the views */
        static broadcastEvent(_event) {
            for (let panel of Page.panels)
                panel.dispatch(_event.type, { detail: _event.detail });
        }
        static hndKey = (_event) => {
            document.exitPointerLock();
            switch (_event.code) {
                case ƒ.KEYBOARD_CODE.T:
                    Page.setTransform(Fudge.TRANSFORM.TRANSLATE);
                    break;
                case ƒ.KEYBOARD_CODE.R:
                    Page.setTransform(Fudge.TRANSFORM.ROTATE);
                    break;
                case ƒ.KEYBOARD_CODE.E:
                    // TODO: don't switch to scale mode when using fly-camera and pressing E
                    Page.setTransform(Fudge.TRANSFORM.SCALE);
                    break;
            }
        };
        static hndEvent(_event) {
            switch (_event.type) {
                case Fudge.EVENT_EDITOR.CLOSE:
                    let view = _event.detail.view;
                    if (view instanceof Fudge.Panel)
                        Page.panels.splice(Page.panels.indexOf(view), 1);
                    console.log("Panels", Page.panels);
                    break;
                default:
                    Page.broadcastEvent(_event);
                    break;
            }
        }
        //#endregion
        static hndPanelCreated = (_event) => {
            let target = _event.target;
            if (target instanceof Page.goldenLayoutModule.ComponentItem) {
                Page.panels.push(target.component);
            }
        };
        static async loadProject(_url) {
            await Fudge.loadProject(_url);
            Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PROJECT_SAVE, on: true });
            Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_PROJECT_OPEN, on: true });
            Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_GRAPH_OPEN, on: true });
            Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_ANIMATION_OPEN, on: true });
            Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_PARTICLE_SYSTEM_OPEN, on: true });
        }
        //#region Main-Events from Electron
        static setupMainListeners() {
            Fudge.ipcRenderer.on(Fudge.MENU.PROJECT_NEW, async (_event, _args) => {
                ƒ.Project.clear();
                await Fudge.newProject();
                Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PROJECT_SAVE, on: true });
                Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_PROJECT_OPEN, on: true });
                Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_GRAPH_OPEN, on: true });
                Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_ANIMATION_OPEN, on: true });
                Fudge.ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_PARTICLE_SYSTEM_OPEN, on: true });
            });
            Fudge.ipcRenderer.on(Fudge.MENU.PROJECT_SAVE, async (_event, _args) => {
                if (await Fudge.saveProject())
                    Page.setDefaultProject();
            });
            Fudge.ipcRenderer.on(Fudge.MENU.PROJECT_LOAD, async (_event, _args) => {
                let url = await Fudge.promptLoadProject();
                if (!url)
                    return;
                await Page.loadProject(url);
            });
            Fudge.ipcRenderer.on(Fudge.MENU.PANEL_GRAPH_OPEN, (_event, _args) => {
                Page.add(Fudge.PanelGraph, null);
            });
            Fudge.ipcRenderer.on(Fudge.MENU.PANEL_PROJECT_OPEN, (_event, _args) => {
                Page.add(Fudge.PanelProject, null);
            });
            Fudge.ipcRenderer.on(Fudge.MENU.PANEL_HELP_OPEN, (_event, _args) => {
                Page.add(Fudge.PanelHelp, null);
            });
            Fudge.ipcRenderer.on(Fudge.MENU.QUIT, (_event, _args) => {
                Page.setDefaultProject();
            });
            Fudge.ipcRenderer.on(Fudge.MENU.PANEL_ANIMATION_OPEN, (_event, _args) => {
                Page.add(Fudge.PanelAnimation, null);
                // let panel: Panel = PanelManager.instance.createPanelFromTemplate(new ViewAnimationTemplate(), "Animation Panel");
                // PanelManager.instance.addPanel(panel);
            });
            Fudge.ipcRenderer.on(Fudge.MENU.PANEL_PARTICLE_SYSTEM_OPEN, (_event, _args) => {
                Page.add(Fudge.PanelParticleSystem, null);
                // let panel: Panel = PanelManager.instance.createPanelFromTemplate(new ViewAnimationTemplate(), "Animation Panel");
                // PanelManager.instance.addPanel(panel);
            });
        }
    }
    Fudge.Page = Page;
    // function welcome(container: GoldenLayout.Container, state: Object): void {
    //   container.getElement().html("<div>Welcome</div>");
    // }
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒui = FudgeUserInterface;
    class AnimationList {
        listRoot;
        mutator;
        index;
        constructor(_mutator, _listContainer) {
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
        collectMutator = () => {
            let children = this.listRoot.children;
            // for (let child of children) {
            //   this.mutator[(<ƒui.CollapsableAnimationList>child).name] = (<ƒui.CollapsableAnimationList>child).mutator;
            // }
            ƒ.Debug.info(this.mutator);
            return this.mutator;
        };
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
            // let listRoot: HTMLUListElement = document.createElement("ul");
            // for (let key in _mutator) {
            //   let listElement: ƒui.CollapsableAnimationList = new ƒui.CollapsableAnimationList((<ƒ.Mutator>this.mutator[key]), key);
            //   listRoot.append(listElement);
            //   this.index[key] = listElement.getElementIndex();
            //   console.log(this.index);
            // }
            let listRoot = ƒui.Generator.createInterfaceFromMutator(_mutator);
            // let controller = ƒui.Controller
            console.log(_mutator);
            console.log(listRoot);
            this.index = _mutator;
            // for (let key in _mutator) {
            // this.index[key] = document.createElement("input");
            // let listElement: ƒui.CollapsableAnimationList = new ƒui.CollapsableAnimationList((<ƒ.Mutator>this.mutator[key]), key);
            // listRoot.append(listElement);
            // console.log(this.index);
            // }
            return listRoot;
        }
        // private buildContent(_mutator: ƒ.Mutator, listRoot: HTMLDivElement): ƒ.Mutator {
        //   for (let key in _mutator) {
        //     if (typeof _mutator[key] == "object") {
        //         // let newList: CollapsableAnimationListElement = new CollapsableAnimationListElement(<ƒ.Mutator>_mutator[key], key);
        //         // this.content.append(newList);
        //         this.index[key] = buildContent(_mutator[key], listRoot.getElementsByClassName());
        //     }
        //     else {
        //         let listEntry: HTMLLIElement = document.createElement("li");
        //         UIGenerator.createLabelElement(key, listEntry);
        //         let inputEntry: HTMLSpanElement = UIGenerator.createStepperElement(key, listEntry, { _value: (<number>_mutator[key]) });
        //         this.content.append(listEntry);
        //         this.index[key] = inputEntry;
        //     }
        //   }
        // }
        toggleCollapse = (_event) => {
            _event.preventDefault();
            // console.log(_event.target instanceof ƒui.CollapsableAnimationList);
            // if (_event.target instanceof ƒui.CollapsableAnimationList) {
            //   let target: ƒui.CollapsableAnimationList = <ƒui.CollapsableAnimationList>_event.target;
            //   target.collapse(target);
            // }
        };
    }
    Fudge.AnimationList = AnimationList;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    class ControllerAnimation {
        static PROPERTY_COLORS = [
            "Red",
            "Lime",
            "Blue",
            "Cyan",
            "Magenta",
            "Yellow",
            "Salmon",
            "LightGreen",
            "CornflowerBlue"
        ];
        animation;
        propertyList;
        constructor(_animation, _domElement) {
            this.animation = _animation;
            this.propertyList = _domElement;
        }
        updatePropertyList(_mutator) {
            let colorIndex = 0;
            updatePropertyListRecursive(this.propertyList, _mutator, this.animation.animationStructure);
            function updatePropertyListRecursive(_propertyList, _mutator, _animationStructure) {
                for (const key in _mutator) {
                    let element = ƒui.Controller.findChildElementByKey(_propertyList, key);
                    if (!element)
                        continue;
                    let value = _mutator[key];
                    let structureOrSequence = _animationStructure[key];
                    if (element instanceof ƒui.CustomElement && element != document.activeElement) {
                        element.style.setProperty("--color-animation-property", getNextColor());
                        element.setMutatorValue(value);
                        Object.defineProperty(element, "animationSequence", { value: structureOrSequence });
                    }
                    else {
                        updatePropertyListRecursive(element, value, structureOrSequence);
                    }
                }
            }
            function getNextColor() {
                let color = ControllerAnimation.PROPERTY_COLORS[colorIndex];
                colorIndex = (colorIndex + 1) % ControllerAnimation.PROPERTY_COLORS.length;
                return color;
            }
        }
        // modify or add
        modifyKey(_time, _element) {
            let sequence = _element["animationSequence"];
            if (!sequence)
                return;
            let key;
            for (let i = 0; i < sequence.length; i++) {
                if (sequence.getKey(i).Time == _time)
                    key = sequence.getKey(i);
            }
            if (!key)
                sequence.addKey(new ƒ.AnimationKey(_time, _element.getMutatorValue()));
            else
                key.Value = _element.getMutatorValue();
        }
        deleteKey(_key) {
            let animationSequence = _key.sequence.sequence;
            animationSequence.removeKey(_key.key);
        }
        addPath(_path) {
            let value = this.animation.animationStructure;
            for (let i = 0; i < _path.length - 1; i++) {
                let key = _path[i];
                if (!(key in value))
                    value[key] = {};
                value = value[_path[i]];
            }
            value[_path[_path.length - 1]] = new ƒ.AnimationSequence();
        }
        deletePath(_path) {
            let value = this.animation.animationStructure;
            for (let i = 0; i < _path.length - 1; i++)
                value = value[_path[i]];
            delete value[_path[_path.length - 1]];
            deleteEmptyPathsRecursive(this.animation.animationStructure);
            function deleteEmptyPathsRecursive(_object) {
                for (const key in _object) {
                    if (_object[key] instanceof ƒ.AnimationSequence)
                        continue;
                    let value = deleteEmptyPathsRecursive(_object[key]);
                    if (Object.keys(value).length == 0) {
                        delete _object[key];
                    }
                    else {
                        _object[key] = value;
                    }
                }
                return _object;
            }
        }
        getOpenSequences() {
            let sequences = [];
            collectOpenSequencesRecursive(this.propertyList, this.animation.animationStructure, sequences);
            return sequences;
            function collectOpenSequencesRecursive(_propertyList, _animationStructure, _sequences) {
                for (const key in _animationStructure) {
                    let element = ƒui.Controller.findChildElementByKey(_propertyList, key);
                    if (element == null || (element instanceof ƒui.Details && !element.open))
                        continue;
                    let sequence = _animationStructure[key];
                    if (sequence instanceof ƒ.AnimationSequence) {
                        _sequences.push({
                            color: element.style.getPropertyValue("--color-animation-property"),
                            sequence: sequence
                        });
                    }
                    else {
                        collectOpenSequencesRecursive(element, _animationStructure[key], _sequences);
                    }
                }
            }
        }
        hndKey = (_event) => {
            _event.stopPropagation();
            switch (_event.code) {
                case ƒ.KEYBOARD_CODE.DELETE:
                    this.propertyList.dispatchEvent(new CustomEvent("delete" /* DELETE */, { bubbles: true, detail: this }));
                    break;
            }
        };
    }
    Fudge.ControllerAnimation = ControllerAnimation;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    /**
     * Base class for all [[View]]s to support generic functionality
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class View {
        static views = {};
        static idCount = 0;
        dom;
        contextMenu;
        container;
        id;
        constructor(_container, _state) {
            this.dom = document.createElement("div");
            this.dom.style.height = "100%";
            this.dom.style.overflow = "auto";
            this.dom.setAttribute("view", this.constructor.name);
            //_container.getElement().append(this.dom); //old
            _container.element.appendChild(this.dom);
            this.container = _container;
            this.container.on("destroy", () => this.dispatch(Fudge.EVENT_EDITOR.CLOSE, { detail: { view: this } }));
            // console.log(this.contextMenuCallback);
            this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
            // this.dom.addEventListener(EVENT_EDITOR.SET_PROJECT, this.hndEventCommon);
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
            }, false);
            return View.idCount++;
        }
        setTitle(_title) {
            this.container.setTitle(_title);
        }
        getDragDropSources() {
            return [];
        }
        dispatch(_type, _init) {
            _init.detail = _init.detail || {};
            _init.bubbles = _init.bubbles || false;
            _init.cancelable = _init.cancelable || true;
            _init.detail.view = this;
            this.dom.dispatchEvent(new Fudge.FudgeEvent(_type, _init));
        }
        //#region  ContextMenu
        openContextMenu = (_event) => {
            this.contextMenu.popup();
        };
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
        hndEventCommon = (_event) => {
            // switch (_event.type) {
            //   case EVENT_EDITOR.SET_PROJECT:
            //     this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
            //     break;
            // }
        };
    }
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
        tree;
        constructor(_container, _state) {
            super(_container, _state);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SELECT, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.MODIFY, this.hndEvent);
        }
        setProject() {
            while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild))
                ;
            let path = new URL(".", ƒ.Project.baseURL).pathname;
            if (navigator.platform == "Win32" || navigator.platform == "Win64") {
                path = path.substr(1); // strip leading slash
            }
            let root = Fudge.DirectoryEntry.createRoot(path);
            this.tree = new ƒui.Tree(new Fudge.ControllerTreeDirectory(), root);
            this.dom.appendChild(this.tree);
            this.tree.getItems()[0].expand(true);
            this.dom.title = `Drag & drop external image, audiofile etc. to the "Internal", to create a FUDGE-resource`;
        }
        getSelection() {
            return this.tree.controller.selection;
        }
        getDragDropSources() {
            return this.tree.controller.dragDrop.sources;
        }
        hndEvent = (_event) => {
            this.setProject();
        };
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
        table;
        constructor(_container, _state) {
            super(_container, _state);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SELECT, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.MODIFY, this.hndEvent);
            this.dom.addEventListener("mutate" /* MUTATE */, this.hndEvent);
            this.dom.addEventListener("contextmenu" /* CONTEXTMENU */, this.openContextMenu);
            this.dom.addEventListener("delete" /* DELETE */, this.hndEvent);
            this.dom.addEventListener("removeChild" /* REMOVE_CHILD */, this.hndEvent);
        }
        listResources() {
            while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild))
                ;
            this.table = new ƒui.Table(new Fudge.ControllerTableResource(), Object.values(ƒ.Project.resources), "type");
            this.dom.appendChild(this.table);
            this.dom.title = "● Right click to create new resource.\n● Select or drag resource.";
            this.table.title = `● Select to edit in "Properties"\n●  Drag to "Properties" or "Components" to use if applicable.`;
            for (let tr of this.table.querySelectorAll("tr")) {
                let tds = tr.querySelectorAll("td");
                if (!tds.length)
                    continue;
                tds[1].classList.add("icon");
                tds[1].setAttribute("icon", tds[1].children[0].value);
            }
        }
        getSelection() {
            return this.table.controller.selection;
        }
        getDragDropSources() {
            return this.table.controller.dragDrop.sources;
        }
        // TODO: this is a preparation for syncing a graph with its instances after structural changes
        // protected openContextMenu = (_event: Event): void => {
        //   let row: HTMLTableRowElement = <HTMLTableRowElement>_event.composedPath().find((_element) => (<HTMLElement>_element).tagName == "TR");
        //   if (row)
        //     this.contextMenu.getMenuItemById(String(CONTEXTMENU.SYNC_INSTANCES)).enabled = (row.getAttribute("icon") == "Graph");
        //   this.contextMenu.popup();
        // }
        // #region  ContextMenu
        getContextMenu(_callback) {
            const menu = new Fudge.remote.Menu();
            let item;
            item = new Fudge.remote.MenuItem({
                label: "Create Mesh",
                submenu: Fudge.ContextMenu.getSubclassMenu(Fudge.CONTEXTMENU.CREATE_MESH, ƒ.Mesh, _callback)
            });
            menu.append(item);
            item = new Fudge.remote.MenuItem({
                label: "Create Material",
                submenu: Fudge.ContextMenu.getSubclassMenu(Fudge.CONTEXTMENU.CREATE_MATERIAL, ƒ.Shader, _callback)
            });
            menu.append(item);
            item = new Fudge.remote.MenuItem({ label: "Create Graph", id: String(Fudge.CONTEXTMENU.CREATE_GRAPH), click: _callback, accelerator: "G" });
            menu.append(item);
            item = new Fudge.remote.MenuItem({ label: "Create Animation", id: String(Fudge.CONTEXTMENU.CREATE_ANIMATION), click: _callback });
            menu.append(item);
            item = new Fudge.remote.MenuItem({ label: "Create Particle Effect", id: String(Fudge.CONTEXTMENU.CREATE_PARTICLE_EFFECT), click: _callback });
            menu.append(item);
            item = new Fudge.remote.MenuItem({ label: "Delete Resource", id: String(Fudge.CONTEXTMENU.DELETE_RESOURCE), click: _callback, accelerator: "R" });
            menu.append(item);
            // item = new remote.MenuItem({ label: "Sync Instances", id: String(CONTEXTMENU.SYNC_INSTANCES), click: _callback, accelerator: "S" });
            // menu.append(item);
            // ContextMenu.appendCopyPaste(menu);
            return menu;
        }
        async contextMenuCallback(_item, _window, _event) {
            let choice = Number(_item.id);
            ƒ.Debug.fudge(`MenuSelect | id: ${Fudge.CONTEXTMENU[_item.id]} | event: ${_event}`);
            let iSubclass = _item["iSubclass"];
            if (!iSubclass && (choice == Fudge.CONTEXTMENU.CREATE_MESH || choice == Fudge.CONTEXTMENU.CREATE_MATERIAL)) {
                alert("Funky Electron-Error... please try again");
                return;
            }
            switch (choice) {
                case Fudge.CONTEXTMENU.CREATE_MESH:
                    let typeMesh = ƒ.Mesh.subclasses[iSubclass];
                    //@ts-ignore
                    let meshNew = new typeMesh();
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                    this.table.selectInterval(meshNew, meshNew);
                    break;
                case Fudge.CONTEXTMENU.CREATE_MATERIAL:
                    let typeShader = ƒ.Shader.subclasses[iSubclass];
                    let mtrNew = new ƒ.Material(typeShader.name, typeShader);
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                    this.table.selectInterval(mtrNew, mtrNew);
                    break;
                case Fudge.CONTEXTMENU.CREATE_GRAPH:
                    let graph = await ƒ.Project.registerAsGraph(new ƒ.Node("NewGraph"));
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                    this.table.selectInterval(graph, graph);
                    break;
                case Fudge.CONTEXTMENU.CREATE_ANIMATION:
                    let animationNew = new ƒ.Animation("NewAnimation");
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                    this.table.selectInterval(animationNew, animationNew);
                    break;
                case Fudge.CONTEXTMENU.CREATE_PARTICLE_EFFECT:
                    let particleEffectNew = new ƒ.ParticleEffect("NewParticleEffect");
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                    this.table.selectInterval(particleEffectNew, particleEffectNew);
                    break;
                case Fudge.CONTEXTMENU.DELETE_RESOURCE:
                    await this.table.controller.delete([this.table.getFocussed()]);
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                    break;
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
                    if (source.getMimeType() != Fudge.MIME.AUDIO && source.getMimeType() != Fudge.MIME.IMAGE && source.getMimeType() != Fudge.MIME.MESH)
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
                        case Fudge.MIME.MESH:
                            console.log(new ƒ.MeshObj(null, source.pathRelative));
                            break;
                    }
                }
            }
            this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
        }
        hndEvent = (_event) => {
            switch (_event.type) {
                case Fudge.EVENT_EDITOR.SELECT:
                case Fudge.EVENT_EDITOR.MODIFY:
                    // case ƒui.EVENT.MUTATE:
                    this.listResources();
                    break;
                case "removeChild" /* REMOVE_CHILD */:
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                    break;
            }
        };
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
        UrlOnMeshObj: { fromViews: [Fudge.ViewExternal], onKeyAttribute: "url", onTypeAttribute: "MeshObj", ofType: Fudge.DirectoryEntry, dropEffect: "link" },
        UrlOnAudio: { fromViews: [Fudge.ViewExternal], onKeyAttribute: "url", onTypeAttribute: "Audio", ofType: Fudge.DirectoryEntry, dropEffect: "link" },
        MaterialOnComponentMaterial: { fromViews: [Fudge.ViewInternal], onType: ƒ.ComponentMaterial, ofType: ƒ.Material, dropEffect: "link" },
        MeshOnComponentMesh: { fromViews: [Fudge.ViewInternal], onType: ƒ.ComponentMesh, ofType: ƒ.Mesh, dropEffect: "link" },
        AnimationOnComponentAnimator: { fromViews: [Fudge.ViewInternal], onType: ƒ.ComponentAnimator, ofType: ƒ.Animation, dropEffect: "link" },
        ParticleEffectOnComponentParticleSystem: { fromViews: [Fudge.ViewInternal], onType: ƒ.ComponentParticleSystem, ofType: ƒ.ParticleEffect, dropEffect: "link" },
        // MeshOnMeshLabel: { fromViews: [ViewInternal], onKeyAttribute: "mesh", ofType: ƒ.Mesh, dropEffect: "link" },
        TextureOnMaterial: { fromViews: [Fudge.ViewInternal], onType: ƒ.Material, ofType: ƒ.Texture, dropEffect: "link" },
        TextureOnMeshRelief: { fromViews: [Fudge.ViewInternal], onType: ƒ.MeshRelief, ofType: ƒ.TextureImage, dropEffect: "link" }
    };
    class ControllerComponent extends ƒUi.Controller {
        constructor(_mutable, _domElement) {
            super(_mutable, _domElement);
            this.domElement.addEventListener("input" /* INPUT */, this.mutateOnInput, true); // this should be obsolete
            this.domElement.addEventListener("dragover" /* DRAG_OVER */, this.hndDragOver);
            this.domElement.addEventListener("drop" /* DROP */, this.hndDrop);
            this.domElement.addEventListener("keydown" /* KEY_DOWN */, this.hndKey);
        }
        mutateOnInput = async (_event) => {
            // TODO: move this to Ui.Controller as a general optimization to only mutate what has been changed...!
            this.getMutator = super.getMutator;
            let path = [];
            for (let target of _event.composedPath()) {
                if (target == document)
                    break;
                let key = target.getAttribute("key");
                if (key)
                    path.push(key);
            }
            path.pop();
            path.reverse();
            let mutator = ƒ.Mutable.getMutatorFromPath(this.getMutator(), path);
            this.getMutator = (_mutator, _types) => {
                this.getMutator = super.getMutator; // reset
                return mutator;
            };
        };
        //#endregion
        hndKey = (_event) => {
            _event.stopPropagation();
            switch (_event.code) {
                case ƒ.KEYBOARD_CODE.DELETE:
                    this.domElement.dispatchEvent(new CustomEvent("delete" /* DELETE */, { bubbles: true, detail: this }));
                    break;
            }
        };
        hndDragOver = (_event) => {
            // url on texture
            if (this.filterDragDrop(_event, filter.UrlOnTexture, checkMimeType(Fudge.MIME.IMAGE)))
                return;
            // url on meshobj
            if (this.filterDragDrop(_event, filter.UrlOnMeshObj, checkMimeType(Fudge.MIME.MESH)))
                return;
            // url on audio
            if (this.filterDragDrop(_event, filter.UrlOnAudio, checkMimeType(Fudge.MIME.AUDIO)))
                return;
            // Material on ComponentMaterial
            if (this.filterDragDrop(_event, filter.MaterialOnComponentMaterial))
                return;
            // Mesh on ComponentMesh
            // if (this.filterDragDrop(_event, filter.MeshOnComponentMesh, (_sources: Object[]) => {
            //   let key: string = this.getAncestorWithType(_event.target).getAttribute("key");
            //   return (key == "mesh");
            // })) return;
            if (this.filterDragDrop(_event, filter.MeshOnComponentMesh))
                return;
            // Mesh on MeshLabel
            // if (this.filterDragDrop(_event, filter.MeshOnMeshLabel)) return;
            // Texture on Material
            if (this.filterDragDrop(_event, filter.TextureOnMaterial))
                return;
            // Texture on MeshRelief
            if (this.filterDragDrop(_event, filter.TextureOnMeshRelief))
                return;
            // Animation of ComponentAnimation
            if (this.filterDragDrop(_event, filter.AnimationOnComponentAnimator))
                return;
            // ParticleEffect of ComponentParticleSystem
            if (this.filterDragDrop(_event, filter.ParticleEffectOnComponentParticleSystem))
                return;
            function checkMimeType(_mime) {
                return (_sources) => {
                    let sources = _sources;
                    return (sources.length == 1 && sources[0].getMimeType() == _mime);
                };
            }
        };
        hndDrop = (_event) => {
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
                this.domElement.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                return true;
            };
            let setMaterial = (_sources) => {
                this.mutable["material"] = _sources[0];
                this.domElement.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                return true;
            };
            let setMesh = (_sources) => {
                this.mutable["mesh"] = _sources[0];
                this.domElement.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                return true;
            };
            let setTexture = (_sources) => {
                this.mutable["coat"]["texture"] = _sources[0];
                this.domElement.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                return true;
            };
            let setHeightMap = (_sources) => {
                // this.mutable["texture"] = _sources[0];
                let mutator = this.mutable.getMutator();
                mutator.texture = _sources[0];
                this.mutable.mutate(mutator);
                this.domElement.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                return true;
            };
            let setAnimation = (_sources) => {
                this.mutable["animation"] = _sources[0];
                this.domElement.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                return true;
            };
            let setParticleEffect = (_sources) => {
                this.mutable["particleEffect"] = _sources[0];
                this.domElement.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                return true;
            };
            // texture
            if (this.filterDragDrop(_event, filter.UrlOnTexture, setExternalLink))
                return;
            // texture
            if (this.filterDragDrop(_event, filter.UrlOnMeshObj, setExternalLink))
                return;
            // audio
            if (this.filterDragDrop(_event, filter.UrlOnAudio, setExternalLink))
                return;
            // Material on ComponentMaterial
            if (this.filterDragDrop(_event, filter.MaterialOnComponentMaterial, setMaterial))
                return;
            // Mesh on ComponentMesh
            if (this.filterDragDrop(_event, filter.MeshOnComponentMesh, setMesh))
                return;
            // Mesh on MeshLabel
            // if (this.filterDragDrop(_event, filter.MeshOnMeshLabel, setMesh)) return;
            // Texture on Material
            if (this.filterDragDrop(_event, filter.TextureOnMaterial, setTexture))
                return;
            // Texture on MeshRelief
            if (this.filterDragDrop(_event, filter.TextureOnMeshRelief, setHeightMap))
                return;
            // Animation on ComponentAnimator
            if (this.filterDragDrop(_event, filter.AnimationOnComponentAnimator, setAnimation))
                return;
            // ParticleEffect on ComponentParticleSystem
            if (this.filterDragDrop(_event, filter.ParticleEffectOnComponentParticleSystem, setParticleEffect))
                return;
        };
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
        static head = ControllerTableResource.getHead();
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
        getLabel(_object) {
            return "";
        }
        rename(_object, _new) {
            return false;
        }
        copy(_originals) { return null; }
        async delete(_focussed) {
            console.log(_focussed, this.selection);
            // this.selection = [];
            let expendables = this.selection.concat([]); //_focussed);
            let serializations = ƒ.Project.serialize();
            let serializationStrings = new Map();
            let usages = {};
            for (let idResource in serializations)
                serializationStrings.set(ƒ.Project.resources[idResource], JSON.stringify(serializations[idResource]));
            for (let expendable of expendables) {
                usages[expendable.idResource] = [];
                for (let resource of serializationStrings.keys())
                    if (resource.idResource != expendable.idResource)
                        if (serializationStrings.get(resource).indexOf(expendable.idResource) > -1)
                            usages[expendable.idResource].push(resource.name + " " + resource.type);
            }
            if (await openDialog()) {
                let deleted = [];
                for (let usage in usages)
                    if (usages[usage].length == 0) { // delete only unused
                        deleted.push(ƒ.Project.resources[usage]);
                        ƒ.Project.deregister(ƒ.Project.resources[usage]);
                    }
                return deleted;
            }
            async function openDialog() {
                let promise = ƒui.Dialog.prompt(usages, true, "Review references, delete dependend resources first if applicable", "To delete unused resources, press OK", "OK", "Cancel");
                if (await promise) {
                    return true;
                }
                else
                    return false;
            }
            return [];
        }
        sort(_data, _key, _direction) {
            function compare(_a, _b) {
                return _direction * (_a[_key] == _b[_key] ? 0 : (_a[_key] > _b[_key] ? 1 : -1));
            }
            _data.sort(compare);
        }
    }
    Fudge.ControllerTableResource = ControllerTableResource;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒui = FudgeUserInterface;
    class ScriptInfo {
        name;
        namespace;
        superClass;
        script;
        isComponent = false;
        isComponentScript = false;
        constructor(_script, _namespace) {
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
        static head = ControllerTableScript.getHead();
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
    Fudge.ControllerTableScript = ControllerTableScript;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒUi = FudgeUserInterface;
    class ControllerTreeDirectory extends ƒUi.TreeController {
        getLabel(_entry) {
            return _entry.name;
        }
        getAttributes(_object) {
            return "";
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
        getAttributes(_node) {
            let attributes = [_node.isActive ? "active" : "inactive"];
            if (_node instanceof ƒ.GraphInstance)
                attributes.push("GraphInstance");
            return attributes.join(" ");
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
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    class ControllerTreeParticleSystem extends ƒui.CustomTreeController {
        parentMap = new Map();
        // private particleEffectRoot: ƒ.Serialization;
        constructor(_particleEffectData) {
            super();
            // this.particleEffectRoot = _particleEffectData;
        }
        createContent(_data) {
            // let path: string[] = _dataAndPath.path;
            let content = document.createElement("form");
            let labelKey = document.createElement("input");
            labelKey.type = "text";
            labelKey.disabled = true;
            labelKey.value = this.parentMap.has(_data) ? this.getKey(_data, this.parentMap.get(_data)) : "root";
            labelKey.id = "key" /* KEY */;
            content.appendChild(labelKey);
            if (ƒ.ParticleEffect.isExpressionData(_data)) {
                if (ƒ.ParticleEffect.isFunctionData(_data)) {
                    let select = document.createElement("select");
                    select.id = "function" /* FUNCTION */;
                    for (let key in ƒ.ParticleClosureFactory.closures) {
                        let entry = document.createElement("option");
                        entry.text = key;
                        entry.value = key;
                        select.add(entry);
                    }
                    select.value = _data.function;
                    content.appendChild(select);
                }
                else {
                    let input = document.createElement("input");
                    input.type = "text";
                    input.disabled = true;
                    input.id = "value" /* VALUE */;
                    if (ƒ.ParticleEffect.isVariableData(_data)) {
                        input.value = _data.name;
                    }
                    else if (ƒ.ParticleEffect.isConstantData(_data)) {
                        input.value = _data.value.toString();
                    }
                    content.appendChild(input);
                }
            }
            return content;
        }
        getAttributes(_data) {
            let attributes = [];
            if (ƒ.ParticleEffect.isFunctionData(_data) && this.getPath(_data).includes("storage"))
                attributes.push("function");
            if (ƒ.ParticleEffect.isVariableData(_data))
                attributes.push("variable");
            return attributes.join(" ");
        }
        rename(_data, _id, _new) {
            let inputAsNumber = Number.parseFloat(_new);
            if (_id == "key" /* KEY */ && Number.isNaN(inputAsNumber) && ƒ.ParticleEffect.isExpressionData(_data)) {
                let parentData = this.parentMap.get(_data);
                if (!ƒ.ParticleEffect.isFunctionData(parentData)) {
                    let key = this.getKey(_data, parentData); // Object.entries(parentData).find(entry => entry[1] == data)[0];
                    if (parentData[_new]) {
                        parentData[key] = parentData[_new];
                    }
                    else {
                        delete parentData[key];
                    }
                    parentData[_new] = _data;
                }
                return;
            }
            if (_id == "function" /* FUNCTION */ && ƒ.ParticleEffect.isFunctionData(_data) && Number.isNaN(inputAsNumber)) {
                _data.function = _new;
                return;
            }
            if (_id == "value" /* VALUE */ && ƒ.ParticleEffect.isVariableData(_data) || ƒ.ParticleEffect.isConstantData(_data)) {
                let input = Number.isNaN(inputAsNumber) ? _new : inputAsNumber;
                _data.type = typeof input == "string" ? "variable" : "constant";
                if (ƒ.ParticleEffect.isVariableData(_data))
                    _data.name = input;
                else if (ƒ.ParticleEffect.isConstantData(_data))
                    _data.value = input;
                return;
            }
        }
        hasChildren(_data) {
            let length = 0;
            if (!ƒ.ParticleEffect.isVariableData(_data) && !ƒ.ParticleEffect.isConstantData(_data))
                length = ƒ.ParticleEffect.isFunctionData(_data) ? _data.parameters.length : Object.keys(_data).length;
            return length > 0;
        }
        getChildren(_data) {
            let children = [];
            if (!ƒ.ParticleEffect.isVariableData(_data) && !ƒ.ParticleEffect.isConstantData(_data)) {
                let subData = ƒ.ParticleEffect.isFunctionData(_data) ? _data.parameters : _data;
                for (const key in subData) {
                    let child = subData[key];
                    children.push(child);
                    this.parentMap.set(subData[key], _data);
                }
            }
            return children;
        }
        delete(_focused) {
            // delete selection independend of focussed item
            let deleted = [];
            let expend = this.selection.length > 0 ? this.selection : _focused;
            for (let data of expend) {
                this.deleteData(data);
                deleted.push(data);
            }
            this.selection.splice(0);
            return deleted;
        }
        addChildren(_children, _target) {
            let move = [];
            let tagetPath = this.getPath(_target);
            if (!_children.every(_data => ƒ.ParticleEffect.isExpressionData(_data)))
                return;
            if (ƒ.ParticleEffect.isFunctionData(_target)) {
                for (let data of _children) {
                    if (!this.getPath(data).every(_key => tagetPath.includes(_key)))
                        move.push(data);
                }
                for (let data of move) {
                    let moveData = data;
                    if (ƒ.ParticleEffect.isExpressionData(moveData)) {
                        this.deleteData(data);
                        _target.parameters.push(moveData);
                    }
                }
            }
            return move;
        }
        async copy(_originalData) {
            let copies = [];
            for (let data of _originalData) {
                let newData = JSON.parse(JSON.stringify(data));
                copies.push({ data: newData, path: [""] });
            }
            return copies;
        }
        getPath(_data) {
            let path = [];
            let parent;
            while (this.parentMap.has(_data)) {
                parent = this.parentMap.get(_data);
                path.unshift(this.getKey(_data, parent));
                _data = parent;
            }
            return path;
        }
        getKey(_data, _parentData) {
            let key;
            if (ƒ.ParticleEffect.isExpressionData(_data) && ƒ.ParticleEffect.isFunctionData(_parentData)) {
                key = _parentData.parameters.indexOf(_data).toString();
            }
            else {
                key = Object.entries(_parentData).find(entry => entry[1] == _data)[0];
            }
            return key;
        }
        deleteData(_data) {
            let parentData = this.parentMap.get(_data);
            let key = this.getKey(_data, parentData);
            if (ƒ.ParticleEffect.isFunctionData(parentData)) {
                parentData.parameters.splice(Number.parseInt(key), 1);
            }
            else {
                delete parentData[key];
            }
            this.parentMap.delete(_data);
        }
    }
    Fudge.ControllerTreeParticleSystem = ControllerTreeParticleSystem;
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
    // extends view vorrübergehend entfernt
    class Panel extends Fudge.View {
        goldenLayout;
        views = [];
        //public dom; // muss vielleicht weg
        constructor(_container, _state) {
            super(_container, _state);
            this.dom.style.width = "100%";
            this.dom.style.overflow = "visible";
            this.dom.removeAttribute("view");
            this.dom.setAttribute("panel", this.constructor.name);
            const config = {
                settings: { showPopoutIcon: false, showMaximiseIcon: false },
                root: {
                    type: "row",
                    isClosable: false,
                    content: []
                }
            };
            this.goldenLayout = new Fudge.Page.goldenLayoutModule.GoldenLayout(this.dom);
            this.goldenLayout.on("stateChanged", () => this.goldenLayout.updateRootSize());
            this.goldenLayout.on("itemCreated", this.addViewComponent);
            this.goldenLayout.loadLayout(config);
        }
        /** Send custom copies of the given event to the views */
        broadcastEvent = (_event) => {
            for (let view of this.views)
                view.dispatch(_event.type, { detail: _event.detail });
        };
        addViewComponent = (_event) => {
            // adjustmens for GoldenLayout 2
            let target = _event.target;
            if (target instanceof Fudge.Page.goldenLayoutModule.ComponentItem) {
                this.views.push(target.component);
            }
        };
    }
    Fudge.Panel = Panel;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * TODO: add
     * @authors Jonas Plotzky, HFU, 2022
     */
    class PanelAnimation extends Fudge.Panel {
        constructor(_container, _state) {
            super(_container, _state);
            this.goldenLayout.registerComponentConstructor(Fudge.VIEW.ANIMATION, Fudge.ViewAnimation);
            const config = {
                type: "row",
                content: [
                    {
                        type: "component",
                        componentType: Fudge.VIEW.ANIMATION,
                        componentState: _state,
                        title: "ANIMATION"
                    }
                ]
            };
            this.goldenLayout.addItemAtLocation(config, [
                { typeId: 7 /* Root */ }
            ]);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SELECT, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.MODIFY, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.FOCUS, this.hndEvent);
            this.setTitle("Animation | ");
        }
        getState() {
            // TODO: iterate over views and collect their states for reconstruction
            return {};
        }
        hndEvent = async (_event) => {
            // switch (_event.type) {
            // }
            this.broadcastEvent(_event);
            _event.stopPropagation();
        };
    }
    Fudge.PanelAnimation = PanelAnimation;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    /**
    * Shows a graph and offers means for manipulation
    * @authors Monika Galkewitsch, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
    */
    class PanelGraph extends Fudge.Panel {
        graph;
        constructor(_container, _state) {
            super(_container, _state);
            this.goldenLayout.registerComponentConstructor(Fudge.VIEW.RENDER, Fudge.ViewRender);
            this.goldenLayout.registerComponentConstructor(Fudge.VIEW.COMPONENTS, Fudge.ViewComponents);
            this.goldenLayout.registerComponentConstructor(Fudge.VIEW.HIERARCHY, Fudge.ViewHierarchy);
            this.setTitle("Graph");
            const config = {
                type: "column",
                content: [{
                        type: "component",
                        componentType: Fudge.VIEW.RENDER,
                        componentState: _state,
                        title: "Render"
                    }, {
                        type: "row",
                        content: [{
                                type: "component",
                                componentType: Fudge.VIEW.HIERARCHY,
                                componentState: _state,
                                title: "Hierarchy"
                            }, {
                                type: "component",
                                componentType: Fudge.VIEW.COMPONENTS,
                                componentState: _state,
                                title: "Components"
                            }]
                    }]
            };
            this.goldenLayout.addItemAtLocation(config, [{ typeId: 7 /* Root */ }]);
            // this.goldenLayout.addItemAtLocation(hierarchyAndComponents, [{ typeId: LayoutManager.LocationSelector.TypeId.Root }]);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SELECT, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.MODIFY, this.hndEvent);
            this.dom.addEventListener("mutate" /* MUTATE */, this.hndEvent);
            this.dom.addEventListener("itemselect" /* SELECT */, this.hndFocusNode);
            this.dom.addEventListener("rename" /* RENAME */, this.broadcastEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.TRANSFORM, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.ANIMATE, this.hndEvent);
            if (_state["graph"])
                ƒ.Project.getResource(_state["graph"]).then((_graph) => {
                    this.dispatch(Fudge.EVENT_EDITOR.SELECT, { detail: { graph: _graph } });
                    // TODO: trace the node saved. The name is not sufficient, path is necessary...
                    // this.dom.dispatchEvent(new CustomEvent(EVENT_EDITOR.FOCUS_NODE, { detail: _graph.findChild }));
                });
        }
        setGraph(_graph) {
            if (_graph) {
                this.setTitle("Graph | " + _graph.name);
                this.graph = _graph;
                return;
            }
            this.setTitle("Graph");
        }
        getState() {
            let state = {};
            if (this.graph) {
                state.graph = this.graph.idResource;
                return state;
            }
            // TODO: iterate over views and collect their states for reconstruction 
        }
        hndEvent = async (_event) => {
            switch (_event.type) {
                case Fudge.EVENT_EDITOR.SELECT:
                    this.setGraph(_event.detail.graph);
                    break;
                case Fudge.EVENT_EDITOR.SELECT:
                case Fudge.EVENT_EDITOR.MODIFY:
                    // TODO: meaningful difference between update and setgraph
                    if (this.graph) {
                        let newGraph = await ƒ.Project.getResource(this.graph.idResource);
                        if (this.graph != newGraph)
                            _event = new Fudge.FudgeEvent(Fudge.EVENT_EDITOR.SELECT, { detail: { graph: newGraph } });
                    }
                    break;
            }
            this.broadcastEvent(_event);
            _event.stopPropagation();
        };
        hndFocusNode = (_event) => {
            let event = new Fudge.FudgeEvent(Fudge.EVENT_EDITOR.FOCUS, { detail: { graph: this.graph, node: _event.detail.data } });
            document.dispatchEvent(event);
            this.broadcastEvent(event);
        };
    }
    Fudge.PanelGraph = PanelGraph;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
    * Shows a help and documentation
    * @authors Jirka Dell'Oro-Friedl, HFU, 2021
    */
    class PanelHelp extends Fudge.Panel {
        constructor(_container, _state) {
            super(_container, _state);
            this.setTitle("Help");
            console.log(this.dom);
            // TODO: iframe sandbox disallows use of scripts, remove or replace with object if necessary
            // this.dom.innerHTML = `<iframe src="Help.html" sandbox></iframe>`;
            this.dom.innerHTML = `<object data="Help.html"></object>`;
            // const config: RowOrColumnItemConfig = {
            //   type: "column",
            //   isClosable: true,
            //   content: [
            //     {
            //       type: "component",
            //       componentType: VIEW.RENDER,
            //       componentState: _state,
            //       title: "Render"
            //     }
            //   ]
            // };
            // this.goldenLayout.addItemAtLocation(config, [{ typeId: LayoutManager.LocationSelector.TypeId.Root }]);
        }
        getState() {
            return {};
        }
    }
    Fudge.PanelHelp = PanelHelp;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * TODO: add
     * @authors Jonas Plotzky, HFU, 2022
     */
    class PanelParticleSystem extends Fudge.Panel {
        constructor(_container, _state) {
            super(_container, _state);
            this.goldenLayout.registerComponentConstructor(Fudge.VIEW.PARTICLE_SYSTEM, Fudge.ViewParticleSystem);
            const config = {
                type: "column",
                content: [{
                        type: "component",
                        componentType: Fudge.VIEW.PARTICLE_SYSTEM,
                        componentState: _state,
                        title: "Particle System"
                    }]
            };
            this.goldenLayout.rootItem.layoutManager.addItemAtLocation(config, [
                { typeId: 7 /* Root */ }
            ]);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.FOCUS, this.hndEvent);
            this.setTitle("Particle System | ");
        }
        getState() {
            // TODO: iterate over views and collect their states for reconstruction
            return {};
        }
        hndEvent = async (_event) => {
            // switch (_event.type) {
            // }
            this.broadcastEvent(_event);
            _event.stopPropagation();
        };
    }
    Fudge.PanelParticleSystem = PanelParticleSystem;
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
            //old registercomponent
            // this.goldenLayout.registerComponent(VIEW.INTERNAL, ViewInternal);
            // this.goldenLayout.registerComponent(VIEW.EXTERNAL, ViewExternal);
            // this.goldenLayout.registerComponent(VIEW.PROPERTIES, ViewProperties);
            // this.goldenLayout.registerComponent(VIEW.PREVIEW, ViewPreview);
            // this.goldenLayout.registerComponent(VIEW.SCRIPT, ViewScript);
            this.goldenLayout.registerComponentConstructor(Fudge.VIEW.INTERNAL, Fudge.ViewInternal);
            this.goldenLayout.registerComponentConstructor(Fudge.VIEW.EXTERNAL, Fudge.ViewExternal);
            this.goldenLayout.registerComponentConstructor(Fudge.VIEW.PROPERTIES, Fudge.ViewProperties);
            this.goldenLayout.registerComponentConstructor(Fudge.VIEW.PREVIEW, Fudge.ViewPreview);
            this.goldenLayout.registerComponentConstructor(Fudge.VIEW.SCRIPT, Fudge.ViewScript);
            let inner = this.goldenLayout.rootItem.contentItems[0];
            const config = {
                type: "column",
                content: [{
                        type: "row",
                        content: [{
                                type: "component",
                                componentType: Fudge.VIEW.PROPERTIES,
                                componentState: _state,
                                title: "Properties"
                            }, {
                                type: "component",
                                componentType: Fudge.VIEW.PREVIEW,
                                componentState: _state,
                                title: "Preview"
                            }]
                    }, {
                        type: "row",
                        content: [{
                                type: "column",
                                content: [{
                                        type: "component",
                                        componentType: Fudge.VIEW.EXTERNAL,
                                        componentState: _state,
                                        title: "External"
                                    }, {
                                        type: "component",
                                        componentType: Fudge.VIEW.SCRIPT,
                                        componentState: _state,
                                        title: "Script"
                                    }]
                            }, {
                                type: "component",
                                componentType: Fudge.VIEW.INTERNAL,
                                componentState: _state,
                                title: "Internal"
                            }]
                    }]
            };
            this.goldenLayout.rootItem.layoutManager.addItemAtLocation(config, [{ typeId: 7 /* Root */ }]);
            // this.dom.addEventListener(EVENT_EDITOR.SET_PROJECT, this.hndEvent);
            this.dom.addEventListener("itemselect" /* SELECT */, this.hndEvent);
            this.dom.addEventListener("mutate" /* MUTATE */, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.MODIFY, this.hndEvent);
            // this.dom.addEventListener(EVENT_EDITOR.REFRES, this.hndEvent);
            this.setTitle("Project | " + Fudge.project.name);
            this.broadcastEvent(new Fudge.FudgeEvent(Fudge.EVENT_EDITOR.SELECT, {}));
        }
        getState() {
            // TODO: iterate over views and collect their states for reconstruction 
            return {};
        }
        hndEvent = (_event) => {
            this.setTitle("Project | " + Fudge.project.name);
            this.broadcastEvent(_event);
        };
    }
    Fudge.PanelProject = PanelProject;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    // const fs: ƒ.General = require("fs");
    class ViewParticleSystem extends Fudge.View {
        graph;
        node;
        cmpParticleSystem;
        particleEffect;
        particleEffectData;
        particleEffectStructure;
        idInterval;
        // private controller: ControllerTreeParticleSystem;
        tree;
        controller;
        canvas;
        crc2;
        constructor(_container, _state) {
            super(_container, _state);
            this.createUserInterface();
            this.setParticleEffect(null);
            _container.on("resize", this.redraw);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.FOCUS, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.MODIFY, this.hndEvent);
        }
        //#region  ContextMenu
        openContextMenu = (_event) => {
            this.contextMenu = this.getCustomContextMenu(this.contextMenuCallback.bind(this));
            this.contextMenu.popup();
        };
        getCustomContextMenu(_callback) {
            const menu = new Fudge.remote.Menu();
            let item;
            let focus = this.tree.getFocussed();
            if (ƒ.ParticleEffect.isFunctionData(focus)) {
                item = new Fudge.remote.MenuItem({ label: "Add Variable/Constant", id: String(Fudge.CONTEXTMENU.ADD_PARTICLE_CONSTANT), click: _callback });
                menu.append(item);
                item = new Fudge.remote.MenuItem({ label: "Add Function", id: String(Fudge.CONTEXTMENU.ADD_PARTICLE_FUNCTION), click: _callback });
                menu.append(item);
            }
            else {
                menu.append(this.getMenuItemFromPath(this.controller.getPath(focus), _callback));
            }
            item = new Fudge.remote.MenuItem({ label: "Delete", id: String(Fudge.CONTEXTMENU.DELETE_NODE), click: _callback, accelerator: "D" });
            menu.append(item);
            return menu;
        }
        contextMenuCallback(_item, _window, _event) {
            ƒ.Debug.info(`MenuSelect: Item-id=${Fudge.CONTEXTMENU[_item.id]}`);
            let focus = this.tree.getFocussed();
            let child;
            switch (Number(_item.id)) {
                case Fudge.CONTEXTMENU.ADD_PARTICLE_PATH:
                    child = {};
                    focus[_item.label] = child;
                    this.tree.findVisible(focus).expand(true);
                    this.tree.findVisible(child).focus();
                    break;
                case Fudge.CONTEXTMENU.ADD_PARTICLE_CONSTANT:
                    child = { type: "constant", value: 0 };
                    let parentLabel = _item["parentLabel"];
                    if (parentLabel)
                        focus[parentLabel] = child;
                    this.tree.findVisible(focus).expand(true);
                    this.tree.findVisible(child).focus();
                    break;
                case Fudge.CONTEXTMENU.ADD_PARTICLE_FUNCTION:
                    child = { type: "constant", value: 0 };
                    let parentLabell = _item["parentLabel"];
                    if (parentLabell)
                        focus[parentLabell] = child;
                    this.tree.findVisible(focus).expand(true);
                    this.tree.findVisible(child).focus();
                    break;
                case Fudge.CONTEXTMENU.DELETE_NODE:
                    if (!focus)
                        return;
                    let remove = this.controller.delete([focus]);
                    this.tree.delete(remove);
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                    break;
            }
        }
        getMenuItemFromPath(_path, _callback) {
            let focus = this.tree.getFocussed();
            let label;
            let options;
            let numberOptions = [];
            const submenu = new Fudge.remote.Menu();
            switch (_path[0]) {
                case "storage":
                    if (_path.length == 1) {
                        label = "Add Storage";
                        options = ["system", "update", "particle"];
                    }
                    else {
                        // TODO: add variable or function
                    }
                    break;
                case "transformations":
                    if (_path.length == 1) {
                        label = "Add Transformation";
                        options = ["local", "world"];
                    }
                    else {
                        // TODO: i dont know
                    }
                    break;
                case "components":
                    if (_path.length == 1) {
                        label = "Add Component";
                        options = [];
                        for (const anyComponent of ƒ.Component.subclasses) {
                            //@ts-ignore
                            this.node.getComponents(anyComponent).forEach((component, index) => {
                                options.push(component.type);
                            });
                        }
                    }
                    else {
                        label = "Add Property";
                        //@ts-ignore
                        let mutator = this.node.getComponent(ƒ.Component.subclasses.find(componentType => componentType.name == _path[1])).getMutatorForAnimation();
                        _path.splice(0, 2);
                        while (_path.length > 0) {
                            mutator = mutator[_path.shift()];
                        }
                        options = Object.keys(mutator).filter(optionLabel => mutator[optionLabel] instanceof Object || typeof mutator[optionLabel] == "number"); // only Object and number are valid
                        numberOptions = options.filter(optionLabel => typeof mutator[optionLabel] == "number");
                    }
                    break;
            }
            options = options.filter(option => !Object.keys(focus).includes(option)); // remove options that are already added
            let item;
            for (const optionLabel of options) {
                if (numberOptions.includes(optionLabel)) {
                    let subsubmenu = new Fudge.remote.Menu();
                    item = new Fudge.remote.MenuItem({ label: "Add Variable/Constant", id: String(Fudge.CONTEXTMENU.ADD_PARTICLE_CONSTANT), click: _callback });
                    subsubmenu.append(item);
                    //@ts-ignore
                    item.overrideProperty("parentLabel", optionLabel);
                    item = new Fudge.remote.MenuItem({ label: "Add Function", id: String(Fudge.CONTEXTMENU.ADD_PARTICLE_FUNCTION), click: _callback });
                    subsubmenu.append(item);
                    //@ts-ignore
                    item.overrideProperty("parentLabel", optionLabel);
                    item = new Fudge.remote.MenuItem({ label: optionLabel, submenu: subsubmenu });
                }
                else {
                    item = new Fudge.remote.MenuItem({ label: optionLabel, id: String(Fudge.CONTEXTMENU.ADD_PARTICLE_PATH), click: _callback });
                }
                submenu.append(item);
            }
            return new Fudge.remote.MenuItem({
                label: label,
                submenu: submenu
            });
        }
        //#endregion
        hndEvent = async (_event) => {
            switch (_event.type) {
                case Fudge.EVENT_EDITOR.FOCUS:
                    this.graph = _event.detail.graph;
                    this.node = _event.detail.node;
                    this.cmpParticleSystem = this.node?.getComponent(ƒ.ComponentParticleSystem);
                    await this.setParticleEffect(this.cmpParticleSystem?.particleEffect);
                    break;
                case Fudge.EVENT_EDITOR.MODIFY:
                case "delete" /* DELETE */:
                case "drop" /* DROP */:
                case "rename" /* RENAME */:
                    this.particleEffect.data = this.particleEffectData;
                    this.cmpParticleSystem.particleEffect = this.particleEffect;
                    break;
            }
        };
        async setParticleEffect(_particleEffect) {
            if (!_particleEffect) {
                this.particleEffect = undefined;
                this.tree = undefined;
                window.clearInterval(this.idInterval);
                this.idInterval = undefined;
                this.dom.innerHTML = "select a node with an attached component particle system";
                return;
            }
            this.particleEffect = _particleEffect;
            this.particleEffectData = _particleEffect.data;
            this.dom.innerHTML = "";
            this.dom.appendChild(this.canvas);
            this.recreateTree(this.particleEffectData);
            this.updateUserInterface();
            this.redraw();
            if (this.idInterval == undefined)
                this.idInterval = window.setInterval(() => { this.dispatch(Fudge.EVENT_EDITOR.ANIMATE, { bubbles: true, detail: { graph: this.graph } }); }, 1000 / 30);
        }
        createUserInterface() {
            this.canvas = document.createElement("canvas");
            this.crc2 = this.canvas.getContext("2d");
            this.canvas.style.position = "absolute";
            this.canvas.style.left = "300px";
            this.canvas.style.top = "0px";
        }
        updateUserInterface() {
            // this.propertyList = document.createElement("div");
        }
        recreateTree(_particleEffectData) {
            this.controller = new Fudge.ControllerTreeParticleSystem(_particleEffectData);
            let newTree = new ƒui.CustomTree(this.controller, _particleEffectData);
            if (this.tree && this.dom.contains(this.tree))
                this.dom.replaceChild(newTree, this.tree);
            else
                this.dom.appendChild(newTree);
            this.tree = newTree;
            this.tree.addEventListener("rename" /* RENAME */, this.hndEvent);
            this.tree.addEventListener("drop" /* DROP */, this.hndEvent);
            this.tree.addEventListener("delete" /* DELETE */, this.hndEvent);
            this.tree.addEventListener("contextmenu" /* CONTEXTMENU */, this.openContextMenu);
        }
        //#region drawing
        redraw = () => {
            if (!this.particleEffect)
                return;
            this.canvas.width = this.dom.clientWidth - 300;
            this.canvas.height = this.dom.clientHeight;
            this.crc2.resetTransform();
            this.crc2.translate(0, 500);
            this.crc2.clearRect(0, 0, this.canvas.height, this.canvas.width);
            this.drawStructure(this.particleEffect.mtxLocal);
        };
        drawStructure(_structureOrFunction) {
            if (_structureOrFunction instanceof Function) {
                this.drawClosure(_structureOrFunction);
            }
            else {
                for (const property in _structureOrFunction) {
                    this.drawStructure(_structureOrFunction[property]);
                }
            }
        }
        drawClosure(_closure) {
            let variables = this.cmpParticleSystem.variables;
            for (let iParticle = 0; iParticle < variables[ƒ.PARTICLE_VARIBALE_NAMES.NUMBER_OF_PARTICLES]; iParticle += 1) {
                // console.log(iParticle);
                this.crc2.strokeStyle = this.randomColor();
                this.crc2.lineWidth = 2;
                this.crc2.beginPath();
                for (let time = 0; time < 20; time++) {
                    variables[ƒ.PARTICLE_VARIBALE_NAMES.TIME] = 0;
                    // this.cmpParticleSystem.evaluateStorage(this.particleEffect.storageUpdate);
                    variables[ƒ.PARTICLE_VARIBALE_NAMES.INDEX] = iParticle;
                    // this.cmpParticleSystem.evaluateStorage(this.particleEffect.storageParticle);
                    variables["reversedParticleTime"] = time / 10;
                    let x = time * 100;
                    let y = -_closure(variables) * 1000;
                    // console.log(y);
                    if (x == 0)
                        this.crc2.moveTo(x, y);
                    else
                        this.crc2.lineTo(x, y);
                }
                this.crc2.stroke();
            }
        }
        randomColor() {
            return "hsl(" + Math.random() * 360 + ", 80%, 80%)";
        }
    }
    Fudge.ViewParticleSystem = ViewParticleSystem;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    /**
     * TODO: add
     * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
     */
    class ViewAnimation extends Fudge.View {
        animation;
        controller;
        toolbar;
        cmpAnimator;
        node;
        playbackTime;
        graph;
        selectedKey;
        propertyList;
        sheet;
        hover; // TODO: remove this?
        time = new ƒ.Time();
        idInterval;
        constructor(_container, _state) {
            super(_container, _state);
            this.playbackTime = 500;
            this.setAnimation(null);
            this.createUserInterface();
            _container.on("resize", this.redraw);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.FOCUS, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.MODIFY, this.hndEvent);
            this.dom.addEventListener("itemselect" /* SELECT */, this.hndSelect);
            this.dom.addEventListener("contextmenu" /* CONTEXTMENU */, this.openContextMenu);
            this.dom.addEventListener("expand" /* EXPAND */, this.hndEvent);
            this.dom.addEventListener("collapse" /* COLLAPSE */, this.hndEvent);
            this.dom.addEventListener("input" /* INPUT */, this.hndEvent);
        }
        //#region  ContextMenu
        getContextMenu(_callback) {
            const menu = new Fudge.remote.Menu();
            let path = [];
            if (this.node != undefined) {
                let item;
                item = new Fudge.remote.MenuItem({
                    label: "Add Property",
                    submenu: this.getNodeSubmenu(this.node, path, _callback)
                });
                menu.append(item);
                item = new Fudge.remote.MenuItem({ label: "Delete Property", id: String(Fudge.CONTEXTMENU.DELETE_PROPERTY), click: _callback, accelerator: "D" });
                menu.append(item);
            }
            return menu;
        }
        contextMenuCallback(_item, _window, _event) {
            let choice = Number(_item.id);
            ƒ.Debug.fudge(`MenuSelect | id: ${Fudge.CONTEXTMENU[_item.id]} | event: ${_event}`);
            let path;
            switch (choice) {
                case Fudge.CONTEXTMENU.ADD_PROPERTY:
                    path = _item["path"];
                    this.controller.addPath(path);
                    this.dispatch(Fudge.EVENT_EDITOR.MODIFY, {});
                    break;
                case Fudge.CONTEXTMENU.DELETE_PROPERTY:
                    let element = document.activeElement;
                    if (element.tagName == "BODY")
                        return;
                    path = [];
                    while (element !== this.propertyList) {
                        if (element instanceof ƒui.Details) {
                            let summaryElement = element.getElementsByTagName("SUMMARY")[0];
                            path.unshift(summaryElement.innerHTML);
                        }
                        if (element instanceof ƒui.CustomElement) {
                            let labelElement = element.getElementsByTagName("LABEL")[0];
                            path.unshift(labelElement.innerHTML);
                        }
                        element = element.parentElement;
                    }
                    this.controller.deletePath(path);
                    this.dispatch(Fudge.EVENT_EDITOR.MODIFY, {});
                    return;
            }
        }
        getNodeSubmenu(_node, _path, _callback) {
            const menu = new Fudge.remote.Menu();
            for (const anyComponent of ƒ.Component.subclasses) {
                //@ts-ignore
                _node.getComponents(anyComponent).forEach((component, index) => {
                    let path = Object.assign([], _path);
                    path.push("components");
                    path.push(component.type);
                    path.push(index.toString());
                    let item;
                    item = new Fudge.remote.MenuItem({ label: component.type, submenu: this.getMutatorSubmenu(component.getMutatorForAnimation(), path, _callback) });
                    menu.append(item);
                });
            }
            for (const child of _node.getChildren()) {
                let path = Object.assign([], _path);
                path.push("children");
                path.push(child.name);
                let item;
                item = new Fudge.remote.MenuItem({ label: child.name, submenu: this.getNodeSubmenu(child, path, _callback) });
                menu.append(item);
            }
            return menu;
        }
        getMutatorSubmenu(_mutator, _path, _callback) {
            const menu = new Fudge.remote.Menu();
            for (const property in _mutator) {
                let item;
                let path = Object.assign([], _path);
                path.push(property);
                if (typeof _mutator[property] === "object") {
                    item = new Fudge.remote.MenuItem({ label: property, submenu: this.getMutatorSubmenu(_mutator[property], path, _callback) });
                }
                else {
                    item = new Fudge.remote.MenuItem({ label: property, id: String(Fudge.CONTEXTMENU.ADD_PROPERTY), click: _callback });
                    //@ts-ignore
                    item.overrideProperty("path", path);
                }
                menu.append(item);
            }
            return menu;
        }
        //#endregion
        createUserInterface() {
            this.toolbar = document.createElement("div");
            this.toolbar.id = "toolbar";
            this.toolbar.style.width = "300px";
            this.toolbar.style.height = "80px";
            this.toolbar.style.borderBottom = "1px solid black";
            this.fillToolbar(this.toolbar);
            this.toolbar.addEventListener("click", this.hndToolbarClick);
            this.toolbar.addEventListener("change", this.hndToolbarChange);
            this.sheet = new Fudge.ViewAnimationSheetCurve(this); // TODO: stop using fixed values?
            this.sheet.canvas.addEventListener("pointerdown", this.hndPointerDown);
            this.sheet.canvas.addEventListener("pointermove", this.hndPointerMove);
            this.hover = document.createElement("span");
            this.hover.style.background = "black";
            this.hover.style.color = "white";
            this.hover.style.position = "absolute";
            this.hover.style.display = "none";
        }
        hndPointerDown = (_event) => {
            if (_event.buttons != 1 || this.idInterval != undefined)
                return;
            if (_event.offsetY < 50)
                this.setTime(_event.offsetX);
            let obj = this.sheet.getObjectAtPoint(_event.offsetX, _event.offsetY);
            if (!obj)
                return;
            if (obj["label"]) {
                console.log(obj["label"]);
                // TODO: replace with editor events. use dispatch event from view?
                this.dom.dispatchEvent(new CustomEvent("itemselect" /* SELECT */, { detail: { name: obj["label"], time: this.animation.labels[obj["label"]] } }));
            }
            else if (obj["event"]) {
                console.log(obj["event"]);
                this.dom.dispatchEvent(new CustomEvent("itemselect" /* SELECT */, { detail: { name: obj["event"], time: this.animation.events[obj["event"]] } }));
            }
            else if (obj["key"]) {
                console.log(obj["key"]);
                this.dom.dispatchEvent(new CustomEvent("itemselect" /* SELECT */, { detail: obj }));
            }
        };
        hndPointerMove = (_event) => {
            if (_event.buttons != 1 || this.idInterval != undefined || _event.offsetY > 50)
                return;
            _event.preventDefault();
            this.setTime(_event.offsetX);
        };
        hndEvent = (_event) => {
            switch (_event.type) {
                case Fudge.EVENT_EDITOR.FOCUS:
                    this.graph = _event.detail.graph;
                    this.focusNode(_event.detail.node);
                    break;
                case Fudge.EVENT_EDITOR.MODIFY:
                    //TODO: rework this
                    let animationMutator = this.animation?.getMutated(this.playbackTime, 0, ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
                    if (!animationMutator)
                        animationMutator = {};
                    let newPropertyList = ƒui.Generator.createInterfaceFromMutator(animationMutator);
                    this.controller = new Fudge.ControllerAnimation(this.animation, newPropertyList);
                    this.dom.replaceChild(newPropertyList, this.propertyList);
                    this.propertyList = newPropertyList;
                    this.updatePropertyList();
                    break;
                case "expand" /* EXPAND */:
                case "collapse" /* COLLAPSE */:
                    this.sheet.setSequences(this.controller.getOpenSequences());
                    this.redraw();
                    break;
                case "input" /* INPUT */:
                    if (_event.target instanceof ƒui.CustomElement) {
                        this.controller.modifyKey(this.playbackTime, _event.target);
                        this.sheet.setSequences(this.controller.getOpenSequences());
                        this.redraw();
                    }
                    break;
            }
        };
        focusNode(_node) {
            this.node = _node;
            this.cmpAnimator = _node?.getComponent(ƒ.ComponentAnimator);
            this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
            this.setAnimation(this.cmpAnimator?.animation);
        }
        setAnimation(_animation) {
            if (!_animation) {
                this.animation = undefined;
                this.dom.innerHTML = "select node with an attached component animator";
                return;
            }
            this.dom.innerHTML = "";
            this.dom.appendChild(this.toolbar);
            this.dom.appendChild(this.sheet.canvas);
            this.dom.appendChild(this.hover);
            this.animation = _animation;
            let animationMutator = this.animation?.getMutated(this.playbackTime, 0, ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
            if (!animationMutator)
                animationMutator = {};
            this.propertyList = ƒui.Generator.createInterfaceFromMutator(animationMutator);
            this.controller = new Fudge.ControllerAnimation(this.animation, this.propertyList);
            this.dom.appendChild(this.propertyList);
            this.updatePropertyList();
            this.sheet.setSequences(this.controller.getOpenSequences());
            this.redraw();
        }
        hndSelect = (_event) => {
            if ("key" in _event.detail) {
                this.selectedKey = _event.detail;
            }
        };
        fillToolbar(_tb) {
            let playmode = document.createElement("select");
            playmode.id = "playmode";
            for (let m in ƒ.ANIMATION_PLAYMODE) {
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
            fpsI.value = this.animation?.fps.toString();
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
            spsI.value = this.animation?.fps.toString(); // stepsPerSecond.toString();
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
            buttons[9].classList.add("fa", "fa-plus-square", "remove-key");
            buttons[0].id = "start";
            buttons[1].id = "back";
            buttons[2].id = "play";
            buttons[3].id = "pause";
            buttons[4].id = "forward";
            buttons[5].id = "end";
            buttons[6].id = "add-label";
            buttons[7].id = "add-event";
            buttons[8].id = "add-key";
            buttons[9].id = "remove-key";
            buttons[0].innerText = "start";
            buttons[1].innerText = "back";
            buttons[2].innerText = "play";
            buttons[3].innerText = "pause";
            buttons[4].innerText = "forward";
            buttons[5].innerText = "end";
            buttons[6].innerText = "add-label";
            buttons[7].innerText = "add-event";
            buttons[8].innerText = "add-key";
            buttons[9].innerText = "remove-key";
            for (let b of buttons) {
                _tb.appendChild(b);
            }
        }
        hndToolbarClick = (_e) => {
            // console.log("click", _e.target);
            let target = _e.target;
            switch (target.id) {
                case "add-label":
                    this.animation.labels[this.randomNameGenerator()] = this.playbackTime;
                    this.redraw();
                    break;
                case "add-event":
                    this.animation.setEvent(this.randomNameGenerator(), this.playbackTime);
                    this.redraw();
                    break;
                case "add-key":
                    // TODO: readd this look how it works in unity?
                    // this.controller.addKeyToAnimationStructure(this.playbackTime);
                    // this.sheet.setSequences(this.controller.getOpenSequences());       
                    // this.redraw();
                    break;
                case "remove-key":
                    this.controller.deleteKey(this.selectedKey);
                    this.sheet.setSequences(this.controller.getOpenSequences());
                    this.redraw();
                    break;
                case "start":
                    this.playbackTime = 0;
                    this.updatePropertyList();
                    break;
                case "back":
                    this.playbackTime = this.playbackTime -= 1000 / this.animation.fps; // stepsPerSecond;
                    this.playbackTime = Math.max(this.playbackTime, 0);
                    this.updatePropertyList();
                    break;
                case "play":
                    this.time.set(this.playbackTime);
                    if (this.idInterval == undefined)
                        this.idInterval = window.setInterval(this.updateAnimation, 1000 / this.animation.fps);
                    break;
                case "pause":
                    window.clearInterval(this.idInterval);
                    this.idInterval = undefined;
                    break;
                case "forward":
                    this.playbackTime = this.playbackTime += 1000 / this.animation.fps; // stepsPerSecond;
                    this.playbackTime = Math.min(this.playbackTime, this.animation.totalTime);
                    this.updatePropertyList();
                    break;
                case "end":
                    this.playbackTime = this.animation.totalTime;
                    this.redraw();
                    this.updatePropertyList();
                    break;
                default:
                    break;
            }
        };
        hndToolbarChange = (_e) => {
            let target = _e.target;
            switch (target.id) {
                case "playmode":
                    this.cmpAnimator.playmode = ƒ.ANIMATION_PLAYMODE[target.value];
                    // console.log(ƒ.ANIMATION_PLAYMODE[target.value]);
                    break;
                case "fps":
                    // console.log("fps changed to", target.value);
                    if (!isNaN(+target.value))
                        this.animation.fps = +target.value;
                    break;
                case "sps":
                    // console.log("sps changed to", target.value);
                    if (!isNaN(+target.value)) {
                        this.animation.fps /* stepsPerSecond */ = +target.value;
                        this.redraw();
                    }
                    break;
                default:
                    console.log("no clue what you changed...");
                    break;
            }
        };
        updatePropertyList(_m = null) {
            this.redraw();
            if (!_m)
                _m = this.animation.getMutated(this.playbackTime, 0, this.cmpAnimator.playback);
            this.controller.updatePropertyList(_m);
            this.dispatch(Fudge.EVENT_EDITOR.ANIMATE, { bubbles: true, detail: { graph: this.graph } });
        }
        setTime(_x, _updateDisplay = true) {
            if (!this.animation)
                return;
            this.playbackTime = Math.max(0, this.sheet.getTransformedPoint(_x, 0).x);
            this.playbackTime = Math.round(this.playbackTime / ((1000 / this.animation.fps))) * ((1000 / this.animation.fps));
            if (_updateDisplay)
                this.updatePropertyList(this.cmpAnimator.updateAnimation(this.playbackTime)[0]);
        }
        redraw = () => {
            this.sheet.redraw(this.playbackTime);
        };
        updateAnimation = () => {
            // requestAnimationFrame(this.playAnimation.bind(this));
            let t = this.time.get();
            let m = {};
            [m, t] = this.cmpAnimator.updateAnimation(t);
            this.playbackTime = t;
            this.updatePropertyList(m);
        };
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
    var ƒ = FudgeCore;
    /**
     * TODO: add
     * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
     */
    class ViewAnimationSheet {
        static KEY_SIZE = 8; // width and height in px
        static LINE_WIDTH = 1; // in px
        static PIXEL_PER_SECOND = 1000;
        canvas;
        mtxTransform;
        mtxTransformInverse;
        keys = [];
        sequences = [];
        crc2;
        view;
        labels = [];
        events = [];
        time = 0;
        posDragStart = new ƒ.Vector2();
        constructor(_view) {
            this.view = _view;
            this.canvas = document.createElement("canvas");
            this.crc2 = this.canvas.getContext("2d");
            this.mtxTransform = new ƒ.Matrix3x3();
            this.mtxTransform.translateY(500);
            this.canvas.style.position = "absolute";
            this.canvas.style.left = "300px";
            this.canvas.style.top = "0px";
            this.canvas.style.borderLeft = "1px solid black";
            this.canvas.addEventListener("pointerdown", this.hndPointerDown);
            this.canvas.addEventListener("pointermove", this.hndPointerMove);
            this.canvas.addEventListener("wheel", this.hdnWheel);
        }
        get animation() {
            return this.view.animation;
        }
        get dom() {
            return this.view.dom;
        }
        get toolbar() {
            return this.view.toolbar;
        }
        get controller() {
            return this.view.controller;
        }
        setSequences(_sequences) {
            this.sequences = _sequences;
        }
        redraw(_time) {
            if (!this.animation)
                return;
            if (_time != undefined)
                this.time = _time;
            this.canvas.width = this.dom.clientWidth - this.toolbar.clientWidth;
            this.canvas.height = this.dom.clientHeight;
            // TODO: check if these 2 lines are necessary
            this.crc2.resetTransform();
            this.crc2.clearRect(0, 0, this.canvas.height, this.canvas.width);
            this.mtxTransformInverse = ƒ.Matrix3x3.INVERSION(this.mtxTransform);
            let translation = this.mtxTransform.translation;
            translation.x = Math.min(0, translation.x);
            this.mtxTransform.translation = translation;
            this.crc2.setTransform(this.mtxTransform.scaling.x, 0, 0, this.mtxTransform.scaling.y, this.mtxTransform.translation.x, this.mtxTransform.translation.y);
            this.drawKeys();
            if (this instanceof Fudge.ViewAnimationSheetCurve) {
                this.crc2.lineWidth = ViewAnimationSheet.LINE_WIDTH * this.mtxTransformInverse.scaling.x;
                this.drawCurves();
                this.drawScale();
            }
            this.drawTimeline();
            this.drawEventsAndLabels();
            this.drawCursor(this.time);
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
            let point = this.getTransformedPoint(_x, _y);
            for (let k of this.keys) {
                if (this.crc2.isPointInPath(k.path2D, point.x, point.y)) {
                    return k;
                }
            }
            return null;
        }
        getTransformedPoint(_x, _y) {
            let vector = new ƒ.Vector2(_x, _y);
            vector.transform(this.mtxTransformInverse);
            return vector;
        }
        drawTimeline() {
            this.crc2.resetTransform();
            this.crc2.lineWidth = ViewAnimationSheet.LINE_WIDTH;
            let timelineHeight = 50;
            this.crc2.fillStyle = "#7a7a7a";
            this.crc2.fillRect(0, 0, this.canvas.width, timelineHeight + 30);
            let timeline = new Path2D();
            timeline.moveTo(0, timelineHeight);
            timeline.lineTo(this.canvas.width, timelineHeight);
            this.crc2.strokeStyle = "black";
            this.crc2.fillStyle = "black";
            this.crc2.textBaseline = "middle";
            this.crc2.textAlign = "left";
            const minimumPixelPerStep = 10;
            let pixelPerStep = (ViewAnimationSheet.PIXEL_PER_SECOND / this.animation.fps) * this.mtxTransform.scaling.x;
            let framesPerStep = 1;
            let stepScaleFactor = Math.max(Math.pow(2, Math.ceil(Math.log2(minimumPixelPerStep / pixelPerStep))), 1);
            pixelPerStep *= stepScaleFactor;
            framesPerStep *= stepScaleFactor;
            let steps = 1 + this.canvas.width / pixelPerStep;
            let stepOffset = Math.floor(-this.mtxTransform.translation.x / pixelPerStep);
            for (let iStep = stepOffset; iStep < steps + stepOffset; iStep++) {
                let x = (iStep * pixelPerStep + this.mtxTransform.translation.x);
                timeline.moveTo(x, timelineHeight);
                // TODO: refine the display
                if (iStep % 5 == 0) {
                    timeline.lineTo(x, timelineHeight - 30);
                    let second = Math.floor((iStep * framesPerStep) / this.animation.fps);
                    let frame = (iStep * framesPerStep) % this.animation.fps;
                    this.crc2.fillText(`${second}:${frame < 10 ? "0" : ""}${frame}`, x + 3, timelineHeight - 30);
                }
                else {
                    timeline.lineTo(x, timelineHeight - 20);
                }
            }
            this.crc2.stroke(timeline);
        }
        drawKeys() {
            this.generateKeys();
            for (const key of this.keys) {
                this.crc2.fillStyle = key.sequence.color;
                this.crc2.fill(key.path2D);
            }
        }
        generateKey(_x, _y, _w, _h) {
            let key = new Path2D();
            key.moveTo(_x - _w, _y);
            key.lineTo(_x, _y + _h);
            key.lineTo(_x + _w, _y);
            key.lineTo(_x, _y - _h);
            key.closePath();
            return key;
        }
        drawCursor(_time) {
            let x = _time * this.mtxTransform.scaling.x + this.mtxTransform.translation.x;
            let cursor = new Path2D();
            cursor.moveTo(x, 0);
            cursor.lineTo(x, this.canvas.height);
            this.crc2.strokeStyle = "white";
            this.crc2.stroke(cursor);
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
            if (!this.animation)
                return;
            for (let l in this.animation.labels) {
                //TODO stop using hardcoded values
                let p = new Path2D;
                this.labels.push({ label: l, path2D: p });
                let position = this.animation.labels[l] * this.mtxTransform.scaling.x + this.mtxTransform.translation.x;
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
            for (let e in this.animation.events) {
                let p = new Path2D;
                this.events.push({ event: e, path2D: p });
                let position = this.animation.events[e] * this.mtxTransform.scaling.x + this.mtxTransform.translation.x;
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
        hndPointerDown = (_event) => {
            if (_event.buttons != 4)
                return;
            this.posDragStart = this.getTransformedPoint(_event.offsetX, _event.offsetY);
        };
        hndPointerMove = (_event) => {
            if (_event.buttons != 4)
                return;
            _event.preventDefault();
            this.mtxTransform.translate(ƒ.Vector2.DIFFERENCE(this.getTransformedPoint(_event.offsetX, _event.offsetY), this.posDragStart));
            this.redraw();
        };
        hdnWheel = (_event) => {
            if (_event.buttons != 0)
                return;
            let zoomFactor = _event.deltaY < 0 ? 1.05 : 0.95;
            let posCursorTransformed = this.getTransformedPoint(_event.offsetX, _event.offsetY);
            this.mtxTransform.translate(posCursorTransformed);
            this.mtxTransform.scale(new ƒ.Vector2(_event.shiftKey ? 1 : zoomFactor, _event.ctrlKey ? 1 : zoomFactor));
            this.mtxTransform.translate(ƒ.Vector2.SCALE(posCursorTransformed, -1));
            this.redraw();
        };
    }
    Fudge.ViewAnimationSheet = ViewAnimationSheet;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * TODO: add
     * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
     */
    class ViewAnimationSheetCurve extends Fudge.ViewAnimationSheet {
        static PIXEL_PER_VALUE = 100;
        static MINIMUM_PIXEL_PER_STEP = 30;
        drawCurves() {
            for (const sequence of this.sequences) {
                let data = sequence.sequence;
                this.crc2.beginPath();
                this.crc2.strokeStyle = sequence.color;
                for (let i = 0; i < data.length; i++) {
                    const key = data.getKey(i);
                    const nextKey = data.getKey(i + 1);
                    if (nextKey != null) {
                        let bezierPoints = this.getBezierPoints(key.functionOut, key, nextKey);
                        this.crc2.moveTo(bezierPoints[0].x, -bezierPoints[0].y * ViewAnimationSheetCurve.PIXEL_PER_VALUE);
                        this.crc2.bezierCurveTo(bezierPoints[1].x, -bezierPoints[1].y * ViewAnimationSheetCurve.PIXEL_PER_VALUE, bezierPoints[2].x, -bezierPoints[2].y * ViewAnimationSheetCurve.PIXEL_PER_VALUE, bezierPoints[3].x, -bezierPoints[3].y * ViewAnimationSheetCurve.PIXEL_PER_VALUE);
                    }
                }
                this.crc2.stroke();
            }
        }
        drawScale() {
            this.crc2.resetTransform();
            this.crc2.strokeStyle = "grey";
            this.crc2.lineWidth = 1;
            let centerLine = new Path2D();
            centerLine.moveTo(0, this.mtxTransform.translation.y);
            centerLine.lineTo(this.canvas.width, this.mtxTransform.translation.y);
            this.crc2.stroke(centerLine);
            this.crc2.fillStyle = "grey";
            this.crc2.strokeStyle = "grey";
            this.crc2.textBaseline = "bottom";
            this.crc2.textAlign = "right";
            let pixelPerStep = ViewAnimationSheetCurve.PIXEL_PER_VALUE * this.mtxTransform.scaling.y;
            let valuePerStep = 1;
            let stepScaleFactor = Math.max(Math.pow(2, Math.ceil(Math.log2(ViewAnimationSheetCurve.MINIMUM_PIXEL_PER_STEP / pixelPerStep))), 1);
            pixelPerStep *= stepScaleFactor;
            valuePerStep *= stepScaleFactor;
            let steps = 1 + this.canvas.height / pixelPerStep;
            let stepOffset = Math.floor(-this.mtxTransform.translation.y / pixelPerStep);
            for (let i = stepOffset; i < steps + stepOffset; i++) {
                let stepLine = new Path2D();
                let y = (i * pixelPerStep + this.mtxTransform.translation.y);
                stepLine.moveTo(0, y);
                // TODO: refine the display
                if (valuePerStep > 1 && i % 5 == 0 || valuePerStep == 1) {
                    this.crc2.lineWidth = 0.6;
                    stepLine.lineTo(35, y);
                    let value = -i * valuePerStep;
                    this.crc2.fillText(valuePerStep >= 1 ? value.toFixed(0) : value.toFixed(1), 33, y);
                }
                else {
                    this.crc2.lineWidth = 0.3;
                    stepLine.lineTo(30, y);
                }
                this.crc2.stroke(stepLine);
            }
        }
        generateKeys() {
            this.keys = this.sequences.flatMap((_sequence) => {
                let keys = [];
                for (let i = 0; i < _sequence.sequence.length; i++) {
                    let key = _sequence.sequence.getKey(i);
                    keys.push({
                        key: key,
                        path2D: this.generateKey(key.Time, -key.Value * ViewAnimationSheetCurve.PIXEL_PER_VALUE, Fudge.ViewAnimationSheet.KEY_SIZE * this.mtxTransformInverse.scaling.x, Fudge.ViewAnimationSheet.KEY_SIZE * this.mtxTransformInverse.scaling.y),
                        sequence: _sequence
                    });
                }
                return keys;
            });
        }
        getBezierPoints(_animationFunction, keyIn, keyOut) {
            let parameters = _animationFunction.getParameters();
            let polarForm = (u, v, w) => {
                return (parameters.a * u * v * w +
                    parameters.b * ((v * w + w * u + u * v) / 3) +
                    parameters.c * ((u + v + w) / 3) +
                    parameters.d);
            };
            let timeStart = keyIn.Time;
            let timeEnd = keyOut.Time;
            let offsetTimeEnd = timeEnd - timeStart;
            return [
                { x: timeStart, y: polarForm(0, 0, 0) },
                { x: timeStart + offsetTimeEnd * 1 / 3, y: polarForm(0, 0, offsetTimeEnd) },
                { x: timeStart + offsetTimeEnd * 2 / 3, y: polarForm(0, offsetTimeEnd, offsetTimeEnd) },
                { x: timeStart + offsetTimeEnd, y: polarForm(offsetTimeEnd, offsetTimeEnd, offsetTimeEnd) }
            ];
        }
    }
    Fudge.ViewAnimationSheetCurve = ViewAnimationSheetCurve;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * TODO: add
     * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
     */
    class ViewAnimationSheetDope extends Fudge.ViewAnimationSheet {
        async drawKeys() {
            //TODO: Fix that for some reason the first time this is called the rects return all 0s.
            //TODO: possible optimisation: only regenerate if necessary, otherwise load a saved image. (might lead to problems with the keys not being clickable anymore though)
            // const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            // let inputMutator: ƒ.Mutator = this.view.controller.getElementIndex();
            // console.log(inputMutator);
            // await delay(1);
            // console.log(inputMutator.components["ComponentTransform"][0]["ƒ.ComponentTransform"]["rotation"]["y"].getBoundingClientRect());
            // }, 1000);
            // this.traverseStructures(this.view.animation.animationStructure, inputMutator);
            this.drawKey(100, 100, 10, 10, "green");
            // this.drawStructure(this.animation.animationStructure);
        }
        drawSequence(_sequence) {
            let rect = new DOMRect(100, 100, 10, 10); //_input.getBoundingClientRect();
            let y = rect.top - this.dom.getBoundingClientRect().top + rect.height / 2;
            let height = rect.height;
            let width = rect.height;
            let line = new Path2D();
            line.moveTo(0, y);
            line.lineTo(this.crc2.canvas.width, y);
            this.crc2.strokeStyle = "green";
            this.crc2.stroke(line);
            let seq = { color: "red", sequence: _sequence };
            this.sequences.push(seq);
            for (let i = 0; i < _sequence.length; i++) {
                let k = _sequence.getKey(i);
                this.keys.push({ key: k, path2D: this.drawKey(k.Time * this.mtxTransform.scaling.x, y, height / 2, width / 2, seq.color), sequence: seq });
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
        [ƒ.Mesh, ƒ.ComponentMesh],
        [ƒ.Animation, ƒ.ComponentAnimator],
        [ƒ.ParticleEffect, ƒ.ComponentParticleSystem]
    ]);
    /**
     * View all components attached to a node
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewComponents extends Fudge.View {
        node;
        expanded = { ComponentTransform: true };
        selected = "ComponentTransform";
        constructor(_container, _state) {
            super(_container, _state);
            this.fillContent();
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SELECT, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.FOCUS, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.MODIFY, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.TRANSFORM, this.hndTransform);
            // this.dom.addEventListener(ƒUi.EVENT.RENAME, this.hndEvent);
            this.dom.addEventListener("delete" /* DELETE */, this.hndEvent);
            this.dom.addEventListener("expand" /* EXPAND */, this.hndEvent);
            this.dom.addEventListener("collapse" /* COLLAPSE */, this.hndEvent);
            this.dom.addEventListener("contextmenu" /* CONTEXTMENU */, this.openContextMenu);
            this.dom.addEventListener("click" /* CLICK */, this.hndEvent, true);
            this.dom.addEventListener("keydown" /* KEY_DOWN */, this.hndEvent, true);
            this.dom.addEventListener("mutate" /* MUTATE */, this.hndEvent, true);
        }
        //#region  ContextMenu
        getContextMenu(_callback) {
            const menu = new Fudge.remote.Menu();
            let item;
            item = new Fudge.remote.MenuItem({
                label: "Add Component",
                submenu: Fudge.ContextMenu.getSubclassMenu(Fudge.CONTEXTMENU.ADD_COMPONENT, ƒ.Component, _callback)
            });
            menu.append(item);
            item = new Fudge.remote.MenuItem({
                label: "Add Joint",
                submenu: Fudge.ContextMenu.getSubclassMenu(Fudge.CONTEXTMENU.ADD_JOINT, ƒ.Joint, _callback)
            });
            menu.append(item);
            item = new Fudge.remote.MenuItem({
                label: "Delete Component",
                submenu: Fudge.ContextMenu.getSubclassMenu(Fudge.CONTEXTMENU.ADD_JOINT, ƒ.Joint, _callback)
            });
            item = new Fudge.remote.MenuItem({ label: "Delete Component", id: String(Fudge.CONTEXTMENU.DELETE_COMPONENT), click: _callback, accelerator: "D" });
            menu.append(item);
            // ContextMenu.appendCopyPaste(menu);
            return menu;
        }
        contextMenuCallback(_item, _window, _event) {
            ƒ.Debug.info(`MenuSelect: Item-id=${Fudge.CONTEXTMENU[_item.id]}`);
            let iSubclass = _item["iSubclass"];
            let component;
            switch (Number(_item.id)) {
                case Fudge.CONTEXTMENU.ADD_COMPONENT:
                    component = ƒ.Component.subclasses[iSubclass];
                    break;
                case Fudge.CONTEXTMENU.ADD_JOINT:
                    component = ƒ.Joint.subclasses[iSubclass];
                    break;
                case Fudge.CONTEXTMENU.DELETE_COMPONENT:
                    let element = document.activeElement;
                    if (element.tagName == "BODY")
                        return;
                    do {
                        console.log(element.tagName);
                        let controller = Reflect.get(element, "controller");
                        if (element.tagName == "DETAILS" && controller) {
                            this.dom.dispatchEvent(new CustomEvent("delete" /* DELETE */, { detail: { mutable: controller.getMutable() } }));
                            break;
                        }
                        element = element.parentElement;
                    } while (element);
                    return;
            }
            //@ts-ignore
            let cmpNew = new component();
            if (cmpNew instanceof ƒ.ComponentRigidbody)
                if (!this.node.cmpTransform) {
                    alert("To attach ComponentRigidbody, first attach ComponentTransform!");
                    return;
                }
            if (cmpNew instanceof ƒ.ComponentGraphFilter)
                if (!(this.node instanceof ƒ.Graph || this.node instanceof ƒ.GraphInstance)) {
                    alert("Attach ComponentSyncGraph only to GraphInstances or Graph");
                    console.log(this.node);
                    return;
                }
            ƒ.Debug.info(cmpNew.type, cmpNew);
            this.node.addComponent(cmpNew);
            this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
            this.dom.dispatchEvent(new CustomEvent("itemselect" /* SELECT */, { bubbles: true, detail: { data: this.node } }));
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
            this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
        }
        fillContent() {
            while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild))
                ;
            let cntEmpty = document.createElement("div");
            cntEmpty.textContent = "Drop internal resources or use right click to create new components";
            this.dom.title = "Drop internal resources or use right click to create new components";
            if (!this.node || !(this.node instanceof ƒ.Node)) { // TODO: examine, if anything other than node can appear here...
                this.setTitle("Components");
                this.dom.title = "Select node to edit components";
                cntEmpty.textContent = "Select node to edit components";
                this.dom.append(cntEmpty);
                return;
            }
            this.setTitle("Components | " + this.node.name);
            let components = this.node.getAllComponents();
            if (!components.length) {
                this.dom.append(cntEmpty);
                return;
            }
            for (let component of components) {
                let details = ƒUi.Generator.createDetailsFromMutable(component);
                let controller = new Fudge.ControllerComponent(component, details);
                Reflect.set(details, "controller", controller); // insert a link back to the controller
                details.expand(this.expanded[component.type]);
                this.dom.append(details);
                if (component instanceof ƒ.ComponentRigidbody) {
                    let pivot = controller.domElement.querySelector("[key='mtxPivot'");
                    let opacity = pivot.style.opacity;
                    setPivotOpacity(null);
                    controller.domElement.addEventListener("mutate" /* MUTATE */, setPivotOpacity);
                    function setPivotOpacity(_event) {
                        let initialization = controller.getMutator({ initialization: 0 }).initialization;
                        pivot.style.opacity = initialization == ƒ.BODY_INIT.TO_PIVOT ? opacity : "0.3";
                    }
                }
                if (component instanceof ƒ.ComponentFaceCamera) {
                    let up = controller.domElement.querySelector("[key='up'");
                    let opacity = up.style.opacity;
                    setUpOpacity(null);
                    controller.domElement.addEventListener("mutate" /* MUTATE */, setUpOpacity);
                    function setUpOpacity(_event) {
                        let upLocal = controller.getMutator({ upLocal: true }).upLocal;
                        up.style.opacity = !upLocal ? opacity : "0.3";
                    }
                }
                if (details.getAttribute("key") == this.selected)
                    this.select(details, false);
            }
        }
        hndEvent = (_event) => {
            switch (_event.type) {
                // case ƒui.EVENT.RENAME: break;
                case Fudge.EVENT_EDITOR.SELECT:
                case Fudge.EVENT_EDITOR.FOCUS:
                    if (_event instanceof Fudge.FudgeEvent)
                        this.node = _event.detail.node;
                case Fudge.EVENT_EDITOR.MODIFY:
                    this.fillContent();
                    break;
                case "delete" /* DELETE */:
                    let component = _event.detail.mutable;
                    this.node.removeComponent(component);
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                    break;
                case "keydown" /* KEY_DOWN */:
                case "click" /* CLICK */:
                    if (_event instanceof KeyboardEvent && _event.code != ƒ.KEYBOARD_CODE.SPACE)
                        break;
                    let target = _event.target;
                    if (target.tagName == "SUMMARY")
                        target = target.parentElement;
                    if (!(_event.target instanceof HTMLDetailsElement || _event.target))
                        break;
                    try {
                        if (this.dom.replaceChild(target, target)) {
                            if (_event instanceof KeyboardEvent || this.getSelected() != target) {
                                target.expand(true);
                                _event.preventDefault();
                            }
                            this.select(target);
                        }
                    }
                    catch (_e) { /* */ }
                    break;
                case "expand" /* EXPAND */:
                case "collapse" /* COLLAPSE */:
                    this.expanded[_event.target.getAttribute("type")] = (_event.type == "expand" /* EXPAND */);
                    break;
                case "mutate" /* MUTATE */:
                    let cmpRigidbody = this.node.getComponent(ƒ.ComponentRigidbody);
                    if (cmpRigidbody) {
                        cmpRigidbody.initialize();
                        this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                    }
                default:
                    break;
            }
        };
        hndTransform = (_event) => {
            if (!this.getSelected())
                return;
            let controller = Reflect.get(this.getSelected(), "controller");
            let component = controller.getMutable();
            let mtxTransform = Reflect.get(component, "mtxLocal") || Reflect.get(component, "mtxPivot");
            if (!mtxTransform)
                return;
            let dtl = _event.detail.transform;
            let mtxCamera = dtl.camera.node.mtxWorld;
            let distance = mtxCamera.getTranslationTo(this.node.mtxWorld).magnitude;
            if (dtl.transform == Fudge.TRANSFORM.ROTATE)
                [dtl.x, dtl.y] = [dtl.y, dtl.x];
            let value = new ƒ.Vector3();
            value.x = (dtl.restriction == "x" ? !dtl.inverted : dtl.inverted) ? dtl.x : undefined;
            value.y = (dtl.restriction == "y" ? !dtl.inverted : dtl.inverted) ? -dtl.y : undefined;
            value.z = (dtl.restriction == "z" ? !dtl.inverted : dtl.inverted) ?
                ((value.x == undefined) ? -dtl.y : dtl.x) : undefined;
            value = value.map((_c) => _c || 0);
            if (mtxTransform instanceof ƒ.Matrix4x4)
                this.transform3(dtl.transform, value, mtxTransform, distance);
            if (mtxTransform instanceof ƒ.Matrix3x3)
                this.transform2(dtl.transform, value.toVector2(), mtxTransform, 1);
            component.mutate(component.getMutator());
        };
        transform3(_transform, _value, _mtxTransform, _distance) {
            switch (_transform) {
                case Fudge.TRANSFORM.TRANSLATE:
                    let factorTranslation = 0.001; // TODO: eliminate magic numbers
                    _value.scale(factorTranslation * _distance);
                    let translation = _mtxTransform.translation;
                    translation.add(_value);
                    _mtxTransform.translation = translation;
                    break;
                case Fudge.TRANSFORM.ROTATE:
                    let factorRotation = 1; // TODO: eliminate magic numbers
                    _value.scale(factorRotation);
                    let rotation = _mtxTransform.rotation;
                    rotation.add(_value);
                    _mtxTransform.rotation = rotation;
                    break;
                case Fudge.TRANSFORM.SCALE:
                    let factorScaling = 0.001; // TODO: eliminate magic numbers
                    _value.scale(factorScaling);
                    let scaling = _mtxTransform.scaling;
                    scaling.add(_value);
                    _mtxTransform.scaling = scaling;
                    break;
            }
        }
        transform2(_transform, _value, _mtxTransform, _distance) {
            switch (_transform) {
                case Fudge.TRANSFORM.TRANSLATE:
                    let factorTranslation = 0.001; // TODO: eliminate magic numbers
                    _value.scale(factorTranslation * _distance);
                    let translation = _mtxTransform.translation;
                    translation.add(_value);
                    _mtxTransform.translation = translation;
                    break;
                case Fudge.TRANSFORM.ROTATE:
                    let factorRotation = 1; // TODO: eliminate magic numbers
                    _value.scale(factorRotation);
                    _mtxTransform.rotation += _value.x;
                    break;
                case Fudge.TRANSFORM.SCALE:
                    let factorScaling = 0.001; // TODO: eliminate magic numbers
                    _value.scale(factorScaling);
                    let scaling = _mtxTransform.scaling;
                    scaling.add(_value);
                    _mtxTransform.scaling = scaling;
                    break;
            }
        }
        select(_details, _focus = true) {
            for (let child of this.dom.children)
                child.classList.remove("selected");
            _details.classList.add("selected");
            this.selected = _details.getAttribute("key");
            if (_focus)
                _details.focus();
        }
        getSelected() {
            for (let child of this.dom.children)
                if (child.classList.contains("selected"))
                    return child;
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
        graph;
        // private selectedNode: ƒ.Node;
        tree;
        constructor(_container, _state) {
            super(_container, _state);
            // this.contextMenu = this.getContextMenu(this.contextMenuCallback);
            this.setGraph(_state.node);
            // this.parentPanel.addEventListener(ƒui.EVENT.SELECT, this.setSelectedNode);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SELECT, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.FOCUS, this.hndEvent);
            // this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndEvent);
        }
        setGraph(_graph) {
            if (!_graph) {
                this.graph = undefined;
                this.dom.innerHTML = "";
                return;
            }
            if (this.graph && this.tree)
                this.dom.removeChild(this.tree);
            this.dom.innerHTML = "";
            this.graph = _graph;
            // this.selectedNode = null;
            this.tree = new ƒUi.Tree(new Fudge.ControllerTreeHierarchy(), this.graph);
            // this.listController.listRoot.addEventListener(ƒui.EVENT.SELECT, this.passEventToPanel);
            //TODO: examine if tree should fire common UI-EVENT for selection instead
            // this.tree.addEventListener(ƒui.EVENT.SELECT, this.passEventToPanel);
            this.tree.addEventListener("delete" /* DELETE */, this.hndEvent);
            this.tree.addEventListener("contextmenu" /* CONTEXTMENU */, this.openContextMenu);
            this.dom.append(this.tree);
            this.dom.title = "● Right click on existing node to create child node.\n● Use Copy/Paste to duplicate nodes.";
            this.tree.title = "Select node to edit or duplicate.";
        }
        getSelection() {
            return this.tree.controller.selection;
        }
        getDragDropSources() {
            return this.tree.controller.dragDrop.sources;
        }
        focusNode(_node) {
            let path = _node.getPath();
            path = path.splice(path.indexOf(this.graph));
            this.tree.show(path);
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
            this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
        }
        //#region  ContextMenu
        getContextMenu(_callback) {
            const menu = new Fudge.remote.Menu();
            let item;
            item = new Fudge.remote.MenuItem({ label: "Add Node", id: String(Fudge.CONTEXTMENU.ADD_NODE), click: _callback, accelerator: "N" });
            menu.append(item);
            item = new Fudge.remote.MenuItem({ label: "De- / Acvtivate", id: String(Fudge.CONTEXTMENU.ACTIVATE_NODE), click: _callback, accelerator: "A" });
            menu.append(item);
            item = new Fudge.remote.MenuItem({ label: "Delete", id: String(Fudge.CONTEXTMENU.DELETE_NODE), click: _callback, accelerator: "D" });
            menu.append(item);
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
                case Fudge.CONTEXTMENU.ACTIVATE_NODE:
                    focus.activate(!focus.isActive);
                    this.tree.findVisible(focus).refreshAttributes();
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                    break;
                case Fudge.CONTEXTMENU.DELETE_NODE:
                    // focus.addChild(child);
                    if (!focus)
                        return;
                    this.tree.delete([focus]);
                    focus.getParent().removeChild(focus);
                    ƒ.Physics.activeInstance = Fudge.Page.getPhysics(this.graph);
                    ƒ.Physics.cleanup();
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                    break;
            }
        }
        //#endregion
        //#region EventHandlers
        hndEvent = (_event) => {
            switch (_event.type) {
                case "delete" /* DELETE */:
                    this.dom.dispatchEvent(new Event(Fudge.EVENT_EDITOR.MODIFY, { bubbles: true }));
                    break;
                case Fudge.EVENT_EDITOR.SELECT:
                    if (_event.detail.node)
                        this.tree.displaySelection([_event.detail.node]);
                    else {
                        this.setGraph(_event.detail.graph);
                        break;
                    }
                case Fudge.EVENT_EDITOR.FOCUS:
                    if (_event.detail.node)
                        this.focusNode(_event.detail.node);
                    break;
            }
        };
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
        #pointerMoved = false;
        cmrOrbit;
        viewport;
        canvas;
        graph;
        nodeLight = new ƒ.Node("Illumination"); // keeps light components for dark graphs 
        constructor(_container, _state) {
            super(_container, _state);
            this.graph = ƒ.Project.resources[_state["graph"]];
            this.createUserInterface();
            let title = `● Drop a graph from "Internal" here.\n`;
            title += "● Use mousebuttons and ctrl-, shift- or alt-key to navigate view.\n";
            title += "● Click to select node, rightclick to select transformations.\n";
            title += "● Hold X, Y or Z to transform. Add shift-key to invert restriction.\n";
            title += "● Transformation affects selected component.";
            this.dom.title = title;
            this.dom.tabIndex = 0;
            _container.on("resize", this.redraw);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.MODIFY, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SELECT, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.ANIMATE, this.hndEvent);
            this.dom.addEventListener("mutate" /* MUTATE */, this.hndEvent);
            this.dom.addEventListener("itemselect" /* SELECT */, this.hndEvent);
            this.dom.addEventListener("delete" /* DELETE */, this.hndEvent);
            this.dom.addEventListener("contextmenu" /* CONTEXTMENU */, this.openContextMenu);
            this.dom.addEventListener("pointermove", this.hndPointer);
            this.dom.addEventListener("pointerdown", this.hndPointer);
        }
        createUserInterface() {
            ƒAid.addStandardLightComponents(this.nodeLight);
            let cmpCamera = new ƒ.ComponentCamera();
            cmpCamera.projectCentral(1, 45);
            this.canvas = ƒAid.Canvas.create(true, ƒAid.IMAGE_RENDERING.PIXELATED);
            let container = document.createElement("div");
            container.style.borderWidth = "0px";
            document.body.appendChild(this.canvas);
            this.viewport = new ƒ.Viewport();
            this.viewport.initialize("ViewNode_Viewport", this.graph, cmpCamera, this.canvas);
            this.cmrOrbit = FudgeAid.Viewport.expandCameraToInteractiveOrbit(this.viewport, false);
            this.viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
            this.viewport.addEventListener("renderPrepareStart" /* RENDER_PREPARE_START */, this.hndPrepare);
            this.setGraph(null);
            this.canvas.addEventListener("pointerdown", this.activeViewport);
            this.canvas.addEventListener("pick", this.hndPick);
        }
        setGraph(_node) {
            if (!_node) {
                this.graph = undefined;
                this.dom.innerHTML = "Drop a graph here to edit";
                return;
            }
            if (!this.graph) {
                this.dom.innerHTML = "";
                this.dom.appendChild(this.canvas);
            }
            this.graph = _node;
            ƒ.Physics.activeInstance = Fudge.Page.getPhysics(this.graph);
            ƒ.Physics.cleanup();
            this.graph.broadcastEvent(new Event("disconnectJoint" /* DISCONNECT_JOINT */));
            ƒ.Physics.connectJoints();
            this.viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
            this.viewport.setBranch(this.graph);
            this.redraw();
        }
        //#region  ContextMenu
        getContextMenu(_callback) {
            const menu = new Fudge.remote.Menu();
            let item;
            item = new Fudge.remote.MenuItem({ label: "Translate", id: Fudge.TRANSFORM.TRANSLATE, click: _callback, accelerator: process.platform == "darwin" ? "T" : "T" });
            menu.append(item);
            item = new Fudge.remote.MenuItem({ label: "Rotate", id: Fudge.TRANSFORM.ROTATE, click: _callback, accelerator: process.platform == "darwin" ? "R" : "R" });
            menu.append(item);
            item = new Fudge.remote.MenuItem({ label: "Scale", id: Fudge.TRANSFORM.SCALE, click: _callback, accelerator: process.platform == "darwin" ? "E" : "E" });
            menu.append(item);
            item = new Fudge.remote.MenuItem({
                label: "Physics Debug", submenu: [
                    { "label": "None", id: String(ƒ.PHYSICS_DEBUGMODE[0]), click: _callback },
                    { "label": "Colliders", id: String(ƒ.PHYSICS_DEBUGMODE[1]), click: _callback },
                    { "label": "Colliders and Joints (Default)", id: String(ƒ.PHYSICS_DEBUGMODE[2]), click: _callback },
                    { "label": "Bounding Boxes", id: String(ƒ.PHYSICS_DEBUGMODE[3]), click: _callback },
                    { "label": "Contacts", id: String(ƒ.PHYSICS_DEBUGMODE[4]), click: _callback },
                    { "label": "Only Physics", id: String(ƒ.PHYSICS_DEBUGMODE[5]), click: _callback }
                ]
            });
            menu.append(item);
            return menu;
        }
        contextMenuCallback(_item, _window, _event) {
            ƒ.Debug.info(`MenuSelect: Item-id=${_item.id}`);
            switch (_item.id) {
                case Fudge.TRANSFORM.TRANSLATE:
                case Fudge.TRANSFORM.ROTATE:
                case Fudge.TRANSFORM.SCALE:
                    Fudge.Page.setTransform(_item.id);
                    break;
                case ƒ.PHYSICS_DEBUGMODE[ƒ.PHYSICS_DEBUGMODE.NONE]:
                case ƒ.PHYSICS_DEBUGMODE[ƒ.PHYSICS_DEBUGMODE.COLLIDERS]:
                case ƒ.PHYSICS_DEBUGMODE[ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER]:
                case ƒ.PHYSICS_DEBUGMODE[ƒ.PHYSICS_DEBUGMODE.BOUNDING_BOXES]:
                case ƒ.PHYSICS_DEBUGMODE[ƒ.PHYSICS_DEBUGMODE.CONTACTS]:
                case ƒ.PHYSICS_DEBUGMODE[ƒ.PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY]:
                    this.viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE[_item.id];
                    this.redraw();
                    break;
            }
        }
        openContextMenu = (_event) => {
            if (!this.#pointerMoved)
                this.contextMenu.popup();
            this.#pointerMoved = false;
        };
        //#endregion
        hndDragOver(_event, _viewSource) {
            _event.dataTransfer.dropEffect = "none";
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
            this.dispatch(Fudge.EVENT_EDITOR.SELECT, { bubbles: true, detail: { graph: source } });
        }
        hndPrepare = (_event) => {
            let switchLight = (_event) => {
                let lightsPresent = false;
                ƒ.Render.lights.forEach((_array) => lightsPresent ||= _array.length > 0);
                this.setTitle(`${lightsPresent ? "RENDER" : "Render"} | ${this.graph.name}`);
                if (!lightsPresent)
                    ƒ.Render.addLights(this.nodeLight.getComponents(ƒ.ComponentLight));
                this.graph.removeEventListener("renderPrepareEnd" /* RENDER_PREPARE_END */, switchLight);
            };
            this.graph.addEventListener("renderPrepareEnd" /* RENDER_PREPARE_END */, switchLight);
        };
        hndEvent = (_event) => {
            switch (_event.type) {
                case Fudge.EVENT_EDITOR.SELECT:
                    let detail = _event.detail;
                    if (detail.node) {
                        this.cmrOrbit.mtxLocal.translation = detail.node.mtxWorld.translation;
                        ƒ.Render.prepare(this.cmrOrbit);
                    }
                    else
                        this.setGraph(_event.detail.graph);
                    break;
                // break;
                case Fudge.EVENT_EDITOR.ANIMATE:
                    if (_event instanceof Fudge.FudgeEvent && _event.detail.graph != this.graph)
                        break;
                case "mutate" /* MUTATE */:
                case "delete" /* DELETE */:
                case Fudge.EVENT_EDITOR.MODIFY:
                    this.redraw();
            }
        };
        hndPick = (_event) => {
            let picked = _event.detail.node;
            //TODO: watch out, two selects
            this.dispatch(Fudge.EVENT_EDITOR.SELECT, { bubbles: true, detail: { node: picked } });
            this.dom.dispatchEvent(new CustomEvent("itemselect" /* SELECT */, { bubbles: true, detail: { data: picked } }));
        };
        // private animate = (_e: Event) => {
        //   this.viewport.setGraph(this.graph);
        //   if (this.canvas.clientHeight > 0 && this.canvas.clientWidth > 0)
        //     this.viewport.draw();
        // }
        hndPointer = (_event) => {
            if (_event.type == "pointerdown") {
                this.#pointerMoved = false;
                return;
            }
            this.#pointerMoved ||= (_event.movementX != 0 || _event.movementY != 0);
            this.dom.focus({ preventScroll: true });
            let restriction;
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.X]))
                restriction = "x";
            else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.Y]))
                restriction = "z";
            else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.Z]))
                restriction = "y";
            if (!restriction)
                return;
            this.canvas.requestPointerLock();
            let data = {
                transform: Fudge.Page.modeTransform, restriction: restriction, x: _event.movementX, y: _event.movementY, camera: this.viewport.camera, inverted: _event.shiftKey
            };
            this.dispatch(Fudge.EVENT_EDITOR.TRANSFORM, { bubbles: true, detail: { transform: data } });
            this.redraw();
        };
        activeViewport = (_event) => {
            ƒ.Physics.activeInstance = Fudge.Page.getPhysics(this.graph);
            _event.cancelBubble = true;
        };
        redraw = () => {
            try {
                ƒ.Physics.activeInstance = Fudge.Page.getPhysics(this.graph);
                this.viewport.draw();
                // ƒ.Physics.connectJoints();
            }
            catch (_error) {
                //nop
            }
        };
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
        static mtrStandard = ViewPreview.createStandardMaterial();
        static meshStandard = ViewPreview.createStandardMesh();
        resource;
        viewport;
        cmrOrbit;
        previewNode;
        constructor(_container, _state) {
            super(_container, _state);
            // create viewport for 3D-resources
            let cmpCamera = new ƒ.ComponentCamera();
            // cmpCamera.pivot.translate(new ƒ.Vector3(1, 2, 1));
            // cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
            cmpCamera.projectCentral(1, 45);
            let canvas = ƒAid.Canvas.create(true, ƒAid.IMAGE_RENDERING.PIXELATED);
            this.viewport = new ƒ.Viewport();
            this.viewport.initialize("Preview", null, cmpCamera, canvas);
            this.cmrOrbit = ƒAid.Viewport.expandCameraToInteractiveOrbit(this.viewport, false);
            this.previewNode = this.createStandardGraph();
            this.fillContent();
            _container.on("resize", this.redraw);
            this.dom.addEventListener("itemselect" /* SELECT */, this.hndEvent);
            this.dom.addEventListener("mutate" /* MUTATE */, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.MODIFY, this.hndEvent, true);
            // this.dom.addEventListener(EVENT_EDITOR.SET_PROJECT, this.hndEvent);
            this.dom.addEventListener("contextmenu" /* CONTEXTMENU */, this.openContextMenu);
            // this.dom.addEventListener(ƒui.EVENT.RENAME, this.hndEvent);
        }
        static createStandardMaterial() {
            let mtrStandard = new ƒ.Material("StandardMaterial", ƒ.ShaderFlat, new ƒ.CoatRemissive(ƒ.Color.CSS("white")));
            ƒ.Project.deregister(mtrStandard);
            return mtrStandard;
        }
        static createStandardMesh() {
            let meshStandard = new ƒ.MeshSphere("Sphere", 20, 12);
            ƒ.Project.deregister(meshStandard);
            return meshStandard;
        }
        // #region  ContextMenu
        getContextMenu(_callback) {
            const menu = new Fudge.remote.Menu();
            let item;
            // item = new remote.MenuItem({ label: "Illuminate Graph", id: CONTEXTMENU[CONTEXTMENU.ILLUMINATE], checked: true, type: "checkbox", click: _callback });
            // menu.append(item);
            return menu;
        }
        contextMenuCallback(_item, _window, _event) {
            ƒ.Debug.info(`MenuSelect: Item-id=${_item.id}`);
            switch (_item.id) {
                // case CONTEXTMENU[CONTEXTMENU.ILLUMINATE]:
                //   this.illuminateGraph();
                //   break;
            }
        }
        //#endregion
        fillContent() {
            this.dom.innerHTML = "";
            if (!this.resource) {
                this.dom.innerHTML = "Select an internal or external resource to preview";
                this.setTitle("Preview");
                return;
            }
            let lightsPresent = true;
            //@ts-ignore
            let type = this.resource.type || "Function";
            if (this.resource instanceof ƒ.Mesh)
                type = "Mesh";
            // console.log(type);
            let previewObject = new ƒ.Node("PreviewObject");
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
                    previewObject.addComponent(new ƒ.ComponentMesh(this.resource));
                    previewObject.addComponent(new ƒ.ComponentMaterial(ViewPreview.mtrStandard));
                    this.setViewObject(previewObject);
                    this.resetCamera();
                    this.redraw();
                    break;
                case "Material":
                    previewObject.addComponent(new ƒ.ComponentMesh(ViewPreview.meshStandard));
                    previewObject.addComponent(new ƒ.ComponentMaterial(this.resource));
                    this.setViewObject(previewObject);
                    this.resetCamera();
                    this.redraw();
                    break;
                case "Graph":
                    ƒ.Project.createGraphInstance(this.resource).then((_instance) => {
                        previewObject.appendChild(_instance);
                        ƒ.Render.prepare(_instance);
                        lightsPresent = false;
                        ƒ.Render.lights.forEach((_array) => lightsPresent ||= _array.length > 0);
                        this.illuminate(!lightsPresent);
                        this.setTitle(`${lightsPresent ? "PREVIEW" : "Preview"} | ${this.resource.name}`);
                        this.redraw();
                    });
                    ƒ.Physics.activeInstance = Fudge.Page.getPhysics(this.resource);
                    this.setViewObject(previewObject);
                    previewObject.addEventListener("mutate" /* MUTATE */, (_event) => {
                        this.redraw();
                    });
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
            this.setTitle(`Preview | ${this.resource.name}`);
        }
        createStandardGraph() {
            let graph = new ƒ.Node("PreviewScene");
            this.viewport.setBranch(graph);
            let nodeLight = new ƒ.Node("PreviewIllumination");
            graph.addChild(nodeLight);
            ƒAid.addStandardLightComponents(nodeLight);
            this.dom.appendChild(this.viewport.getCanvas());
            let previewNode = new ƒ.Node("PreviewNode");
            graph.addChild(previewNode);
            return previewNode;
        }
        setViewObject(_node, _graphIllumination = false) {
            this.previewNode.removeAllChildren();
            this.previewNode.addChild(_node);
            this.illuminate(true);
            this.dom.appendChild(this.viewport.getCanvas());
        }
        illuminate(_on) {
            let nodeLight = this.viewport.getBranch()?.getChildrenByName("PreviewIllumination")[0];
            nodeLight.activate(_on);
            this.redraw();
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
        hndEvent = (_event) => {
            // console.log(_event.type);
            switch (_event.type) {
                // case EVENT_EDITOR.SET_PROJECT:
                //   this.resource = undefined;
                //   break;
                case "change" /* CHANGE */:
                case Fudge.EVENT_EDITOR.MODIFY:
                    if (this.resource instanceof ƒ.Audio || this.resource instanceof ƒ.Texture /*  || this.resource instanceof ƒ.Material */)
                        this.fillContent();
                case "mutate" /* MUTATE */:
                    this.redraw();
                    break;
                default:
                    if (!_event.detail)
                        this.resource = undefined;
                    else if (_event.detail.data instanceof Fudge.ScriptInfo)
                        this.resource = _event.detail.data.script;
                    else
                        this.resource = _event.detail.data;
                    this.fillContent();
                    break;
            }
        };
        resetCamera() {
            let branch = this.viewport.getBranch();
            ƒ.Render.prepare(branch);
            let r = branch.radius;
            this.cmrOrbit.mtxLocal.translation = ƒ.Vector3.ZERO();
            ƒ.Render.prepare(this.cmrOrbit);
            this.cmrOrbit.rotationX = -30;
            this.cmrOrbit.rotationY = 30;
            this.cmrOrbit.distance = r * 3;
            ƒ.Render.prepare(this.cmrOrbit);
        }
        redraw = () => {
            try {
                if (this.resource instanceof ƒ.Graph)
                    ƒ.Physics.activeInstance = Fudge.Page.getPhysics(this.resource);
                this.viewport.draw();
            }
            catch (_error) {
                //nop
            }
        };
    }
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
        resource;
        constructor(_container, _state) {
            super(_container, _state);
            this.fillContent();
            this.dom.addEventListener("itemselect" /* SELECT */, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.MODIFY, this.hndEvent, true);
            // this.dom.addEventListener(EVENT_EDITOR.SET_PROJECT, this.hndEvent);
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
                this.setTitle("Properties | " + this.resource.name);
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
            }
            else {
                this.setTitle("Properties");
                content.innerHTML = "Select an internal or external resource to examine properties";
            }
            this.dom.append(content);
        }
        hndEvent = (_event) => {
            switch (_event.type) {
                // case EVENT_EDITOR.SET_PROJECT:
                //   this.resource = undefined;
                //   break;
                case "itemselect" /* SELECT */:
                    // let detail: EventDetail = <EventDetail>_event.detail;
                    this.resource = (_event.detail.data);
                    break;
                default:
                    break;
            }
            this.fillContent();
        };
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
        // TODO: consider script namespaces ƒ.ScriptNamespaces to find all scripts not just ComponentScripts
        table;
        constructor(_container, _state) {
            super(_container, _state);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.SELECT, this.hndEvent);
            this.dom.addEventListener(Fudge.EVENT_EDITOR.MODIFY, this.hndEvent);
            // this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
        }
        listScripts() {
            this.dom.title = `Drag & drop scripts on "Components"`;
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
        // #region  ContextMenu
        // protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
        //   const menu: Electron.Menu = new remote.Menu();
        //   return menu;
        // }
        // protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
        //   ƒ.Debug.fudge(`MenuSelect | id: ${CONTEXTMENU[_item.id]} | event: ${_event}`);
        // }
        //#endregion
        hndEvent = (_event) => {
            switch (_event.type) {
                case Fudge.EVENT_EDITOR.SELECT:
                case Fudge.EVENT_EDITOR.MODIFY:
                    this.listScripts();
                    break;
                // case ƒui.EVENT.SELECT:
                //   console.log(_event.detail.data);
                //   break;
            }
        };
    }
    Fudge.ViewScript = ViewScript;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=Fudge.js.map