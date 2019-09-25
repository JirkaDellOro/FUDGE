///<reference path="../../Scenes/Scenes.ts"/>
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../node_modules/@types/node/fs"/>
// import * as fs from "fs";
// import dialog from "electron-remote";
var ElectronFileIo;
///<reference path="../../Scenes/Scenes.ts"/>
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../node_modules/@types/node/fs"/>
// import * as fs from "fs";
// import dialog from "electron-remote";
(function (ElectronFileIo) {
    var ƒ = FudgeCore;
    // import e = Electron;
    const { dialog } = require("electron").remote;
    const { ipcRenderer } = require("electron");
    const fs = require("fs");
    window.addEventListener("DOMContentLoaded", init);
    let branch;
    let viewport;
    function init() {
        viewport = createScene();
        ipcRenderer.on("save", (event, arg) => {
            save(branch);
        });
        ipcRenderer.on("open", (event, arg) => {
            let node = open();
            displayNode(node);
        });
    }
    function displayNode(_node) {
        if (!_node)
            return;
        ƒ.RenderManager.removeBranch(branch);
        branch = _node;
        viewport.setBranch(branch);
        viewport.draw();
    }
    function save(_node = branch) {
        let serialization = ƒ.Serializer.serialize(_node);
        let content = ƒ.Serializer.stringify(serialization);
        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        let filename = dialog.showSaveDialogSync(null, { title: "Save Branch", buttonLabel: "Save Branch", message: "ƒ-Message" });
        fs.writeFileSync(filename, content);
    }
    ElectronFileIo.save = save;
    function open() {
        // @ts-ignore
        let filenames = dialog.showOpenDialogSync(null, { title: "Load Branch", buttonLabel: "Load Branch", properties: ["openFile"] });
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
    ElectronFileIo.open = open;
    function createScene() {
        // create asset
        branch = Scenes.createAxisCross();
        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        // initialize viewport
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        cmpCamera.projectCentral(1, 45);
        let canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let viewport = new ƒ.Viewport();
        viewport.initialize("TestViewport", branch, cmpCamera, canvas);
        viewport.draw();
        return viewport;
    }
})(ElectronFileIo || (ElectronFileIo = {}));
//# sourceMappingURL=Window.js.map