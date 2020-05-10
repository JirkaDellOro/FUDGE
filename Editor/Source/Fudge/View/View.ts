namespace Fudge {
  import ƒ = FudgeCore;

  export enum VIEW {
    // PROJECT = ViewProject,
    NODE = "ViewNode",
    ANIMATION = "ViewAnimation",
    // SKETCH = ViewSketch,
    // MESH = ViewMesh,
    RENDER = "ViewRender",
    COMPONENTS = "ViewComponents",
    CAMERA = "ViewCamera"
  }

  /**
   * Base class for all Views to support generic functionality
   * @author Monika Galkewitsch, HFU, 2019
   * @author Lukas Scheuerle, HFU, 2019
   */
  export abstract class View  {

    config: GoldenLayout.ComponentConfig;
    parentPanel: Panel;
    content: HTMLElement;
    type: string;

    constructor(_parent: Panel) {
      ƒ.Debug.info("Create view " + this.constructor.name);
      this.content = document.createElement("div");
      this.content.style.height = "100%";
      this.content.style.overflow = "auto";
      this.content.setAttribute("view", this.constructor.name);
      this.config = this.getLayout();
      this.parentPanel = _parent;
    }
    /**
     * Returns GoldenLayout ComponentConfig for the Views GoldenLayout Component.
     * If not overridden by inherited class, gives generic config with its type as its name.
     * If you want to use the "View"-Component, add {content: this.content} to componentState.
     */
    public getLayout(): GoldenLayout.ComponentConfig {
      /* TODO: fix the golden-layout.d.ts to include componentName in ContentItem*/
      const config: GoldenLayout.ComponentConfig = {
        type: "component",
        title: this.type,
        componentName: "View",
        componentState: { content: this.content }
      };
      return config;
    }

    /**
     * Generates the Views content and pushs it into the views content
     */
    abstract fillContent(): void;
    /***
     * Deconstructor for cleanup purposes
     */
    abstract deconstruct(): void;
  }
}