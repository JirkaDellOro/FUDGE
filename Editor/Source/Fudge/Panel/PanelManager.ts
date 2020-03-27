namespace Fudge {
  /**
   * Manages all Panels used by Fudge at the time. Call the static instance Member to use its functions.
   * @author Monika Galkewitsch, 2019, HFU
   * @author Lukas Scheuerle, 2019, HFU
   */
  export class PanelManager extends EventTarget {
    static instance: PanelManager = new PanelManager();
    static templates: typeof PanelTemplate[];
    editorLayout: GoldenLayout;
    private panels: Panel[] = [];
    private activePanel: Panel;
    

    private constructor() {
      super();
    }
    /**
     * Add Panel to PanelManagers Panel List and to the PanelManagers GoldenLayout Config
     * @param _p Panel to be added
     */
    addPanel(_p: Panel): void {
      this.panels.push(_p);
      this.editorLayout.root.contentItems[0].addChild(_p.config);
      this.activePanel = _p;
    }

    /**
     * Add View to PanelManagers View List and add the view to the active panel
     * @param _v View to be added
     */
    addView(_v: View): void {
      this.editorLayout.root.contentItems[0].getActiveContentItem().addChild(_v.config);
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
        content: [{
          type: "stack",
          isClosable: false,
          content: [
            {
              type: "component",
              componentName: "welcome",
              title: "Welcome",
              componentState: {}
            }
          ]
        }]
      };
      this.editorLayout = new GoldenLayout(config);   //This might be a problem because it can't use a specific place to put it.
      this.editorLayout.registerComponent("welcome", welcome);
      this.editorLayout.registerComponent("View", registerViewComponent);
      this.editorLayout.init();
      this.editorLayout.root.contentItems[0].on("activeContentItemChanged", this.setActivePanel);
    }

    /**
     * Sets the currently active panel. Shouldn't be called by itself. Rather, it should be called by a goldenLayout-Event (i.e. when a tab in the Layout is selected)
     * "activeContentItemChanged" Events usually come from the first ContentItem in the root-Attribute of the GoldenLayout-Instance or when a new Panel is 
     * created and added to the Panel-List.
     * During Initialization and addPanel function, this method is called already.
     */
    private  setActivePanel = (): void => {
      let activeTab: GoldenLayout.ContentItem = this.editorLayout.root.contentItems[0].getActiveContentItem();
      for (let panel of this.panels) {
        if (panel.config.id == activeTab.config.id) {
          this.activePanel = panel;
        }
      }
    }

  }
  //TODO: Give these Factory Functions a better home
  //TODO: Figure out a better way than any. So far it was the best way to get the attributes of componentState into it properly
  /**
   * Factory Function for the the "Welcome"-Component 
   * @param container 
   * @param state 
   */
  function welcome(container: GoldenLayout.Container, state: Object): void {
    container.getElement().html("<div>Welcome</div>");
  }
  /**
   * Factory Function for the generic "View"-Component
   * @param container 
   * @param state 
   */
  function registerViewComponent(container: GoldenLayout.Container, state: Object): void {
    container.getElement().append(state["content"]);
  }
}