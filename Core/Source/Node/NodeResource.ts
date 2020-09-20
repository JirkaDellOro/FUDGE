namespace FudgeCore {
  /**
   * A node managed by [[ResourceManager]] that functions as a template for [[NodeResourceInstance]]s 
   * @author Jirka Dell'Oro-Friedl, HFU, 2019
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Resource
   */
  export class NodeResource extends Node implements SerializableResource {
    public idResource: string = undefined;

    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.idResource = this.idResource;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      Project.register(this, _serialization.idResource);
      return this;
    }
  }
}