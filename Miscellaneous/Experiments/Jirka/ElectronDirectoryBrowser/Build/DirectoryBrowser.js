var DirectoryBrowser;
(function (DirectoryBrowser) {
    var ƒ = FudgeCore;
    const ipcRenderer = require("electron").ipcRenderer;
    const remote = require("electron").remote;
    const { readdirSync } = require("fs");
    ipcRenderer.on("Open", (_event, _args) => {
        ƒ.Debug.log("openPanelGraph");
        console.log("Remote", remote);
        let paths = remote.dialog.showOpenDialogSync(null, { title: "Load Project", buttonLabel: "Load Project", properties: ["openDirectory"] });
        let entries = readdirSync(paths[0], { withFileTypes: true });
        let div = document.querySelector("div");
        div.innerHTML = "";
        for (let entry of entries) {
            ƒ.Debug.log(entry);
            div.innerHTML += (entry.isDirectory() ? "+" : "") + entry.name + "<br/>";
        }
    });
})(DirectoryBrowser || (DirectoryBrowser = {}));
export {};
//# sourceMappingURL=DirectoryBrowser.js.map