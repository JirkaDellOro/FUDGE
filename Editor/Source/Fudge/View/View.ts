namespace Fudge {
  import ƒ = FudgeCore;

  export enum VIEW {
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
   * Base class for all [[View]]s to support generic functionality
   * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export abstract class View {

    public dom: HTMLElement;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      this.dom = document.createElement("div");
      this.dom.style.height = "100%";
      this.dom.style.overflow = "auto";
      this.dom.setAttribute("view", this.constructor.name);
      _container.getElement().append(this.dom);
    }

    /** Cleanup when user closes view */
    abstract cleanup(): void;
  }
}