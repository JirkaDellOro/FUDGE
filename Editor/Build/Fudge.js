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
    })(VIEW = Fudge.VIEW || (Fudge.VIEW = {}));
    class Container {
        constructor() {
            if (Container.goldenLayout)
                // TODO: support multiple containers!
                return;
            Container.goldenLayout = new GoldenLayout(this.getLayout());
            // Container.goldenLayout.registerComponent(VIEW.DATA, createViewData);
            Container.goldenLayout.registerComponent(VIEW.DATA, Fudge.ViewData);
            Container.goldenLayout.init();
        }
        getLayout() {
            const config = {
                content: [{
                        type: "component",
                        componentName: VIEW.DATA,
                        title: "Data"
                    }]
            };
            return config;
        }
    }
    Fudge.Container = Container;
})(Fudge || (Fudge = {}));
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
    // At this point of time, the project is just a single node
    let node = null;
    window.addEventListener("DOMContentLoaded", initWindow);
    function initWindow() {
        ƒ.Debug.log("Fudge started");
        let view = new Fudge.Container();
        // let view2: Container = new Container();
        ipcRenderer.on("save", (_event, _args) => {
            ƒ.Debug.log("Save");
            ipcRenderer.send("getNode");
            ƒ.Debug.log("Save done");
            // save(branch);
        });
        ipcRenderer.on("open", (_event, _args) => {
            ƒ.Debug.log("Open");
            this.node = open();
        });
        ipcRenderer.on("sendNode", (_event, _args) => {
            ƒ.Debug.log("SendNode");
            let viewNodeId = Number(_args[0]);
            console.log(viewNodeId);
            ipcRenderer.sendTo(viewNodeId, "display", node);
        });
    }
})(Fudge || (Fudge = {}));
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
(function (Fudge) {
    function createViewData(container, state) {
        let lblName = document.createElement("label");
        lblName.innerHTML = "Node Name";
        let txtName = document.createElement("input");
        txtName.value = "Hallo";
        container.getElement().append(lblName);
        container.getElement().append(txtName);
    }
    Fudge.createViewData = createViewData;
    class ViewData {
        constructor(container, state) {
            let lblName = document.createElement("label");
            lblName.innerHTML = "Node Name";
            let txtName = document.createElement("input");
            txtName.value = "Hallo";
            container.getElement().append(lblName);
            container.getElement().append(txtName);
        }
        static getLayout() {
            const config = {
                content: [{
                        type: "component",
                        componentName: Fudge.VIEW.DATA,
                        title: "Data"
                    }]
            };
            return config;
        }
    }
    Fudge.ViewData = ViewData;
})(Fudge || (Fudge = {}));
// ///<reference types="../../../Core/Build/FudgeCore"/>
// ///<reference types="../../Examples/Code/Scenes"/>
// namespace FudgeViewNode {
//     import ƒ = FudgeCore;
//     const { ipcRenderer } = require("electron");
//     window.addEventListener("load", initWindow);
//     let myLayout: GoldenLayout;
//     let savedState: string;
//     let branch: ƒ.Node;
//     let canvas: HTMLCanvasElement;
//     let viewport: ƒ.Viewport = new ƒ.Viewport();
//     let camera: ƒ.Node;
//     function initWindow(): void {
//         ƒ.Debug.log("FudgeViewNode started");
//         createScene();
//         myLayout = new GoldenLayout(getLayout());
//         myLayout.registerComponent("Viewport", createViewportComponent);
//         myLayout.registerComponent("Inspector", createInspectorComponent);
//         myLayout.init();
//         ipcRenderer.addListener("update", (_event: Electron.IpcRendererEvent) => {
//             ƒ.Debug.info("Update");
//             ipcRenderer.send("getNode");
//         });
//         ipcRenderer.addListener("display", (_event: Electron.IpcRendererEvent, _node: ƒ.Node) => {
//             ƒ.Debug.info("Display");
//             displayNode(_node);
//         });
//     }
//     function displayNode(_node: ƒ.Node): void {
//         if (!_node)
//             return;
//         ƒ.Debug.log("Trying to display node: ", _node);
//         ƒ.RenderManager.removeBranch(branch);
//         branch = _node;
//         viewport.setBranch(branch);
//         viewport.draw();
//     }
//     function createViewportComponent(container: GoldenLayout.Container, state: Object): void {
//         container.getElement().append(canvas);
//     }
//     function createInspectorComponent(container: GoldenLayout.Container, state: Object): void {
//         console.log(branch.getChildren()[0].name);
//         let lblName: HTMLElement = document.createElement("label");
//         lblName.innerHTML = "Node Name";
//         let txtName: HTMLInputElement = document.createElement("input");
//         txtName.value = <string>branch.getChildren()[0].name;
//         container.getElement().append(lblName);
//         container.getElement().append(txtName);
//     }
//     function getLayout(): GoldenLayout.Config {
//         const config: GoldenLayout.Config = {
//             content: [{
//                 type: "row",
//                 content: [{
//                     type: "component",
//                     componentName: "Inspector",
//                     title: "Inspector"
//                 },
//                 {
//                     type: "component",
//                     componentName: "Viewport",
//                     title: "Viewport"
//                 }
//                 ]
//             }]
//         };
//         return config;
//     }
//     // TODO: remove this. Only here for testing in order not to start with an empty viewport
//     function createScene(): void {
//         // create asset
//         branch = Scenes.createAxisCross();
//         // initialize RenderManager and transmit content
//         ƒ.RenderManager.initialize();
//         ƒ.RenderManager.addBranch(branch);
//         ƒ.RenderManager.update();
//         // initialize viewport
//         camera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
//         let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
//         cmpCamera.projectCentral(1, 45);
//         canvas = Scenes.createCanvas();
//         document.body.appendChild(canvas);
//         viewport = new ƒ.Viewport();
//         viewport.initialize("TestViewport", branch, cmpCamera, canvas);
//         viewport.draw();
//     } 
// }
// ///<reference types="../../../Core/Build/FudgeCore"/>
// ///<reference types="../../Examples/Code/Scenes"/>
// namespace FudgeViewProject {
//     enum VIEW {
//         PROJECT = "viewProject",
//         NODE = "viewNode",
//         ANIMATION = "viewAnimation",
//         SKETCH = "viewSketch",
//         MESH = "viewMesh"
//     }
//     import ƒ = FudgeCore;
//     const { ipcRenderer, remote } = require("electron");
//     const fs: ƒ.General = require("fs");
//     // At this point of time, the project is just a single node
//     let node: ƒ.Node = null;
//     window.addEventListener("DOMContentLoaded", initWindow);
//     function initWindow(): void {
//         ƒ.Debug.log("FudgeViewProject started");
//         ipcRenderer.on("save", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
//             ƒ.Debug.log("Save");
//             ipcRenderer.send("getNode");
//             ƒ.Debug.log("Save done");
//             // save(branch);
//         });
//         ipcRenderer.on("open", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
//             ƒ.Debug.log("Open");
//             node = open();
//         });
//         ipcRenderer.on("sendNode", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
//             ƒ.Debug.log("SendNode");
//             let viewNodeId: number = Number(_args[0]);
//             console.log(viewNodeId);
//             ipcRenderer.sendTo(viewNodeId, "display", node);
//         });
//     }
//     export function save(_node: ƒ.Node): void {
//         let serialization: ƒ.Serialization = ƒ.Serializer.serialize(_node);
//         let content: string = ƒ.Serializer.stringify(serialization);
//         // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
//         let filename: string = remote.dialog.showSaveDialogSync(null, { title: "Save Branch", buttonLabel: "Save Branch", message: "ƒ-Message" });
//         fs.writeFileSync(filename, content);
//     }
//     export function open(): ƒ.Node {
//         // @ts-ignore
//         let filenames: string[] = remote.dialog.showOpenDialogSync(null, { title: "Load Branch", buttonLabel: "Load Branch", properties: ["openFile"] });
//         let content: string = fs.readFileSync(filenames[0], { encoding: "utf-8" });
//         console.groupCollapsed("File content");
//         ƒ.Debug.log(content);
//         console.groupEnd();
//         let serialization: ƒ.Serialization = ƒ.Serializer.parse(content);
//         let node: ƒ.Node = <ƒ.Node>ƒ.Serializer.deserialize(serialization);
//         console.groupCollapsed("Deserialized");
//         console.log(node);
//         console.groupEnd();
//         return node;
//     }
// }
//# sourceMappingURL=Fudge.js.map