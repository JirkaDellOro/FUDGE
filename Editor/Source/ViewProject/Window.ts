///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>

namespace FudgeEditorProject {
    import ƒ = FudgeCore;
    const { dialog } = require("electron").remote;
    const { ipcRenderer } = require("electron");
    const fs: ƒ.General = require("fs");

    window.addEventListener("DOMContentLoaded", initWindow);

    function initWindow(): void {
        ƒ.Debug.log("FudgeEditorProject started");
        ipcRenderer.on("save", (event, arg) => {
            ƒ.Debug.log("Save");

            // save(branch);
        });
        ipcRenderer.on("open", (event, arg) => {
            ƒ.Debug.log("Open");
            // let node: ƒ.Node = open();
            ipcRenderer.send("openEditor", "EDITOR_NODE");
            // displayNode(node);
        });
    }

    // function displayNode(_node: ƒ.Node): void {
    //     if (!_node)
    //         return;

    //     ƒ.RenderManager.removeBranch(branch);
    //     branch = _node;
    //     viewport.setBranch(branch);
    //     viewport.draw();
    // }

    export function save(_node: ƒ.Node): void {
        let serialization: ƒ.Serialization = ƒ.Serializer.serialize(_node);
        let content: string = ƒ.Serializer.stringify(serialization);

        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        let filename: string = dialog.showSaveDialogSync(null, { title: "Save Branch", buttonLabel: "Save Branch", message: "ƒ-Message" });

        fs.writeFileSync(filename, content);
    }

    export function open(): ƒ.Node {
        // @ts-ignore
        let filenames: string[] = dialog.showOpenDialogSync(null, { title: "Load Branch", buttonLabel: "Load Branch", properties: ["openFile"] });

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