namespace FudgeCore {
  export enum MODE {
    EDITOR, RUNTIME
  }

  export interface SerializableResource extends Serializable {
    idResource: string;
  }

  export interface Resources {
    [idResource: string]: SerializableResource;
  }

  export interface SerializationOfResources {
    [idResource: string]: Serialization;
  }

  /**
   * Static class handling the resources used with the current FUDGE-instance.  
   * Keeps a list of the resources and generates ids to retrieve them.  
   * Resources are objects referenced multiple times but supposed to be stored only once
   */
  export abstract class Project {
    public static resources: Resources = {};
    public static serialization: SerializationOfResources = {};
    public static baseURL: URL = new URL(location.toString());
    public static mode: MODE = MODE.RUNTIME;

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
     * Tests, if an object is a [[SerializableResource]]
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
     * Creates and registers a resource from a [[Node]], copying the complete graph starting with it
     * @param _node A node to create the resource from
     * @param _replaceWithInstance if true (default), the node used as origin is replaced by a [[NodeResourceInstance]] of the [[NodeResource]] created
     */
    public static async registerNodeAsResource(_node: Node, _replaceWithInstance: boolean = true): Promise<NodeResource> {
      let serialization: Serialization = _node.serialize();
      let nodeResource: NodeResource = new NodeResource("NodeResource");
      await nodeResource.deserialize(serialization);
      Project.register(nodeResource);

      if (_replaceWithInstance && _node.getParent()) {
        let instance: NodeResourceInstance = new NodeResourceInstance(nodeResource);
        _node.getParent().replaceChild(_node, instance);
      }

      return nodeResource;
    }

    public static async createGraphInstance(_graph: NodeResource): Promise<NodeResourceInstance> {
      let instance: NodeResourceInstance = new NodeResourceInstance(null); // TODO: cleanup since creation moved here
      await instance.set(_graph);
      return instance;
    }

    public static async loadScript(_url: RequestInfo): Promise<void> {
      let script: HTMLScriptElement = document.createElement("script");
      script.type = "text/javascript";
      // script.type = "module";
      script.async = false;
      // script.addEventListener("load", handleLoadedScript)
      let head: HTMLHeadElement = document.head;
      head.appendChild(script);
      console.log("Loading: ", _url);

      return new Promise((resolve, reject) => {
        script.addEventListener("load", () => resolve());
        script.addEventListener("error", () => reject());
        script.src = _url.toString();
      });
    }

    public static async loadResources(_url?: RequestInfo): Promise<Resources> {
      // TODO: support given url and multiple resource files
      let url: RequestInfo;
      if (_url)
        url = _url;
      else {
        const head: HTMLHeadElement = document.head;
        console.log(head);
        url = head.querySelector("link").getAttribute("src");
      }
      
      const response: Response = await fetch(url);
      const resourceFileContent: string = await response.text();

      let serialization: Serialization = Serializer.parse(resourceFileContent);
      let reconstruction: Resources = await Project.deserialize(serialization);
      return reconstruction;
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