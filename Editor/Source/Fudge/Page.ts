///<reference types="../../../node_modules/electron/Electron"/>
///<reference types="../../../Aid/Build/FudgeAid"/>
///<reference types="../../../UserInterface/Build/FudgeUserInterface"/>
// /<reference types="../../GoldenLayout/golden-layout" />
///<reference path="Project.ts"/>

namespace Fudge {
  import ƒ = FudgeCore;
  import ƒaid = FudgeAid;
  import ƒui = FudgeUserInterface;

  export const ipcRenderer: Electron.IpcRenderer = require("electron").ipcRenderer; // Replace with:
  export const remote: Electron.Remote = require("electron").remote;
  // TODO: use the following line instead in Electron version 14 and up
  // export const remote: Electron.Remote = require("@electron/remote");

  export let project: Project; // = new Project();

  export interface PanelInfo {
    type: string;
    state: PanelState;
  }

  /**
   * The uppermost container for all panels controlling data flow between. 
   * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class Page {
    public static goldenLayoutModule: ƒ.General = (globalThis as ƒ.General).goldenLayout;  // ƒ.General is synonym for any... hack to get GoldenLayout to work
    public static modeTransform: TRANSFORM = TRANSFORM.TRANSLATE;
    private static idCounter: number = 0;
    private static goldenLayout: GoldenLayout;
    private static panels: Panel[] = [];

    public static setDefaultProject(): void {
      if (project)
        localStorage.setItem("project", project.base.toString());
    }

    public static getPanelInfo(): string {
      let panelInfos: PanelInfo[] = [];
      for (let panel of Page.panels)
        panelInfos.push({ type: panel.constructor.name, state: panel.getState() });
      return JSON.stringify(panelInfos);
    }

    public static setPanelInfo(_panelInfos: string): void {
      Page.goldenLayout.clear();
      Page.panels = [];

      let panelInfos: PanelInfo[] = JSON.parse(_panelInfos);
      for (let panelInfo of panelInfos)
        Page.add(Fudge[panelInfo.type], panelInfo.state);
    }

    public static setTransform(_mode: TRANSFORM): void {
      Page.modeTransform = _mode;
      ƒ.Debug.fudge(`Transform mode: ${_mode}`);
    }

    // called by windows load-listener
    private static async start(): Promise<void> {
      // ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL | ƒ.DEBUG_FILTER.SOURCE);

      console.log("LocalStorage", localStorage);

      Page.setupGoldenLayout();
      ƒ.Project.mode = ƒ.MODE.EDITOR;

      Page.setupMainListeners();
      Page.setupPageListeners();
      // for testing:
      // ipcRenderer.emit(MENU.PANEL_PROJECT_OPEN);
      // ipcRenderer.emit(MENU.PANEL_GRAPH_OPEN);
      // ipcRenderer.emit(MENU.PROJECT_LOAD);
      ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PROJECT_SAVE, on: false });
      ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_PROJECT_OPEN, on: false });
      ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_GRAPH_OPEN, on: false });
      ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_HELP_OPEN, on: true });

      if (localStorage.project) {
        console.log("Load project referenced in local storage", localStorage.project);
        await Page.loadProject(new URL(localStorage.project));
      }
    }

    private static setupGoldenLayout(): void {
      Page.goldenLayout = new Page.goldenLayoutModule.GoldenLayout(); // GoldenLayout 2 as UMD-Module
      Page.goldenLayout.on("itemCreated", Page.hndPanelCreated);

      Page.goldenLayout.registerComponentConstructor(PANEL.PROJECT, PanelProject);
      Page.goldenLayout.registerComponentConstructor(PANEL.GRAPH, PanelGraph);
      Page.goldenLayout.registerComponentConstructor(PANEL.HELP, PanelHelp);

      Page.loadLayout();
    }

    private static add(_panel: typeof Panel, _state?: JsonValue): void {
      const panelConfig: RowOrColumnItemConfig = {
        type: "row",
        content: [
          {
            type: "component",
            componentType: _panel.name,
            componentState: _state,
            title: "Panel",
            id: Page.generateID(_panel.name)
          }
        ]
      };

      if (!Page.goldenLayout.rootItem)  // workaround because golden Layout loses rootItem...
        Page.loadLayout(); // TODO: these two lines appear to be obsolete, the condition is not met

      Page.goldenLayout.rootItem.layoutManager.addItemAtLocation(panelConfig, [{ typeId: LayoutManager.LocationSelector.TypeId.Root }]);
    }

    private static find(_type: typeof Panel): Panel[] {
      let result: Panel[] = [];
      result = Page.panels.filter((_panel) => { return _panel instanceof _type; });
      return result;
    }

    private static generateID(_name: string): string {
      return _name + Page.idCounter++;
    }

    private static loadLayout(): void {
      let config: LayoutConfig = {
        settings: { showPopoutIcon: false, showMaximiseIcon: true },
        root: {
          type: "row",
          isClosable: false,
          content: [
          ]
        }
      };
      Page.goldenLayout.loadLayout(config);
    }

    //#region Page-Events from DOM
    private static setupPageListeners(): void {
      document.addEventListener(EVENT_EDITOR.SET_GRAPH, Page.hndEvent);
      document.addEventListener(ƒui.EVENT.MUTATE, Page.hndEvent);
      document.addEventListener(EVENT_EDITOR.UPDATE, Page.hndEvent);
      document.addEventListener(EVENT_EDITOR.DESTROY, Page.hndEvent);
      document.addEventListener("keyup", Page.hndKey);
    }

    /** Send custom copies of the given event to the views */
    private static broadcastEvent(_event: Event): void {
      for (let panel of Page.panels) {
        let event: CustomEvent = new CustomEvent(_event.type, { bubbles: false, cancelable: true, detail: (<CustomEvent>_event).detail });
        panel.dom.dispatchEvent(event);
      }
    }

