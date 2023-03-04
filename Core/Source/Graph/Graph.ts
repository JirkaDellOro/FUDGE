namespace FudgeCore {
  /**
   * A node managed by {@link Project} that functions as a template for {@link GraphInstance}s 
   * @author Jirka Dell'Oro-Friedl, HFU, 2019
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Resource
   */
  export class Graph extends Node implements SerializableResource {
    public idResource: string = undefined;
    public type: string = "Graph";
    // #syncing: boolean = false;

    constructor(_name: string = "Graph") {
      super(_name);
      this.addEventListener(EVENT.MUTATE, this.hndMutate);
    }

    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.idResource = this.idResource;
      serialization.type = this.type;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      Project.register(this, _serialization.idResource);
      await Project.resyncGraphInstances(this);
      this.dispatchEvent(new Event(EVENT.GRAPH_DESERIALIZED));
      return this;
    }

    private hndMutate = async (_event: CustomEvent) => {

      // TODO: if path contains a graph instance below this, don't dispatch!
      // let path: Node[] = Reflect.get(_event, "path");
      // for (let node of path)
      //   if (node instanceof GraphInstance && node.idSource != this.idResource)
      //     return;
          
      // console.log("Graph mutates", this.name);
      // this.#syncing = true;
      _event.detail.path = Reflect.get(_event, "path"); // save path to target in detail
      this.dispatchEvent(new CustomEvent(EVENT.MUTATE_GRAPH, { detail: _event.detail}));
      // this.dispatchEvent(new Event(EVENT.MUTATE_INSTANCE));
      // this.#syncing = false;
    }
  }
}