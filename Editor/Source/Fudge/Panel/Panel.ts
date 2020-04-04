namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  /**
   * Holds various views into the currently processed Fudge-project.  
   * There must be only one ViewData in this panel, that displays data for the selected entity  
   * Multiple panels may be created by the user, presets for different processing should be available
   * @author Monika Galkewitsch, HFU, 2019
   * @author Lukas Scheuerle, HFU, 2019
   */

  export abstract class Panel extends EventTarget {
    views: View[] = [];
    config: GoldenLayout.ItemConfig;

    /**
     * Constructor for panel Objects. Generates an empty panel with a single ViewData.
     * @param _name Panel Name
     * @param _template Optional. Template to be used in the construction of the panel.
     */
    constructor(_name: string) {
      super();
      let id: string = this.generateID();
      this.config = {
        type: "row",
        content: [],
        title: _name,
        id: id
      };

    }
    /**
     * Adds given View to the list of views on the panel. 
     * @param _v View to be added
     * @param _pushToPanelManager Wether or not the View should also be pushed to the Panelmanagers list of views
     * @param _pushConfig Wether or not the config of the view should be pushed into the panel config. If this is false, you will have to push the view config manually. This is helpful for creating custom structures in the panel config.
     */
    public addView(_v: View, _pushToPanelManager: boolean = true, _pushConfig: boolean = true): void {
      this.views.push(_v);
      if (_pushConfig) {
        this.config.content.push(_v.config);
      }
      if (_pushToPanelManager) {
        PanelManager.instance.addView(_v);
      }
    }

    /**
     * Returns a randomly generated ID. 
     * Used to identify panels
     */
    private generateID(): string {
      let randLetter: string = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      let uniqid: string = randLetter + Date.now();
      return uniqid;
    }
  }
}