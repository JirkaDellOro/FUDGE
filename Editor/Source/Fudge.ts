///<reference types="../../Core/Build/FudgeCore"/>
///<reference types="../Examples/Code/Scenes"/>

namespace Fudge {

    enum VIEW {
        PROJECT = "viewProject",
        NODE = "viewNode",
        ANIMATION = "viewAnimation",
        SKETCH = "viewSketch",
        MESH = "viewMesh"
    }

    import ƒ = FudgeCore;
    const { ipcRenderer, remote } = require("electron");
    const fs: ƒ.General = require("fs");
    let goldenLayout: GoldenLayout;

    // At this point of time, the project is just a single node
    let node: ƒ.Node = null;

    window.addEventListener("DOMContentLoaded", initWindow);

    function initWindow(): void {
        ƒ.Debug.log("Fudge started");
        goldenLayout = new GoldenLayout(getLayout());
        goldenLayout.registerComponent("ViewData", createViewComponent);
        goldenLayout.init();

        ipcRenderer.on("save", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
            ƒ.Debug.log("Save");
            ipcRenderer.send("getNode");
            ƒ.Debug.log("Save done");
            // save(branch);
        });
        ipcRenderer.on("open", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
            ƒ.Debug.log("Open");
            node = open();
        });
        ipcRenderer.on("sendNode", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
            ƒ.Debug.log("SendNode");
            let viewNodeId: number = Number(_args[0]);
            console.log(viewNodeId);
            ipcRenderer.sendTo(viewNodeId, "display", node);
        });
    }

    function getLayout(): GoldenLayout.Config {
        const config: GoldenLayout.Config = {
            content: [{
                type: "component",
                componentName: "ViewData",
                title: "Data"
            }]
        };
        return config;
    }

    function createViewComponent(container: GoldenLayout.Container, state: Object): void {
        let lblName: HTMLElement = document.createElement("label");
        lblName.innerHTML = "Node Name";
        let txtName: HTMLInputElement = document.createElement("input");
        txtName.value = "Hallo";
        container.getElement().append(lblName);
        container.getElement().append(txtName);
    }


    export function save(_node: ƒ.Node): void {
        let serialization: ƒ.Serialization = ƒ.Serializer.serialize(_node);
        let content: string = ƒ.Serializer.stringify(serialization);

        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        let filename: string = remote.dialog.showSaveDialogSync(null, { title: "Save Branch", buttonLabel: "Save Branch", message: "ƒ-Message" });

        fs.writeFileSync(filename, content);
    }

    export function open(): ƒ.Node {
        // @ts-ignore
        let filenames: string[] = remote.dialog.showOpenDialogSync(null, { title: "Load Branch", buttonLabel: "Load Branch", properties: ["openFile"] });

        let content: string = fs.readFileSync(filenames[0], { encoding: "utf-8" });
        console.groupCollapsed("File content");
        ƒ.Debug.log(content);
        console.groupEnd();

        let serialization: ƒ.Serialization = ƒ.Serializer.parse(content);
        let node: ƒ.Node = <ƒ.Node>ƒ.Serializer.deserialize(serialization);

        console.groupCollapsed("Deserialized");
        console.log(node);
        console.groupEnd();

        return node;
    }
}