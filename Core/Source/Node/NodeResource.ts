namespace FudgeCore {
  /**
   * A node managed by [[ResourceManager]] that functions as a template for [[NodeResourceInstance]]s 
   * @author Jirka Dell'Oro-Friedl, HFU, 2019
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Resource
   */
  export class NodeResource extends Node implements SerializableResource {
    public idResource: string = undefined;
  }
}