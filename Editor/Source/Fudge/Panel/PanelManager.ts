namespace Fudge {
  /**
   * Manages all Panels used by Fudge at the time. Call the static instance Member to use its functions.
   * @author Monika Galkewitsch, 2019, HFU
   * @author Lukas Scheuerle, 2019, HFU
   */
  export class PanelManager extends EventTarget {
    public static idCounter: number = 0;
    static instance: PanelManager = new PanelManager();
    static templates: typeof PanelTemplate[];
    public editorLayout: GoldenLayout;
    private panels: Panel[] = [];
    private activePanel: Panel;


    private constructor() {
      super();
    }
    // /**
    //  * Add Panel to PanelManagers Panel List and to the PanelManagers GoldenLayout Config
    //  * @param _p Panel to be added
    //  */
    // addPanel(_p: Panel): void {
    //   this.panels.push(_p);
    //   // this.editorLayout.root.contentItems[0].addChild(_p.config);
    //   this.editorLayout.root.getItemsById("root")[0].addChild(_p.config);
    //   this.activePanel = _p;
    // }

    /**
     * Add View to PanelManagers View List and add the view to the active panel
     */
    // addView(_v: View): void {
    //   this.editorLayout.root.contentItems[0].getActiveContentItem().addChild(_v.config);
    // }

    public static add(_panel: typeof Panel, _title: string, _state?: Object): void {
      let config: GoldenLayout.ItemConfig = {
        type: "stack",
        content: [{
          type: "component", componentName: _panel.name, componentState: _state,
          title: _title, id: this.generateID(_panel.name)
        }]
      };
      PanelManager.instance.editorLayout.root.contentItems[0].addChild(config);
    }

    private static generateID(_name: string): string {
      return _name + PanelManager.idCounter++;
    }

    /**
     * Returns the currently active Panel
     */
    getActivePanel(): Panel {
      return this.activePanel;
    }
    /**
     * Initialize GoldenLayout Context of the PanelManager Instance
     */
    public init(): void {
      let config: GoldenLayout.Config = {
        settings: { showPopoutIcon: false },
        content: [{
          id: "root", type: "row", isClosable: false,
          content: [
            { type: "component", componentName: "Welcome", title: "Welcome", componentState: {} }]
        }]
      };
      this.editorLayout = new GoldenLayout(config);   //This might be a problem because it can't use a specific place to put it.
      this.editorLayout.registerComponent("Welcome", welcome);
      // this.editorLayout.registerComponent("View", registerViewComponent);
      this.editorLayout.registerComponent(PANEL.GRAPH, PanelGraph);
      this.editorLayout.init();
      this.editorLayout.on("stateChanged", (_event) => {
        console.log(_event);
      });
      // this.editorLayout.root.contentItems[0].on("activeContentItemChanged", this.setActivePanel);
    }

    /**
     * Sets the currently active panel. Shouldn't be called by itself. Rather, it should be called by a goldenLayout-Event (i.e. when a tab in the Layout is selected)
     * "activeContentItemChanged" Events usually come from the first ContentItem in the root-Attribute of the GoldenLayout-Instance or when a new Panel is 
     * created and added to the Panel-List.
     * During Initialization and addPanel function, this method is called already.
     */
    // private setActivePanel = (): void => {
    //   let activeTab: GoldenLayout.ContentItem = this.editorLayout.root.contentItems[0].getActiveContentItem();
    //   for (let panel of this.panels) {
    //     if (panel.config.id == activeTab.config.id) {
    //       this.activePanel = panel;
    //     }
    //   }
    // }


  }
  //TODO: Give these Factory Functions a better home
  /**
   * Factory Function for the the "Welcome"-Component 
   */
  function welcome(container: GoldenLayout.Container, state: Object): void {
    container.getElement().html("<div>Welcome</div>");
  }
  /**
   * Factory Function for the generic "View"-Component
   */
  export function registerViewComponent(_container: GoldenLayout.Container, _state: Object): void {
    _container.getElement().append(_state["content"]);
  }
  /**
   * Factory Function for the generic "Panel"-Component
   */
  export function registerPanelComponent(_container: GoldenLayout.Container, _state: Object): void {
    _container.getElement().append(_state["content"]);
  }
}