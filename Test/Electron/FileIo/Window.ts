///<reference path="../../Scenes/Scenes.ts"/>
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../node_modules/@types/node/fs"/>

// import * as fs from "fs";
// import dialog from "electron-remote";
namespace ElectronFileIo {
    import ƒ = FudgeCore;
    // import e = Electron;
    const { dialog } = require("electron").remote;
    const { ipcRenderer } = require("electron");
    const fs: ƒ.General = require("fs");
    window.addEventListener("DOMContentLoaded", init);
    let branch: ƒ.Node;
    let viewport: ƒ.Viewport;

    function init(): void {
        viewport = createScene();
        ipcRenderer.on("save", (event, arg) => {
            save(branch);
        });
        ipcRenderer.on("open", (event, arg) => {
            let node: ƒ.Node = open();
            displayNode(node);
        });
    }

    function displayNode(_node: ƒ.Node): void {
        if (!_node)
            return;

        ƒ.RenderManager.removeBranch(branch);
        branch = _node;
        viewport.setBranch(branch);
        viewport.draw();
    }

    export function save(_node: ƒ.Node = branch): void {
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

    function createScene(): ƒ.Viewport {
        // create asset
        branch = Scenes.createAxisCross();

        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();

        // initialize viewport
        let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        cmpCamera.projectCentral(1, 45);
        let canvas: HTMLCanvasElement = Scenes.createCanvas();
        document.body.appendChild(canvas);

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        viewport.initialize("TestViewport", branch, cmpCamera, canvas);
        viewport.draw();

        return viewport;
    }
}