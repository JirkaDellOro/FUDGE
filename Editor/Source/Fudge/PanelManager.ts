/// <reference types="../@types/jquery"/>
/// <reference types="../@types/golden-layout"/>
namespace Fudge {
  // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
  export class PanelManager extends EventTarget {
    static instance: PanelManager = new PanelManager();
    static templates: typeof PanelTemplate[];
    editorLayout: GoldenLayout;
    private panels: Panel[] = [];

    private constructor() {
      super();
    }
    /**
     * Create new Panel from Template Structure
     * @param _template Template to be used
     * @param _name Name of the Panel
     */
    createPanelFromTemplate(_template: PanelTemplate, _name: string): Panel {
      let panel: Panel = new Panel(_name, _template);
      console.log(panel);
      return panel;
    }
    /**
     * Creates an Panel with nothing but the default ViewData
     * @param _name Name of the Panel
     */
    createEmptyPanel(_name: string): Panel {
      let panel: Panel = new Panel(_name);
      return panel;
    }
    /**
     * Add Panel to PanelManagers Panel List and to the PanelManagers GoldenLayout Config
     * @param _p Panel to be added
     */
    addPanel(_p: Panel): void {
      this.panels.push(_p);
      this.editorLayout.root.contentItems[0].addChild(_p.config);
    }

    /**
     * Add View to PanelManagers View List and add the view to the active panel
     * @param _v View to be added
     */
    addView(_v: View): void {
      console.log("Add View has been called at PM");
      this.editorLayout.root.contentItems[0].getActiveContentItem().addChild(_v.config);
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
    }
  }
  //TODO: Give these Factory Functions a better home
  //TODO: Figure out a better way than any. So far it was the best way to get the attributes of componentState into it properly
  /**
   * Factory Function for the the "Welcome"-Component 
   * @param container 
   * @param state 
   */
  function welcome(container: GoldenLayout.Container, state: any): void {
    container.getElement().html("<div>Welcome</div>");
  }
  /**
   * Factory Function for the generic "View"-Component
   * @param container 
   * @param state 
   */
  function registerViewComponent(container: GoldenLayout.Container, state: any): void {
    container.getElement().append(state.content);
  }
}