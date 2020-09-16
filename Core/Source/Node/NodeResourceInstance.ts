namespace FudgeCore {
  /**
   * An instance of a [[NodeResource]].  
   * This node keeps a reference to its resource an can thus optimize serialization
   * @author Jirka Dell'Oro-Friedl, HFU, 2019
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Resource
   */
  export class NodeResourceInstance extends Node {
    /** id of the resource that instance was created from */
    // TODO: examine, if this should be a direct reference to the NodeResource, instead of the id
    private idSource: string = undefined;

    constructor(_nodeResource: NodeResource) {
      super("NodeResourceInstance");
      // if (_nodeResource)
      //   this.set(_nodeResource);
    }

    /**
     * Recreate this node from the [[NodeResource]] referenced
     */
    public async reset(): Promise<void> {
      let resource: NodeResource = <NodeResource> await ResourceManager.get(this.idSource);
      this.set(resource);
    }

    //TODO: optimize using the referenced NodeResource, serialize/deserialize only the differences
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.idSource = this.idSource;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.idSource = _serialization.idSource;
      return this;
    }

    /**
     * Set this node to be a recreation of the [[NodeResource]] given
     * @param _nodeResource
     */
    public async set(_nodeResource: NodeResource): Promise<void> {
      // TODO: examine, if the serialization should be stored in the NodeResource for optimization
      let serialization: Serialization = Serializer.serialize(_nodeResource);
      //Serializer.deserialize(serialization);
      for (let path in serialization) {
        await this.deserialize(serialization[path]);
        break;
      }
      this.idSource = _nodeResource.idResource;
      this.dispatchEvent(new Event(EVENT.NODERESOURCE_INSTANTIATED));
    }
  }
}