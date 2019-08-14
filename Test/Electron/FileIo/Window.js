///<reference path="../../Scenes/Scenes.ts"/>
///<reference types="../../../Core/Build/Fudge"/>
///<reference types="../../../node_modules/@types/node/fs"/>
// import * as fs from "fs";
// import dialog from "electron-remote";
var ElectronFileIo;
///<reference path="../../Scenes/Scenes.ts"/>
///<reference types="../../../Core/Build/Fudge"/>
///<reference types="../../../node_modules/@types/node/fs"/>
// import * as fs from "fs";
// import dialog from "electron-remote";
(function (ElectronFileIo) {
    var ƒ = Fudge;
    // import e = Electron;
    const { dialog } = require("electron").remote;
    const fs = require("fs");
    window.addEventListener("DOMContentLoaded", init);
    let branch;
    function init() {
        createScene();
    }
    function save(_node = branch) {
        let serialization = ƒ.Serializer.serialize(_node);
        let content = ƒ.Serializer.stringify(serialization);
        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        let filename = dialog.showSaveDialogSync(null, { title: "Save Branch", buttonLabel: "Save Branch", message: "ƒ-Message" });
        fs.writeFile(filename, content, (_e) => {
            if (_e)
                ƒ.Debug.log(_e);
        });
    }
    ElectronFileIo.save = save;
    function load() {
        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        dialog.showOpenDialogSync(null, { title: "Load Branch", buttonLabel: "Load Branch", properties: ["openFile"] });
        // fs.writeFile(filename, content, (_e: Error) => {
        //     if (_e)
        //         ƒ.Debug.log(_e);
        // });
        // let serialization: ƒ.Serialization = ƒ.Serializer.serialize(_node);
        // let content: string = ƒ.Serializer.stringify(serialization);
        return null;
    }
    ElectronFileIo.load = load;
    function createScene() {
        // create asset
        branch = Scenes.createAxisCross();
        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();
        // initialize viewport
        let camera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
        cmpCamera.projectCentral(1, 45);
        let canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let viewPort = new ƒ.Viewport();
        viewPort.initialize("TestViewport", branch, cmpCamera, canvas);
        viewPort.draw();
    }
})(ElectronFileIo || (ElectronFileIo = {}));
//# sourceMappingURL=Window.js.map