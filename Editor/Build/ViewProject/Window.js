///<reference types="../../../Core/Build/Fudge"/>
///<reference types="../../Examples/Code/Scenes"/>
var FudgeEditorProject;
///<reference types="../../../Core/Build/Fudge"/>
///<reference types="../../Examples/Code/Scenes"/>
(function (FudgeEditorProject) {
    var ƒ = Fudge;
    const { dialog } = require("electron").remote;
    const { ipcRenderer } = require("electron");
    const fs = require("fs");
    window.addEventListener("DOMContentLoaded", initWindow);
    function initWindow() {
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
    function save(_node) {
        let serialization = ƒ.Serializer.serialize(_node);
        let content = ƒ.Serializer.stringify(serialization);
        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        let filename = dialog.showSaveDialogSync(null, { title: "Save Branch", buttonLabel: "Save Branch", message: "ƒ-Message" });
        fs.writeFileSync(filename, content);
    }
    FudgeEditorProject.save = save;
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
    FudgeEditorProject.open = open;
})(FudgeEditorProject || (FudgeEditorProject = {}));
//# sourceMappingURL=Window.js.map