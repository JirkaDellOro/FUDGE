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
          this.node.addEventListener(EVENT.MUTATE, this.hndMutation, true);
          if (!(this.node instanceof GraphInstance))
            Debug.error(`ComponentSyncGraph attached to node of a type other than GraphInstance`, this.node);
          break;
        case EVENT.COMPONENT_REMOVE:
          this.node.removeEventListener(EVENT.MUTATE, this.hndMutation, true);
          break;
      }
    }

    private hndMutation = (_event: CustomEvent): void => {
      // console.log("MUTATION!", _event, _event.detail);
      let graph: Graph = (<GraphInstance>this.node).get();
      let path: Node[] = Reflect.get(_event, "path");
      path.splice(path.indexOf(this.node));
      let node: Node = graph;
      while (path.length)
        node = node.getChildrenByName(path.pop().name)[0];
      let cmpMutate: Component = node.getComponent(_event.detail.component.constructor);
      cmpMutate.mutate(_event.detail.mutator);
      graph.dispatchEvent(new Event(EVENT.MUTATE, { bubbles: true }));
    }
  }
}