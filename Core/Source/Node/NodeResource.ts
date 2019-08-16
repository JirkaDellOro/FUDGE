namespace FudgeCore {
    /**
     * A node managed by [[ResourceManager]] that functions as a template for [[NodeResourceInstance]]s 
     */
    export class NodeResource extends Node implements SerializableResource {
        public idResource: string = undefined;
    }
}