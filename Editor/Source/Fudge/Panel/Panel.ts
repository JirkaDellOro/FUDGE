///<reference path="../View/View.ts"/>
namespace Fudge {
  import ƒ = FudgeCore;

  export interface PanelState {
    [key: string]: string;
  }

  /**
   * Base class for all [[Panel]]s aggregating [[View]]s
   * Subclasses are presets for common panels. A user might add or delete [[View]]s at runtime
   * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */

  // TODO: class might become a customcomponent for HTML! = this.dom

  // extends view vorrübergehend entfernt
  export abstract class Panel extends View {
    protected goldenLayout: GoldenLayout;
    protected views: View[] = [];
    //public dom; // muss vielleicht weg

    public constructor(_container: ComponentContainer, _state: JsonValue | undefined, _viewConstructors?: { [name: string]: new (...args: ƒ.General) => View }, _rootItemConfig?: RowOrColumnItemConfig) {
      super(_container, _state);
      this.dom.style.width = "100%";
      this.dom.style.overflow = "visible";
      this.dom.removeAttribute("view");
      this.dom.setAttribute("panel", this.constructor.name);

      const config: LayoutConfig = {
        settings: { showPopoutIcon: false, showMaximiseIcon: false },
        root: _rootItemConfig
      };

      this.goldenLayout = new Page.goldenLayoutModule.GoldenLayout(this.dom);

      for (const key in _viewConstructors)
        this.goldenLayout.registerComponentFactoryFunction(key, _container => new _viewConstructors[key](_container, _state)); // this way all views receive/share their panels state

      this.goldenLayout.on("stateChanged", () => this.goldenLayout.updateRootSize());
      this.goldenLayout.on("itemCreated", this.addViewComponent);

      this.goldenLayout.loadLayout(_state["layout"] ? Page.goldenLayoutModule.LayoutConfig.fromResolved(_state["layout"]) : config);
      
      _container.stateRequestEvent = this.getState.bind(this);
    }

    /** Send custom copies of the given event to the views */
    public broadcast = (_event: EditorEvent): void => {
      let detail: EventDetail = _event.detail || {};
      let target: View = detail.view;
      detail.sender = this;
      for (let view of this.views)
        if (view != target) // don't send back to original target view
          view.dispatch(<EVENT_EDITOR>_event.type, { detail: detail });
    };
    
    protected getState(): JsonValue {
      let state: JsonValue = {};
      state["layout"] = this.goldenLayout.saveLayout();
      return state;
    }

    private addViewComponent = (_event: EventEmitter.BubblingEvent): void => {
      // adjustmens for GoldenLayout 2
      let target: ComponentItem = _event.target as ComponentItem;
      if (target instanceof Page.goldenLayoutModule.ComponentItem) {
        this.views.push(<View>target.component);
      }
    };

    // public abstract getState(): PanelState;
  }
}