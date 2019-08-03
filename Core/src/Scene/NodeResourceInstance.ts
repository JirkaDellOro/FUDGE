namespace Fudge {
    /**
     * An instance of a [[NodeResource]].  
     * This node keeps a reference to its resource an can thus optimize serialization
     */
    export class NodeResourceInstance extends Node {
        /** id of the resource that instance was created from */
        // TODO: examine, if this should be a direct reference to the NodeResource, instead of the id
        private idSource: string = undefined;

        constructor(_nodeResource: NodeResource) {
            super("NodeResourceInstance");
            this.set(_nodeResource);
        }

        /**
         * Recreate this node from the [[NodeResource]] referenced
         */
        public reset(): void {
            let resource: NodeResource = <NodeResource>ResourceManager.get(this.idSource);
            this.set(resource);
        }

        /**
         * Set this node to be a recreation of the [[NodeResource]] given
         * @param _nodeResource
         */
        private set(_nodeResource: NodeResource): void {
            // TODO: examine, if the serialization should be stored in the NodeResource for optimization
            let serialization: Serialization = Serializer.serialize(_nodeResource);
            //Serializer.deserialize(serialization);
            for (let path in serialization) {
                this.deserialize(serialization[path]);
                break;
            }
            this.idSource = _nodeResource.idResource;
        }

        //TODO: serialize/deserialize using the referenced NodeResource!
    }
}