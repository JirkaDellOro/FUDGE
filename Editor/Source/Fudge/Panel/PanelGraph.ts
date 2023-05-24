namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
  * Shows a graph and offers means for manipulation
  * @authors Monika Galkewitsch, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
  */
  export class PanelGraph extends Panel {
    private graph: ƒ.Graph;

    public constructor(_container: ComponentContainer, _state: JsonValue | undefined) {
      super(_container, _state);

      this.goldenLayout.registerComponentConstructor(VIEW.RENDER, ViewRender);
      this.goldenLayout.registerComponentConstructor(VIEW.COMPONENTS, ViewComponents);
      this.goldenLayout.registerComponentConstructor(VIEW.HIERARCHY, ViewHierarchy);

      this.setTitle("Graph");

      const config: RowOrColumnItemConfig = {
        type: "column",
        content: [{
          type: "component",
          componentType: VIEW.RENDER,
          componentState: _state,
          title: "Render"
        }, {
          type: "row",
          content: [{
            type: "component",
            componentType: VIEW.HIERARCHY,
            componentState: _state,
            title: "Hierarchy"
          }, {
            type: "component",
            componentType: VIEW.COMPONENTS,
            componentState: _state,
            title: "Components"
          }]
        }]
      };


      this.goldenLayout.addItemAtLocation(config, [{ typeId: LayoutManager.LocationSelector.TypeId.Root }]);
      // this.goldenLayout.addItemAtLocation(hierarchyAndComponents, [{ typeId: LayoutManager.LocationSelector.TypeId.Root }]);

      //TODO: ƒui-Events should only be listened to in Views! If applicable, Views then dispatch EDITOR-Events
      this.dom.addEventListener(ƒui.EVENT.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.DELETE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.FOCUS, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.TRANSFORM, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.CLOSE, this.hndEvent);

      if (_state["graph"])
        ƒ.Project.getResource(_state["graph"]).then((_graph: ƒ.Graph) => {
          this.dispatch(EVENT_EDITOR.SELECT, { detail: { graph: _graph } });
          // TODO: trace the node saved. The name is not sufficient, path is necessary...
          // this.dom.dispatchEvent(new CustomEvent(EVENT_EDITOR.FOCUS_NODE, { detail: _graph.findChild }));
        });
    }

    public setGraph(_graph: ƒ.Graph): void {
      if (_graph) {
        this.setTitle("Graph | " + _graph.name);
        this.graph = _graph;
        return;
      }

      this.setTitle("Graph");
    }

    public getState(): { [key: string]: string } {
      let state: PanelState = {};
      if (this.graph) {
        state.graph = this.graph.idResource;
        return state;
      }
      // TODO: iterate over views and collect their states for reconstruction 
    }

    private hndEvent = async (_event: EditorEvent | CustomEvent): Promise<void> => {
      if (_event.type != EVENT_EDITOR.UPDATE && _event.type != EVENT_EDITOR.MODIFY)
        _event.stopPropagation();
      switch (_event.type) {
        case EVENT_EDITOR.SELECT:
          this.setGraph(_event.detail.graph);
        // case EVENT_EDITOR.MODIFY:
        //   if (!_event.detail)
        //     break;
        //   // selected a graph or a node
        //   if (this.graph) {
        //     this.setGraph(_event.detail.graph); // TODO: examine, why this is supposed to happen any time...
        //     let newGraph: ƒ.Graph = <ƒ.Graph>await ƒ.Project.getResource(this.graph.idResource);
        //     if (this.graph != newGraph) // TODO: examine, when this is actually true...
        //       _event = new EditorEvent(EVENT_EDITOR.SELECT, { detail: { graph: newGraph } });
        //   }
        //   break;
      }

      this.broadcast(_event);
    };
  }
}