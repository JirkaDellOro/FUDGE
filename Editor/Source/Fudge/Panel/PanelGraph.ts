namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
  * Shows a graph and offers means for manipulation
  * @authors Monika Galkewitsch, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
  */
  export class PanelGraph extends Panel {
    #graph: ƒ.Graph;
    #node: ƒ.Node;

    public constructor(_container: ComponentContainer, _state: ViewState) {
      const constructors = { /* eslint-disable-line */
        [VIEW.RENDER]: ViewRender,
        [VIEW.COMPONENTS]: ViewComponents,
        [VIEW.HIERARCHY]: ViewHierarchy
      };

      const config: RowOrColumnItemConfig = {
        type: "column",
        content: [{
          type: "component",
          componentType: VIEW.RENDER,
          title: "Render"
        }, {
          type: "row",
          content: [{
            type: "component",
            componentType: VIEW.HIERARCHY,
            title: "Hierarchy"
          }, {
            type: "component",
            componentType: VIEW.COMPONENTS,
            title: "Components"
          }]
        }]
      };

      super(_container, _state, constructors, config);

      this.setTitle("Graph");

      this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.DELETE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.FOCUS, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.TRANSFORM, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.CLOSE, this.hndEvent);

      this.restoreGraph().then(_graph => {
        if (_graph) {
          this.dispatch(EVENT_EDITOR.SELECT, { detail: { graph: _graph, node: this.restoreNode(_graph) } });
          return;
        }
    
        if (_state["graph"]) {
          ƒ.Project.getResource(_state["graph"]).then((_graph: ƒ.Graph) => {
            const node: ƒ.Node = _state["node"] && ƒ.Node.FIND(_graph, _state["node"]);
            this.dispatch(EVENT_EDITOR.SELECT, { detail: { graph: _graph, node: node } });
          });
        }
      });
    }

    protected getState(): ViewState {
      let state: ViewState = super.getState();
      if (this.#graph)
        state["graph"] = this.#graph.idResource;
      if (this.#node)
        state["node"] = ƒ.Node.PATH_FROM_TO(this.#graph, this.#node);
      return state;
    }

    protected hndDrop(_event: DragEvent, _viewSource: View): void {
      if (!this.views.find(_view => _view instanceof ViewRender).dom.contains(<Node>_event.target)) // accept drop only from render view
        return;

      let source: Object = _viewSource.getDragDropSources()[0];
      if (source instanceof ƒ.Graph)
        this.dispatch(EVENT_EDITOR.SELECT, { detail: { graph: source, node: this.restoreNode(source) } });
    }

    private hndEvent = async (_event: EditorEvent): Promise<void> => {
      const detail: EventDetail = _event.detail;
      switch (_event.type) {
        case EVENT_EDITOR.UPDATE: // TODO: inspect if these two should be stopped aswell
        case EVENT_EDITOR.MODIFY:
          break;
        case EVENT_EDITOR.SELECT:
          _event.stopPropagation();
          const graph: ƒ.Graph = detail.graph;
          if (graph && graph != this.#graph) {
            this.storeGraph(graph);
            this.setTitle(`${graph.type} | ${graph.name}`);
            this.#graph = graph;
          }
          const node: ƒ.Node = detail.node;
          if (node && node != this.#node) {
            this.storeNode(this.#graph, node);
            this.#node = node;
          }
          break;
        case EVENT_EDITOR.CLOSE:
          if (detail.view != this)
            return;
          if (this.#graph)
            this.storeGraph(this.#graph);
          if (this.#graph && this.#node)
            this.storeNode(this.#graph, this.#node);
          return;
        default:
          _event.stopPropagation();
      }

      this.broadcast(_event);
    };

    private storeNode(_graph: ƒ.Graph, _selected: ƒ.Node): void {
      sessionStorage.setItem(`${this.id}_${_graph.idResource}`, ƒ.Node.PATH_FROM_TO(_graph, _selected));
    }

    private restoreNode(_graph: ƒ.Graph): ƒ.Node {
      let selected: string = sessionStorage.getItem(`${this.id}_${_graph.idResource}`);
      return selected && ƒ.Node.FIND(_graph, selected);
    }

    private storeGraph(_graph: ƒ.Graph): void {
      sessionStorage.setItem(this.id, _graph.idResource);
    }

    private async restoreGraph(): Promise<ƒ.Graph> {
      let id: string = sessionStorage.getItem(this.id);
      return id && <Promise<ƒ.Graph>>ƒ.Project.getResource(id);
    }
  }
}