    private static hndKey = (_event: KeyboardEvent): void => {
      document.exitPointerLock();
      
      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.T:
          Page.setTransform(TRANSFORM.TRANSLATE);
          break;
        case ƒ.KEYBOARD_CODE.R:
          Page.setTransform(TRANSFORM.ROTATE);
          break;
        case ƒ.KEYBOARD_CODE.E:
          // TODO: don't switch to scale mode when using fly-camera and pressing E
          Page.setTransform(TRANSFORM.SCALE);
          break;
      }
    }

    private static hndEvent(_event: CustomEvent): void {
      // ƒ.Debug.fudge("Page received", _event.type, _event);
      
      switch (_event.type) {
        case EVENT_EDITOR.DESTROY:
          let view: View = _event.detail;
          if (view instanceof Panel)
            Page.panels.splice(Page.panels.indexOf(view), 1);
          console.log("Panels", Page.panels);
          break;
        case EVENT_EDITOR.SET_GRAPH:
          let panel: Panel[] = Page.find(PanelGraph);
          if (!panel.length)
            Page.add(PanelGraph, null);
        // break;
        default:
          Page.broadcastEvent(_event);
          break;
      }
    }
    //#endregion

    private static hndPanelCreated = (_event: EventEmitter.BubblingEvent): void => {
      let target: ComponentItem = _event.target as ComponentItem;
      if (target instanceof Page.goldenLayoutModule.ComponentItem) {
        Page.panels.push(<Panel>target.component);
      }
    }

    private static async loadProject(_url: URL): Promise<void> {
      Page.broadcastEvent(new CustomEvent(EVENT_EDITOR.CLEAR_PROJECT));
      await loadProject(_url);
      ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PROJECT_SAVE, on: true });
      ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_PROJECT_OPEN, on: true });
      ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_GRAPH_OPEN, on: true });
      Page.broadcastEvent(new CustomEvent(EVENT_EDITOR.SET_PROJECT));
    }

    //#region Main-Events from Electron
    private static setupMainListeners(): void {
      ipcRenderer.on(MENU.PROJECT_NEW, async (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
        ƒ.Project.clear();
        await newProject();
        ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PROJECT_SAVE, on: true });
        ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_PROJECT_OPEN, on: true });
        ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_GRAPH_OPEN, on: true });
        Page.broadcastEvent(new CustomEvent(EVENT_EDITOR.SET_PROJECT));
      });

      ipcRenderer.on(MENU.PROJECT_SAVE, (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
        saveProject();
        Page.setDefaultProject();
      });

      ipcRenderer.on(MENU.PROJECT_LOAD, async (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
        let url: URL = await promptLoadProject();
        if (!url)
          return;
        await Page.loadProject(url);
      });

      ipcRenderer.on(MENU.PANEL_GRAPH_OPEN, (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
        Page.add(PanelGraph, null);
        // Page.broadcastEvent(new CustomEvent(EVENT_EDITOR.UPDATE, { detail: node }));
      });

      ipcRenderer.on(MENU.PANEL_PROJECT_OPEN, (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
        Page.add(PanelProject, null);
      });

      ipcRenderer.on(MENU.PANEL_HELP_OPEN, (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
        Page.add(PanelHelp, null);
      });

      ipcRenderer.on(MENU.QUIT, (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
        Page.setDefaultProject();
      });

      ipcRenderer.on(MENU.PANEL_ANIMATION_OPEN, (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
        //   let panel: Panel = PanelManager.instance.createPanelFromTemplate(new ViewAnimationTemplate(), "Animation Panel");
        //   PanelManager.instance.addPanel(panel);
      });
    }
  }

  // function welcome(container: GoldenLayout.Container, state: Object): void {
  //   container.getElement().html("<div>Welcome</div>");
  // }
}