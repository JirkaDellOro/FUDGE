///<reference types="../../../node_modules/electron/Electron"/>
///<reference types="../../../Aid/Build/FudgeAid"/>
///<reference types="../../../UserInterface/Build/FudgeUserInterface"/>
/// <reference types="../../GoldenLayoutBundle/bundle/umd/golden-layout" />
///<reference path="Project.ts"/>

namespace Fudge {
  import ƒ = FudgeCore;
  import ƒaid = FudgeAid;
  import ƒui = FudgeUserInterface;

  export const ipcRenderer: Electron.IpcRenderer = require("electron").ipcRenderer;
  export const remote: Electron.Remote = require("electron").remote;

  export let project: Project = new Project();

  /**
   * The uppermost container for all panels controlling data flow between. 
   * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class Page {
    private static idCounter: number = 0;
    public static goldenLayoutModule = (globalThis as any).goldenLayout;
    private static goldenLayout: GoldenLayout;
    private static panels: Panel[] = [];

    public static async start(): Promise<void> {
      // TODO: At this point of time, the project is just a single node. A project is much more complex...
      let node: ƒ.Node = null;

      Page.setupGoldenLayout();
      ƒ.Project.mode = ƒ.MODE.EDITOR;
      // TODO: create a new Panel containing a ViewData by default. More Views can be added by the user or by configuration
      Page.setupMainListeners();
      Page.setupPageListeners();

      // for testing:
      ipcRenderer.emit(MENU.PANEL_PROJECT_OPEN);
      ipcRenderer.emit(MENU.PANEL_GRAPH_OPEN);
      // ipcRenderer.emit(MENU.PROJECT_LOAD);
    }

    public static setupGoldenLayout(): void {

      //old root config 
      let config_old: any = {
        settings: { showPopoutIcon: false },
        content: [{
          id: "root", type: "row", isClosable: false,
          content: [
            // { type: "component", componentName: "Welcome", title: "Welcome", componentState: {} }
          ]
        }]
      };

      let config: LayoutConfig = {
        root: {
          type: "row",
          isClosable: true,
          content: [
            //   {
            //       type: "component",
            //       componentType: PANEL.GRAPH,
            //       content: []
            //   },

            //   {
            //     type: "component",
            //     componentType: PANEL.PROJECT,
            //     content: []
            // },
          ],
        }
      }




      //this.goldenLayout = new GoldenLayout();   //This might be a problem because it can't use a specific place to put it.
      this.goldenLayout = new this.goldenLayoutModule.GoldenLayout(); // GoldenLayout 2 as UMD-Module
      
      // Old registerComponent methods
      // this.goldenLayout.registerComponent("Welcome", welcome);
      // this.goldenLayout.registerComponent(PANEL.GRAPH, PanelGraph);
      // this.goldenLayout.registerComponent(PANEL.PROJECT, PanelProject);
      // this.goldenLayout.init();

      this.goldenLayout.registerComponentConstructor(PANEL.PROJECT, PanelProject);
      this.goldenLayout.registerComponentConstructor(PANEL.GRAPH, PanelGraph);

      //this.goldenLayout.registerComponentConstructor(PANEL.PROJECT, PanelProject);


      this.goldenLayout.loadLayout(config);
    }

    // public static add_old(_panel: typeof Panel, _title: string, _state?: Object): void {
    //   let config: GoldenLayout.ItemConfig = {
    //     type: "stack",
    //     content: [{
    //       type: "component", componentName: _panel.name, componentState: _state,
    //       title: _title, id: this.generateID(_panel.name)
    //     }]
    //   };

    //   let inner: GoldenLayout.ContentItem = this.goldenLayout.root.contentItems[0];
    //   let item: GoldenLayout.ContentItem = Page.goldenLayout.createContentItem(config);
    //   inner.addChild(item);
    //   this.panels.push(item.getComponentsByName(_panel.name)[0]);
    // }

    // remove _ to use
    public static add(_panel: typeof Panel, _title: string, _state?: JsonValue): void {
      // TODO: Füllen RowOrColumnItemConfig
      const panelConfig: RowOrColumnItemConfig = {
        type: "column",
        content: [
          {
            type: "component",
            componentType: _panel.name,
            componentState: _state,
            title: _title,
            id: this.generateID(_panel.name),
          }
        ]
      }
      //let panel = this.goldenLayout.rootItem.layoutManager.findFirstComponentItemById()
      this.goldenLayout.rootItem.layoutManager.addItemAtLocation(panelConfig, [{ typeId: LayoutManager.LocationSelector.TypeId.Root }]);
      //this.panels.push(panel)
    }

    public static find(_type: typeof Panel): Panel[] {
      let result: Panel[] = [];
      // for (let panel of Page.panels) {
      //   if (panel instanceof _type)
      //     result.push(panel);
      // }
      result = Page.panels.filter((_panel) => { return _panel instanceof _type; });
      return result;
    }

    private static generateID(_name: string): string {
      return _name + Page.idCounter++;
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
          console.log("Page received DESTROY", view);
          if (view instanceof Panel)
            Page.panels.splice(Page.panels.indexOf(view), 1);
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

    //#region Main-Events from Electron
    private static setupMainListeners(): void {
      ipcRenderer.on(MENU.PROJECT_SAVE, (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
        saveProject();
      });

      ipcRenderer.on(MENU.PROJECT_LOAD, async (_event: Electron.IpcRendererEvent, _args: unknown[]) => {
        let url: URL = await promptLoadProject();
        if (url)
          await loadProject(url);
        // Page.broadcastEvent(new CustomEvent(EVENT_EDITOR.SET_GRAPH, { detail: node }));
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