namespace FudgeCore {
  export enum MODE {
    EDITOR, RUNTIME
  }

  export interface SerializableResource extends Serializable {
    name: string;
    type: string;
    idResource: string;
  }

  export interface Resources {
    [idResource: string]: SerializableResource;
  }

  export interface SerializationOfResources {
    [idResource: string]: Serialization;
  }

  export interface ScriptNamespaces {
    [name: string]: Object;
  }

  export interface ComponentScripts {
    [namespace: string]: ComponentScript[];
  }

  interface GraphInstancesToResync {
    [idResource: string]: GraphInstance[];
  }

  /**
   * Static class handling the resources used with the current FUDGE-instance.  
   * Keeps a list of the resources and generates ids to retrieve them.  
   * Resources are objects referenced multiple times but supposed to be stored only once
   */
  export abstract class Project extends EventTargetStatic {
    public static resources: Resources = {};
    public static serialization: SerializationOfResources = {};
    public static scriptNamespaces: ScriptNamespaces = {};
    public static baseURL: URL = new URL(location.toString());
    public static mode: MODE = MODE.RUNTIME;
    public static graphInstancesToResync: GraphInstancesToResync = {};

    /**
     * Registers the resource and generates an id for it by default.  
     * If the resource already has an id, thus having been registered, its deleted from the list and registered anew.
     * It's possible to pass an id, but should not be done except by the Serializer.
     */
    public static register(_resource: SerializableResource, _idResource?: string): void {
      if (_resource.idResource)
        if (_resource.idResource == _idResource)
          return;
        else
          this.deregister(_resource);
      _resource.idResource = _idResource || Project.generateId(_resource);
      Project.resources[_resource.idResource] = _resource;
    }

    public static deregister(_resource: SerializableResource): void {
      delete (Project.resources[_resource.idResource]);
      delete (Project.serialization[_resource.idResource]);
    }

    public static clear(): void {
      Project.resources = {};
      Project.serialization = {};
      Project.clearScriptNamespaces();
      // Project.scriptNamespaces = {};
    }

    // <T extends Component>(_class: new () => T): T[] {
    //   return <T[]>(this.components[_class.name] || []).slice(0);
    // }

    public static getResourcesByType<T>(_type: new (_args: General) => T): SerializableResource[] {
      let found: SerializableResource[] = [];
      for (let resourceId in Project.resources) {
        let resource: SerializableResource = Project.resources[resourceId];
        if (resource instanceof _type)
          found.push(resource);
      }
      return found;
    }

    public static getResourcesByName(_name: string): SerializableResource[] {
      let found: SerializableResource[] = [];
      for (let resourceId in Project.resources) {
        let resource: SerializableResource = Project.resources[resourceId];
        if (resource.name == _name)
          found.push(resource);
      }
      return found;
    }


    /**
     * Generate a user readable and unique id using the type of the resource, the date and random numbers
     * @param _resource
     */
    public static generateId(_resource: SerializableResource): string {
      // TODO: build id and integrate info from resource, not just date
      let idResource: string;
      do
        idResource = _resource.constructor.name + "|" + new Date().toISOString() + "|" + Math.random().toPrecision(5).substr(2, 5);
      while (Project.resources[idResource]);
      return idResource;
    }

    /**
     * Tests, if an object is a {@link SerializableResource}
     * @param _object The object to examine
     */
    public static isResource(_object: Serializable): boolean {
      return (Reflect.has(_object, "idResource"));
    }

    /**
     * Retrieves the resource stored with the given id
     */
    public static async getResource(_idResource: string): Promise<SerializableResource> {
      let resource: SerializableResource = Project.resources[_idResource];
      if (!resource) {
        let serialization: Serialization = Project.serialization[_idResource];
        if (!serialization) {
          Debug.error("Resource not found", _idResource);
          return null;
        }
        resource = await Project.deserializeResource(serialization);
      }
      return resource;
    }

    /**
     * Creates and registers a resource from a {@link Node}, copying the complete graph starting with it
     * @param _node A node to create the resource from
     * @param _replaceWithInstance if true (default), the node used as origin is replaced by a {@link GraphInstance} of the {@link Graph} created
     */
    public static async registerAsGraph(_node: Node, _replaceWithInstance: boolean = true): Promise<Graph> {
      let serialization: Serialization = _node.serialize();
      let graph: Graph = new Graph(_node.name);
      await graph.deserialize(serialization);
      Project.register(graph);

      if (_replaceWithInstance && _node.getParent()) {
        let instance: GraphInstance = await Project.createGraphInstance(graph);
        _node.getParent().replaceChild(_node, instance);
      }

      return graph;
    }

