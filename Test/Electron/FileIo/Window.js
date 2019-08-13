///<reference path="../../Scenes/Scenes.ts"/>
///<reference path="../../../Core/Build/Fudge.d.ts"/>
///<reference path="../../node_modules/@types/fs.d.ts"/>
// import fs from "fs";
// import dialog from "electron-remote";
var ElectronFileIo;
///<reference path="../../Scenes/Scenes.ts"/>
///<reference path="../../../Core/Build/Fudge.d.ts"/>
///<reference path="../../node_modules/@types/fs.d.ts"/>
// import fs from "fs";
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
        save(branch);
    }
    function save(_node) {
        let content = "Some text to save into the file";
        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        let filename = dialog.showSaveDialogSync(null, { title: "ƒ-Title", buttonLabel: "ƒ-Button", message: "ƒ-Message" });
        console.log("Chosen: ", filename);
        fs.writeFile(filename, "Hello World!", (_e) => { console.log(_e); });
        // fileName is a string that contains the path and filename created in the save file dialog.  
        //     fs.writeFile(fileName, content, (err) => {
        //     if (err) {
        //         alert("An error ocurred creating the file " + err.message)
        //     }
        //     alert("The file has been succesfully saved");
        // });
    }
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