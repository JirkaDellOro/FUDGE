///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
///<reference path="../../../node_modules/electron/Electron.d.ts"/>

namespace Fudge {

    import ƒ = FudgeCore;
    const { ipcRenderer, remote } = require("electron");
    const fs: ƒ.General = require("fs");

    ƒ.RenderManager.initialize();

    // TODO: At this point of time, the project is just a single node. A project is much more complex...
    let node: ƒ.Node = null;
    // TODO: At this point of time, there is just a single panel. Support multiple panels

    window.addEventListener("load", initWindow);

    function initWindow(): void {
        ƒ.Debug.log("Fudge started");
        // TODO: create a new Panel containing a ViewData by default. More Views can be added by the user or by configuration

        ipcRenderer.on("save", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
            ƒ.Debug.log("Save");
            save(node);
        });
        ipcRenderer.on("open", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
            ƒ.Debug.log("Open");
            node = open();
        });
        ipcRenderer.on("openViewNode", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
            ƒ.Debug.log("OpenViewNode");
            openViewNode();
        });
        // HACK!
        ipcRenderer.on("updateNode", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
            ƒ.Debug.log("UpdateViewNode");
            
            // panel[0].viewContainers[0].emit("setRoot", node);
        });
    }

    function openViewNode(): void {
        let panel: Panel = PanelManager.instance.createEmptyPanel("Empty Test Penal");
        PanelManager.instance.addPanel(panel);
    }

    function save(_node: ƒ.Node): void {
        let serialization: ƒ.Serialization = ƒ.Serializer.serialize(_node);
        let content: string = ƒ.Serializer.stringify(serialization);

        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        let filename: string = remote.dialog.showSaveDialogSync(null, { title: "Save Branch", buttonLabel: "Save Branch", message: "ƒ-Message" });

        fs.writeFileSync(filename, content);
    }

    function open(): ƒ.Node {
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

    function initLayout(): GoldenLayout.Config {
        const config: GoldenLayout.Config = {
            content: [{
                type: "Stack",
                componentName: "rootStack"
            }]
        };
        return config;
    }
}