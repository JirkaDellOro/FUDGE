///<reference path="../../Scenes/Scenes.ts"/>
///<reference path="../../../Core/Build/Fudge.d.ts"/>
namespace ElectronFileIo {
    import fudge = Fudge;
    const { dialog } = require("electron").remote;
    window.addEventListener("DOMContentLoaded", init);

    let branch: ƒ.Node;

    function init(): void {
        createScene();
        save(branch);
    }

    function save(_node: ƒ.Node): void {
        let content: string = "Some text to save into the file";

        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        dialog.showSaveDialog(null, { title: "Load Fudge-Somthing" });
        // dialog.showOpenDialog(null, { properties: ["multiSelections"] });

        // fileName is a string that contains the path and filename created in the save file dialog.  
        //     fs.writeFile(fileName, content, (err) => {
        //     if (err) {
        //         alert("An error ocurred creating the file " + err.message)
        //     }

        //     alert("The file has been succesfully saved");
        // });
    }

    function createScene(): void {
        // create asset
        branch = Scenes.createAxisCross();

        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        // initialize viewport
        let camera: ƒ.Node = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
        cmpCamera.projectCentral(1, 45);
        let canvas: HTMLCanvasElement = Scenes.createCanvas();
        document.body.appendChild(canvas);

        let viewPort: ƒ.Viewport = new ƒ.Viewport();
        viewPort.initialize("TestViewport", branch, cmpCamera, canvas);
        viewPort.draw();
    }
}