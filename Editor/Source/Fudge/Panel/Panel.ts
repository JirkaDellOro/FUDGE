///<reference path="../View/View.ts"/>
namespace Fudge {
  import ƒ = FudgeCore;

  export enum PANEL {
    GRAPH = "PanelGraph"
  }

  /**
   * Base class for all [[Panel]]s aggregating [[View]]s
   * Subclasses are presets for common panels. A user might add or delete [[View]]s at runtime
   * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */

  // TODO: class might become a customcomponent for HTML! = this.dom
  export abstract class Panel extends View {
    protected goldenLayout: GoldenLayout;
    private views: View[] = [];

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      this.dom.style.width = "100%";
      this.dom.style.overflow = "visible";
      this.dom.removeAttribute("view");
      this.dom.setAttribute("panel", this.constructor.name);

      let config: GoldenLayout.Config = {
        settings: { showPopoutIcon: false },
        content: [{
          type: "row", content: []
        }]
      };
      this.goldenLayout = new GoldenLayout(config, this.dom);
      this.goldenLayout.on("stateChanged", () => this.goldenLayout.updateSize());
      this.goldenLayout.on("componentCreated", this.addViewComponent);
      this.goldenLayout.init();
    }

    /** Send custom copies of the give event to the views */
    public broadcastEvent(_event: Event): void {
      for (let view of this.views) {
        let event: CustomEvent = new CustomEvent(_event.type, { bubbles: false, cancelable: true, detail: (<CustomEvent>_event).detail });
        view.dispatchEvent(event);
      }
    }

    private addViewComponent = (_component: Object): void => {
      this.views.push(<View>(<ƒ.General>_component).instance);
    }
  }
}