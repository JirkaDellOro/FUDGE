///<reference path="../../../node_modules/electron/Electron.d.ts"/>
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../Aid/Build/FudgeAid"/>
///<reference types="../../../UserInterface/Build/FudgeUserInterface"/>
// /<reference path="../Main.ts"/>

namespace Fudge {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  export const ipcRenderer: Electron.IpcRenderer = require("electron").ipcRenderer;
  export const remote: Electron.Remote = require("electron").remote;

  // TODO: At this point of time, the project is just a single node. A project is much more complex...
  let node: ƒ.Node = null;

  window.addEventListener("load", initWindow);

  /**
   * Set up listeners to receive events from the main menu and trigger the appropriate operations like opening panels
   */
  function initWindow(): void {
    ƒ.Debug.log("Fudge started");
    Editor.initialize();
    ƒ.Project.mode = ƒ.MODE.EDITOR;
    ƒ.Debug.log("Editor initialized");
    // TODO: create a new Panel containing a ViewData by default. More Views can be added by the user or by configuration

    ipcRenderer.on("save", (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
      ƒ.Debug.log("Save");
      // panel = PanelManager.instance.getActivePanel();
      // if (panel instanceof PanelGraph) {
      //   node = panel.getNode();
      // }
      // save(node);
    });

    ipcRenderer.on(MENU.PROJECT_OPEN, async (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
      node = await open();
      Editor.broadcastEvent(new CustomEvent(EVENT_EDITOR.SET_GRAPH, { detail: node }));
    });

    ipcRenderer.on(MENU.PANEL_GRAPH_OPEN, (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
      node = new ƒAid.NodeCoordinateSystem("WorldCooSys");
      let node2: ƒ.Node = new ƒAid.NodeCoordinateSystem("WorldCooSys", ƒ.Matrix4x4.IDENTITY());
      node.addChild(node2);
      node2.cmpTransform.local.translateZ(2);
      Editor.add(PanelGraph, "Graph", Object({ node: node })); //Object.create(null,  {node: { writable: true, value: node }}));
    });

    ipcRenderer.on(MENU.PANEL_PROJECT_OPEN, (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
      Editor.add(PanelProject, "Project", null); //Object.create(null,  {node: { writable: true, value: node }}));
    });

    ipcRenderer.on(MENU.PANEL_ANIMATION_OPEN, (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
      //   let panel: Panel = PanelManager.instance.createPanelFromTemplate(new ViewAnimationTemplate(), "Animation Panel");
      //   PanelManager.instance.addPanel(panel);
    });

    // HACK!
    ipcRenderer.on(MENU.NODE_UPDATE, (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
      ƒ.Debug.log("updateNode");
    });
  }
}