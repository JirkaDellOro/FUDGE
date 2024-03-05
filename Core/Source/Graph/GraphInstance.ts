namespace FudgeCore {

  // enum SYNC {
  //   READY, GRAPH_SYNCED, GRAPH_DONE, INSTANCE
  // }

  /**
   * An instance of a {@link Graph}.  
   * This node keeps a reference to its resource an can thus optimize serialization
   * @author Jirka Dell'Oro-Friedl, HFU, 2019
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Resource
   */
  export class GraphInstance extends Node {
    /** id of the resource that instance was created from */
    // TODO: examine, if this should be a direct reference to the Graph, instead of the id
    public static count: number = 0;
    #idSource: string = undefined;
    // #sync: SYNC = SYNC.READY;
    #deserializeFromSource: boolean = true;

    /**
     * This constructor alone will not create a reconstruction, but only save the id.
     * To create an instance of the graph, call reset on this or set with a graph as parameter.
     * Prefer Project.createGraphInstance(_graph).
     */
    public constructor(_graph?: Graph) {
      super("GraphInstance");
      this.addEventListener(EVENT.MUTATE, this.hndMutationInstance);

      if (!_graph)
        return;
      this.#idSource = _graph.idResource;
    }

    public get idSource(): string {
      return this.#idSource;
    }

    /**
     * Recreate this node from the {@link Graph} referenced
     */
    public async reset(): Promise<void> {
      let resource: Graph = <Graph>await Project.getResource(this.#idSource);
      await this.set(resource);
    }

    //TODO: optimize using the referenced Graph, serialize/deserialize only the differences
    public serialize(): Serialization {
      let filter: ComponentGraphFilter = this.getComponent(ComponentGraphFilter);
      let serialization: Serialization = {};

      if (filter && filter.isActive) { // if graph synchronisation is unfiltered, knowing the source is sufficient for serialization
        serialization = super.serialize();
        let graph: Graph = this.get();
        if (graph instanceof GraphGLTF) { // like for the GraphGLTF: children and components loaded from gltf must never be serialized
          delete serialization.components[ComponentSkeleton.name];
          delete serialization.children;
          serialization.url = graph.url;
        }
      } else {
        serialization.deserializeFromSource = true;
      }



      serialization.idSource = this.#idSource;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.#idSource = _serialization.idSource ?? _serialization.idResource;
      if (!_serialization.deserializeFromSource) {
        let graph: Graph = <Graph><unknown>await Project.getResource(this.#idSource);
        if (graph instanceof GraphGLTF)
          await GLTFLoader.loadResource(this, _serialization.url);

        await super.deserialize(_serialization); // instance is deserialized from individual data

        this.#deserializeFromSource = false;
      }

      let graph: Graph = this.get();
      if (graph)
        // if (_serialization.deserializeFromSource) // no components-> assume synchronized GraphInstance
        //   await this.set(graph); // recreate complete instance from source graph
        // else {
        await this.connectToGraph(); // otherwise just connect
      // }
      else {
        console.log("Register for resync", _serialization.name, this.name);
        Project.registerGraphInstanceForResync(this);
      }
      return this;
    }

    /**
     * Connects this graph instance to the graph referenced.
     */
    public async connectToGraph(): Promise<void> {
      let graph: Graph = this.get();
      if (this.#deserializeFromSource)
        await this.set(graph);
    }

    /**
     * Set this node to be a recreation of the {@link Graph} given
     */
    public async set(_graph: Graph): Promise<void> {
      this.#idSource = _graph.idResource;

      let currentGraph: Graph = this.get();
      if (currentGraph) {
        //@ts-ignore
        // console.log("Before Remove", currentGraph.name, this.name, currentGraph.listeners);
        currentGraph.removeEventListener(EVENT.MUTATE_GRAPH, this.hndMutationGraph);
        //@ts-ignore
        // console.log("After Remove", currentGraph.name, this.name, currentGraph.listeners);
      }

      // TODO: examine, if the serialization should be stored in the Graph for optimization <- also useful for sync with instances
      let serialization: Serialization = Serializer.serialize(_graph);
      //Serializer.deserialize(serialization);
      for (let path in serialization) {
        await this.deserialize(serialization[path]);
        break;
      }

      console.log(this.name + GraphInstance.count++);

      // graph.addEventListener(EVENT.MUTATE, (_event: CustomEvent) => this.hndMutation, true);
      _graph.addEventListener(EVENT.MUTATE_GRAPH, this.hndMutationGraph);
      //@ts-ignore
      // console.log("Add", _graph.name, this.name, _graph.listeners);
      // graph.addEventListener(EVENT.MUTATE_GRAPH_DONE, () => { console.log("Done", this.name); /* this.#sync = true; */ });

      //@ts-ignore
      console.log(_graph?.listeners);
      this.broadcastEvent(new Event(EVENT.GRAPH_INSTANTIATED));
    }

    /**
     * Retrieve the graph this instances refers to
     */
    public get(): Graph {
      return <Graph>Project.resources[this.#idSource];
    }

    /**
     * Source graph mutated, reflect mutation in this instance
     */
    private hndMutationGraph = async (_event: CustomEvent): Promise<void> => {
      // console.log("Reflect Graph-Mutation to Instance", SYNC[this.#sync], (<Graph>_event.currentTarget).name, this.getPath().map(_node => _node.name));
      // if (this.#sync != SYNC.READY) {
      //   // console.log("Sync aborted, switch to ready");
      //   this.#sync = SYNC.READY;
      //   return;
      // }

      if (this.isFiltered())
        return;

      // this.#sync = SYNC.GRAPH_SYNCED; // do not sync again, since mutation is already a synchronization
      await this.reflectMutation(_event, <Graph>_event.currentTarget, this, _event.detail.path);
      this.dispatchEvent(new Event(EVENT.MUTATE_INSTANCE, { bubbles: true }));
    };

    /**
     * This instance mutated, reflect mutation in source graph
     */
    private hndMutationInstance = async (_event: CustomEvent): Promise<void> => {
      // console.log("Reflect Instance-Mutation to Graph", SYNC[this.#sync], this.getPath().map(_node => _node.name), this.get().name);
      // if (this.#sync != SYNC.READY) {
      //   // console.log("Sync aborted, switch to ready");
      //   this.#sync = SYNC.READY;
      //   return;
      // }

      // if (_event.target instanceof GraphInstance && _event.target != this) {
      //   // console.log("Sync aborted, target already synced");
      //   return;
      // }

      if (this.isFiltered())
        return;

      // this.#sync = SYNC.INSTANCE; // do not sync again, since mutation is already a synchronization
      await this.reflectMutation(_event, this, this.get(), Reflect.get(_event, "path"));
      this.get().dispatchEvent(new CustomEvent(EVENT.MUTATE, { detail: _event.detail }));
    };

    // reflect mutation from a source graph or instance to a destination instance or graph
    private async reflectMutation(_event: CustomEvent, _source: Node, _destination: Node, _path: Node[]): Promise<void> {
      // console.log("Reflect mutation", _source, _destination);


      for (let node of _path) // iterate up the event path, which may contain regular Nodes or GraphInstances
        if (node instanceof GraphInstance) // until this GraphInstance is found (or no GraphInstance...)
          if (node == this)
            break;
          else {
            console.log("Sync aborted, target already synced");
            return;
          }

      // find the corresponding node in the destination hierarchy
      let index: number = _path.indexOf(_source);
      for (let i: number = index - 1; i >= 0; i--) {
        let childIndex: number = _path[i].getParent().findChild(_path[i]); // get the index of the childnode in the original path
        _destination = _destination.getChild(childIndex); // get the corresponding child in this path
        // TODO: respect index for non-singleton components...
      }

      // mutate the corresponding component in the destination
      let cmpMutate: Component = _destination.getComponent(_event.detail.component.constructor);
      if (cmpMutate)
        await cmpMutate.mutate(_event.detail.mutator, null, false);
    }

    private isFiltered(): boolean {
      let cmpFilter: ComponentGraphFilter = this.getComponent(ComponentGraphFilter);
      return (cmpFilter && cmpFilter.isActive);
    }
  }
}