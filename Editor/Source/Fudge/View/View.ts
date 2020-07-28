namespace Fudge {
  import ƒ = FudgeCore;

  export enum  VIEW {
    HIERARCHY = "ViewHierarchy",
    ANIMATION = "ViewAnimation",
    RENDER = "ViewRender",
    COMPONENTS = "ViewComponents",
    CAMERA = "ViewCamera"
    // PROJECT = ViewProject,
    // SKETCH = ViewSketch,
    // MESH = ViewMesh,
  }

  /**
   * Base class for all Views to support generic functionality
   * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export abstract class View  {

    public dom: HTMLElement;
    // config: GoldenLayout.ComponentConfig;
    // parentPanel: Panel;
    // content: HTMLElement;
    // type: string;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      ƒ.Debug.info("Create view " + this.constructor.name);
      this.dom = document.createElement("div");
      this.dom.style.height = "100%";
      this.dom.style.overflow = "auto";
      this.dom.setAttribute("view", this.constructor.name);
      _container.getElement().append(this.dom);
      // this.config = this.getLayout();
      // this.parentPanel = _parent;
    }

    // /**
    //  * Generates the Views content and pushs it into the views content
    //  */
    // abstract fillContent(): void;
    
    /**
     * Method to cleanup when user closes view
     */
    abstract cleanup(): void;
  }
}