///<reference types="../../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../../node_modules/electron"/>
var DirectoryBrowser;
(function (DirectoryBrowser) {
    var ƒ = FudgeCore;
    const ipcRenderer = require("electron").ipcRenderer;
    const remote = require("electron").remote;
    const { readdirSync, Dirent } = require("fs");
    ipcRenderer.on("Open", (_event, _args) => {
        ƒ.Debug.log("openPanelGraph");
        console.log("Remote", remote);
        let paths = remote.dialog.showOpenDialogSync(null, { title: "Load Project", buttonLabel: "Load Project", properties: ["openDirectory"] });
        let entries = readdirSync(paths[0], { withFileTypes: true });
        let div = document.querySelector("div");
        div.innerHTML = "";
        for (let entry of entries) {
            ƒ.Debug.log(entry.name);
            div.innerHTML += entry.name + "<br/>";
        }
    });
})(DirectoryBrowser || (DirectoryBrowser = {}));
//# sourceMappingURL=DirectoryBrowser.js.map