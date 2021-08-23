///<reference path="../View/View.ts"/>
namespace Fudge {
  import ƒ = FudgeCore;

  /**
   * Base class for all [[Panel]]s aggregating [[View]]s
   * Subclasses are presets for common panels. A user might add or delete [[View]]s at runtime
   * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */

  // TODO: class might become a customcomponent for HTML! = this.dom

  // extends view vorrübergehend entfernt
  export abstract class Panel extends View {
    protected goldenLayout: GoldenLayout;
    private views: View[] = [];
    //public dom; // muss vielleicht weg

    constructor(_container: ComponentContainer, _state: JsonValue | undefined) {
      super(_container, _state);
      this.dom.style.width = "100%";
      this.dom.style.overflow = "visible";
      this.dom.removeAttribute("view");
      this.dom.setAttribute("panel", this.constructor.name);

      let oldconfig: any = {
        settings: { showPopoutIcon: false },
        content: [{
          type: "row", content: []
        }]
      };

      const config: LayoutConfig = {
        root: {
          type: "row",
          isClosable: true,
          content: [
          ]
        }
      }

      this.goldenLayout = new Page.goldenLayoutModule.GoldenLayout(this.dom);

      this.goldenLayout.on("stateChanged", () => this.goldenLayout.updateRootSize());
      //this.goldenLayout.on("componentCreated", this.addViewComponent);                // old eventname
      this.goldenLayout.on("itemCreated", this.addViewComponent);
      this.goldenLayout.loadLayout(config);
    }

    /** Send custom copies of the given event to the views */
    public broadcastEvent = (_event: Event): void => {
      console.log("views", this.views);
      for (let view of this.views) {
        let event: CustomEvent = new CustomEvent(_event.type, { bubbles: false, cancelable: true, detail: (<CustomEvent>_event).detail });
        view.dom.dispatchEvent(event);
      }
    }

    private addViewComponent = (_event: EventEmitter.BubblingEvent): void => {
      //this.views.push(<View>(<ƒ.General>_component).instance); original
      // adjustmens for GoldenLayout 2
      let target: ComponentItem = _event.target as ComponentItem;
      if (target instanceof Page.goldenLayoutModule.ComponentItem) {
        this.views.push(<View>target.component);
      }
    }
  }
}