///<reference path="../../../node_modules/electron/Electron.d.ts"/>
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../Aid/Build/FudgeAid"/>
///<reference types="../../../UserInterface/Build/FudgeUserInterface"/>

namespace Fudge {

  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  export const ipcRenderer: Electron.IpcRenderer = require("electron").ipcRenderer;
  export const remote: Electron.Remote = require("electron").remote;
  const fs: ƒ.General = require("fs");

  // TODO: At this point of time, the project is just a single node. A project is much more complex...
  let node: ƒ.Node = null;
  // TODO: At this point of time, there is just a single panel. Support multiple panels
  let panel: Panel = null;


  window.addEventListener("load", initWindow);

  function initWindow(): void {
    ƒ.Debug.log("Fudge started");
    PanelManager.instance.init();
    console.log("Panel Manager initialized");
    // TODO: create a new Panel containing a ViewData by default. More Views can be added by the user or by configuration

    ipcRenderer.on("save", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
      ƒ.Debug.log("Save");
      panel = PanelManager.instance.getActivePanel();
      if (panel instanceof PanelNode) {
        node = panel.getNode();
      }
      save(node);
    });
    ipcRenderer.on("open", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
      ƒ.Debug.log("Open");
      node = open();
      panel = PanelManager.instance.getActivePanel();
      if (panel instanceof PanelNode) {
        panel.setNode(node);
      }
    });
    ipcRenderer.on("openViewNode", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
      ƒ.Debug.log("OpenViewNode");
      openViewNode();
    });
    ipcRenderer.on("openAnimationPanel", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
      ƒ.Debug.log("Open Animation Panel");
      // openAnimationPanel();
    });
    // HACK!
    ipcRenderer.on("updateNode", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
      ƒ.Debug.log("UpdateViewNode");

    });
  }

  function openViewNode(): void {
    node = new ƒAid.NodeCoordinateSystem("WorldCooSys");
    let node2: ƒ.Node = new ƒAid.NodeCoordinateSystem("WorldCooSys", ƒ.Matrix4x4.IDENTITY());
    node.addChild(node2);
    node2.cmpTransform.local.translateZ(2);
    let nodePanel: PanelNode = new PanelNode("Node Panel", new NodePanelTemplate, node);
    PanelManager.instance.addPanel(nodePanel);
  }

  // function openAnimationPanel(): void {
  //   let panel: Panel = PanelManager.instance.createPanelFromTemplate(new ViewAnimationTemplate(), "Animation Panel");
  //   PanelManager.instance.addPanel(panel);
  // }

  function save(_node: ƒ.Node): void {
    let serialization: ƒ.Serialization = ƒ.Serializer.serialize(_node);
    let content: string = ƒ.Serializer.stringify(serialization);

    // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
    let filename: string = remote.dialog.showSaveDialogSync(null, { title: "Save Graph", buttonLabel: "Save Graph", message: "ƒ-Message" });

    fs.writeFileSync(filename, content);
  }

  function open(): ƒ.Node {
    let filenames: string[] = remote.dialog.showOpenDialogSync(null, { title: "Load Graph", buttonLabel: "Load Graph", properties: ["openFile"] });

    let content: string = fs.readFileSync(filenames[0], { encoding: "utf-8" });
    console.groupCollapsed("File content");
    ƒ.Debug.log(content);
    console.groupEnd();

    let serialization: ƒ.Serialization = ƒ.Serializer.parse(content);
    let node: ƒ.Node = <ƒ.Node>ƒ.Serializer.deserialize(serialization);

    console.groupCollapsed("Deserialized");
    console.log(node);
    console.groupEnd();

    return node;
  }

}