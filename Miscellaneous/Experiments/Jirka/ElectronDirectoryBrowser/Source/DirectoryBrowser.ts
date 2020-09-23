namespace DirectoryBrowser {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;
  const ipcRenderer: Electron.IpcRenderer = require("electron").ipcRenderer;
  const remote: Electron.Remote = require("electron").remote;
  // const { readdirSync } = require("fs");

  ipcRenderer.on("Open", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
    ƒ.Debug.log("openPanelGraph");
    console.log("Remote", remote);

    let paths: string[] = remote.dialog.showOpenDialogSync(null, { title: "Load Project", buttonLabel: "Load Project", properties: ["openDirectory"] });
    console.log(paths[0]);
    let root: DirectoryEntry = DirectoryEntry.createRoot(paths[0]);
    // root.dirent["type"] = 2;
    // console.log(root, root.isFile, root.dirent[Symbol("type")]);
    console.log(root.getContent());

    let div: HTMLDivElement = document.querySelector("div");
    div.innerHTML = "";

    let tree: ƒUi.Tree<DirectoryEntry> = new ƒUi.Tree<DirectoryEntry>(new TreeControllerDirectory(), root);
    div.appendChild(tree);
  });
}