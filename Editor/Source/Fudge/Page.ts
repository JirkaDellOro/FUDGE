///<reference types="../../../node_modules/electron/Electron"/>
///<reference types="../../../Aid/Build/FudgeAid"/>
///<reference types="../../../UserInterface/Build/FudgeUserInterface"/>
// /<reference types="../../GoldenLayout/golden-layout" />
///<reference path="Project.ts"/>

namespace Fudge {
  import ƒ = FudgeCore;
  import ƒaid = FudgeAid;
  import ƒui = FudgeUserInterface;

  export const ipcRenderer: Electron.IpcRenderer = require("electron").ipcRenderer;
  export const remote: Electron.Remote = require("electron").remote;

  export let project: Project; // = new Project();

  /**
   * The uppermost container for all panels controlling data flow between. 
   * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class Page {
    public static goldenLayoutModule: ƒ.General = (globalThis as ƒ.General).goldenLayout;  // ƒ.General is synonym for any... hack to get GoldenLayout to work
    private static idCounter: number = 0;
    private static goldenLayout: GoldenLayout;
    private static panels: Panel[] = [];

    private static async start(): Promise<void> {
      // ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL | ƒ.DEBUG_FILTER.SOURCE);
      // TODO: At this point of time, the project is just a single node. A project is much more complex...
      // let node: ƒ.Node = null;

      Page.setupGoldenLayout();
      ƒ.Project.mode = ƒ.MODE.EDITOR;
      // TODO: create a new Panel containing a ViewData by default. More Views can be added by the user or by configuration
      Page.setupMainListeners();
      Page.setupPageListeners();

      // for testing:
      // ipcRenderer.emit(MENU.PANEL_PROJECT_OPEN);
      // ipcRenderer.emit(MENU.PANEL_GRAPH_OPEN);
      // ipcRenderer.emit(MENU.PROJECT_LOAD);
      ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PROJECT_SAVE, on: false });
      ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_PROJECT_OPEN, on: false });
      ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_GRAPH_OPEN, on: false });
    }

    private static setupGoldenLayout(): void {
      Page.goldenLayout = new Page.goldenLayoutModule.GoldenLayout(); // GoldenLayout 2 as UMD-Module
      Page.goldenLayout.on("itemCreated", Page.hndPanelCreated);

      Page.goldenLayout.registerComponentConstructor(PANEL.PROJECT, PanelProject);
      Page.goldenLayout.registerComponentConstructor(PANEL.GRAPH, PanelGraph);

      Page.loadLayout();
    }

    private static add(_panel: typeof Panel, _title: string, _state?: JsonValue): void {
      const panelConfig: RowOrColumnItemConfig = {
        type: "row",
        content: [
          {
            type: "component",
            componentType: _panel.name,
            componentState: _state,
            title: _title,
            id: Page.generateID(_panel.name)
          }
        ]
      };


      if (!Page.goldenLayout.rootItem)  // workaround because golden Layout loses rootItem...
        Page.loadLayout();

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
          isClosable: true,
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
    }

    /** Send custom copies of the given event to the views */
    private static broadcastEvent(_event: Event): void {
      for (let panel of Page.panels) {
        let event: CustomEvent = new CustomEvent(_event.type, { bubbles: false, cancelable: true, detail: (<CustomEvent>_event).detail });
        panel.dom.dispatchEvent(event);
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
            Page.add(PanelGraph, "Graph", Object({ node: new ƒaid.NodeCoordinateSystem("WorldCooSys") }));
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
      console.log("Panels", Page.panels);
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
      });

      ipcRenderer.on(MENU.PROJECT_LOAD, async (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
        let url: URL = await promptLoadProject();
        if (!url)
          return;
        await loadProject(url);
        ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PROJECT_SAVE, on: true });
        ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_PROJECT_OPEN, on: true });
        ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.PANEL_GRAPH_OPEN, on: true });
        Page.broadcastEvent(new CustomEvent(EVENT_EDITOR.SET_PROJECT));
      });

      ipcRenderer.on(MENU.PANEL_GRAPH_OPEN, (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
        let node: ƒ.Node = new ƒaid.NodeCoordinateSystem("WorldCooSys");
        // funktioniert nicht
        Page.add(PanelGraph, "Graph", null);
        // Alternative
        //Page.add(PanelGraph, "Graph", "Platzhalter should be node"); 
        Page.broadcastEvent(new CustomEvent(EVENT_EDITOR.UPDATE, { detail: node }));
      });

      ipcRenderer.on(MENU.PANEL_PROJECT_OPEN, (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
        Page.add(PanelProject, "Project", null); //Object.create(null,  {node: { writable: true, value: node }}));
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