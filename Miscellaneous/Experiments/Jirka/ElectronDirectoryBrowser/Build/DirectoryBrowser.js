var DirectoryBrowser;
(function (DirectoryBrowser) {
    var ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    const ipcRenderer = require("electron").ipcRenderer;
    const remote = require("electron").remote;
    // const { readdirSync } = require("fs");
    ipcRenderer.on("Open", (_event, _args) => {
        ƒ.Debug.log("openPanelGraph");
        console.log("Remote", remote);
        let paths = remote.dialog.showOpenDialogSync(null, { title: "Load Project", buttonLabel: "Load Project", properties: ["openDirectory"] });
        console.log(paths[0]);
        let root = DirectoryBrowser.DirectoryEntry.createRoot(paths[0]);
        // root.dirent["type"] = 2;
        // console.log(root, root.isFile, root.dirent[Symbol("type")]);
        console.log(root.getContent());
        let div = document.querySelector("div");
        div.innerHTML = "";
        let tree = new ƒUi.Tree(new DirectoryBrowser.TreeControllerDirectory(), root);
        div.appendChild(tree);
    });
})(DirectoryBrowser || (DirectoryBrowser = {}));
//# sourceMappingURL=DirectoryBrowser.js.map