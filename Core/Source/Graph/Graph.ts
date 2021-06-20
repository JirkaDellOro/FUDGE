namespace FudgeCore {
  /**
   * A node managed by {@link Project} that functions as a template for {@link GraphInstance}s 
   * @author Jirka Dell'Oro-Friedl, HFU, 2019
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Resource
   */
  export class Graph extends Node implements SerializableResource {
    public idResource: string = undefined;
    public type: string = "Graph";

    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.idResource = this.idResource;
      serialization.type = this.type;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      Project.register(this, _serialization.idResource);
      return this;
    }
  }
}