    /**
     * Creates and returns a {@link GraphInstance} of the given {@link Graph} 
     * and connects it to the graph for synchronisation of mutation.
     */
    public static async createGraphInstance(_graph: Graph): Promise<GraphInstance> {
      let instance: GraphInstance = new GraphInstance(_graph); // TODO: cleanup since creation moved here
      await instance.connectToGraph();
      return instance;
    }

    public static registerGraphInstanceForResync(_instance: GraphInstance): void {
      let instances: GraphInstance[] = Project.graphInstancesToResync[_instance.idSource] || [];
      instances.push(_instance);
      Project.graphInstancesToResync[_instance.idSource] = instances;
    }

    public static async resyncGraphInstances(_graph: Graph): Promise<void> {
      let instances: GraphInstance[] = Project.graphInstancesToResync[_graph.idResource];
      if (!instances)
        return;
      for (let instance of instances)
        await instance.connectToGraph();
      delete (Project.graphInstancesToResync[_graph.idResource]);
    }

    public static registerScriptNamespace(_namespace: Object): void {
      let name: string = Serializer.registerNamespace(_namespace);
      if (!Project.scriptNamespaces[name])
        Project.scriptNamespaces[name] = _namespace;
    }

    public static clearScriptNamespaces(): void {
      for (let name in Project.scriptNamespaces) {
        Reflect.set(window, name, undefined);
        Project.scriptNamespaces[name] = undefined;
        delete Project.scriptNamespaces[name];
      }
    }

    public static getComponentScripts(): ComponentScripts {
      let compoments: ComponentScripts = {};
      for (let namespace in Project.scriptNamespaces) {
        compoments[namespace] = [];
        for (let name in Project.scriptNamespaces[namespace]) {
          let script: ComponentScript = Reflect.get(Project.scriptNamespaces[namespace], name);
          // Using Object.create doesn't call the constructor, but instanceof can be used. More elegant than the loop above, though maybe not as performant. 

          try {
            let o: General = Object.create(script);
            if (o.prototype instanceof ComponentScript)
              compoments[namespace].push(script);
          } catch (_e) { /* */ }
        }
      }
      return compoments;
    }

    public static async loadScript(_url: RequestInfo): Promise<void> {
      let script: HTMLScriptElement = document.createElement("script");
      script.type = "text/javascript";
      // script.type = "module";
      script.async = false;
      // script.addEventListener("load", handleLoadedScript)
      let head: HTMLHeadElement = document.head;
      head.appendChild(script);
      Debug.log("Loading: ", _url);

      return new Promise((resolve, reject) => {
        script.addEventListener("load", () => resolve());
        script.addEventListener("error", () => {
          Debug.error("Loading script", _url);
          reject();
        });
        script.src = _url.toString();
      });
    }

    public static async loadResources(_url: RequestInfo): Promise<Resources> {
      const response: Response = await fetch(_url);
      const resourceFileContent: string = await response.text();

      let serialization: Serialization = Serializer.parse(resourceFileContent);
      let reconstruction: Resources = await Project.deserialize(serialization);
      Project.dispatchEvent(new CustomEvent(EVENT.RESOURCES_LOADED, { detail: { url: _url, resources: reconstruction } }));
      return reconstruction;
    }

    public static async loadResourcesFromHTML(): Promise<void> {
      const head: HTMLHeadElement = document.head;
      let links: NodeListOf<HTMLLinkElement> = head.querySelectorAll("link[type=resources]");
      for (let link of links) {
        let url: RequestInfo = link.getAttribute("src");
        await Project.loadResources(url);
      }
    }

    /**
     * Serialize all resources
     */
    public static serialize(): SerializationOfResources {
      let serialization: SerializationOfResources = {};
      for (let idResource in Project.resources) {
        let resource: SerializableResource = Project.resources[idResource];
        if (idResource != resource.idResource)
          Debug.error("Resource-id mismatch", resource);
        serialization[idResource] = Serializer.serialize(resource);
      }
      return serialization;
    }

    /**
     * Create resources from a serialization, deleting all resources previously registered
     * @param _serialization 
     */
    public static async deserialize(_serialization: SerializationOfResources): Promise<Resources> {
      Project.serialization = _serialization;
      Project.resources = {};
      for (let idResource in _serialization) {
        let serialization: Serialization = _serialization[idResource];
        let resource: SerializableResource = await Project.deserializeResource(serialization);
        if (resource)
          Project.resources[idResource] = resource;
      }
      return Project.resources;
    }

    private static async deserializeResource(_serialization: Serialization): Promise<SerializableResource> {
      return <Promise<SerializableResource>>Serializer.deserialize(_serialization);
    }
  }
}