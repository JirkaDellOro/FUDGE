///<reference path="../View/View.ts"/>
namespace Fudge {
  import ƒ = FudgeCore;

  /**
   * Base class for all [[Panel]]s aggregating [[View]]s
   * Subclasses are presets for common panels. A user might add or delete [[View]]s at runtime
   * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020 | Jonas Plotzky, HFU, 2024
   */

  // TODO: class might become a customcomponent for HTML! = this.dom

  // extends view vorrübergehend entfernt
  export abstract class Panel extends View {
    protected goldenLayout: GoldenLayout;
    protected views: View[] = [];
    //public dom; // muss vielleicht weg

    public constructor(_container: ComponentContainer, _panelState: ViewState, _viewConstructors?: { [name: string]: new (...args: ƒ.General) => View }, _rootItemConfig?: RowOrColumnItemConfig) {
      _container.on("destroy", () => this.goldenLayout.destroy()); // destroy from inside out
      super(_container, _panelState);
      this.dom.style.width = "100%";
      this.dom.style.overflow = "visible";
      this.dom.removeAttribute("view");
      this.dom.setAttribute("panel", this.constructor.name);

      const config: LayoutConfig = {
        header: {
          popout: false,
          maximise: false
        },
        root: _rootItemConfig
      };

      this.goldenLayout = new Page.goldenLayoutModule.GoldenLayout(this.dom);

      for (const key in _viewConstructors)
        this.goldenLayout.registerComponentFactoryFunction(key, (_container, _viewState: ViewState) => new _viewConstructors[key](_container, { ..._panelState, ..._viewState }));

      this.goldenLayout.on("stateChanged", () => this.goldenLayout.updateRootSize());
      this.goldenLayout.on("itemCreated", this.addViewComponent);

      this.goldenLayout.loadLayout(_panelState["layout"] ? Page.goldenLayoutModule.LayoutConfig.fromResolved(_panelState["layout"]) : config);
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

    protected getState(): ViewState {
      let state: ViewState = super.getState();
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
  }
}