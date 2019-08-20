///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
///<reference path="../../../node_modules/electron/Electron.d.ts"/>

namespace Fudge {

    import ƒ = FudgeCore;
    const { ipcRenderer, remote } = require("electron");
    const fs: ƒ.General = require("fs");

    // At this point of time, the project is just a single node
    let node: ƒ.Node = null;

    window.addEventListener("DOMContentLoaded", initWindow);

    function initWindow(): void {
        ƒ.Debug.log("Fudge started");
        let view: Container = new Container();
        // let view2: Container = new Container();

        ipcRenderer.on("save", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
            ƒ.Debug.log("Save");
            ipcRenderer.send("getNode");
            ƒ.Debug.log("Save done");
            // save(branch);
        });
        ipcRenderer.on("open", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
            ƒ.Debug.log("Open");
            this.node = open();
        });
        ipcRenderer.on("sendNode", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
            ƒ.Debug.log("SendNode");
            let viewNodeId: number = Number(_args[0]);
            console.log(viewNodeId);
            ipcRenderer.sendTo(viewNodeId, "display", node);
        });
    }
}