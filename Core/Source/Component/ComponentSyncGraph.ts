namespace FudgeCore {
  /**
   * Synchronizes the graph instance this component is attached to with the graph and vice versa
   * @authors Jirka Dell'Oro-Friedl, HFU, 2022
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
   */
  export class ComponentSyncGraph extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentSyncGraph);
    constructor() {
      super();
      this.singleton = true;

      this.addEventListener(EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.hndEvent);
      // this.addEventListener(EVENT.RENDER_PREPARE_START, this.hndEvent); // to node
    }

    public serialize(): Serialization {
      return this.getMutator();
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.mutate(_serialization);
      return this;
    }

    private hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case EVENT.COMPONENT_ADD:
          this.node.addEventListener(EVENT.CHILD_APPEND, () => console.log("Append graph instance"), true);
          this.node.addEventListener(EVENT.CHILD_REMOVE, () => console.log("Remove graph instance"), true);
          // this.node.addEventListener(EVENT.MUTATE, this.hndMutation, true);
          if (!(this.node instanceof GraphInstance))
            Debug.error(`ComponentSyncGraph attached to node of a type other than GraphInstance`, this.node);
          break;
        case EVENT.COMPONENT_REMOVE:
          // this.node.removeEventListener(EVENT.MUTATE, this.hndMutation, true);
          break;
        // case EVENT.NODE_DESERIALIZED:
        //   let graph: Graph = (<GraphInstance>this.node).get();
        //   graph.addEventListener(EVENT.MUTATE, () => console.log("Graph mutation"));
        //   break;
      }
    }

    // private hndMutation = async(_event: CustomEvent): Promise<void> => {
    //   // console.log("MUTATION!", _event, _event.detail);
    //   if (!(this.node instanceof GraphInstance))
    //     return;

    //   if (!this.node.#sync)
    //     return;

    //   let graph: Graph = (<GraphInstance>this.node).get();
    //   let path: Node[] = Reflect.get(_event, "path");
    //   path.splice(path.indexOf(this.node));
    //   let node: Node = graph;
    //   while (path.length)
    //     node = node.getChildrenByName(path.pop().name)[0];
    //   let cmpMutate: Component = node.getComponent(_event.detail.component.constructor);
    //   await cmpMutate.mutate(_event.detail.mutator);
    //   console.log("Mutate GraphInstance");
    //   // graph.dispatchEvent(new Event(EVENT.MUTATE, { bubbles: true }));
    // }
  }
}