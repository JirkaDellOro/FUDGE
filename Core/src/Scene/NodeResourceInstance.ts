namespace Fudge {
    export class NodeResourceInstance extends Node {
        /** id of the resource that instance was created from */
        private idSource: string = undefined;

        constructor(_nodeResource: NodeResource) {
            super("NodeResourceInstance");
            this.set(_nodeResource);
        }

        public reset(): void {
            let resource: NodeResource = <NodeResource>ResourceManager.get(this.idSource);
            this.set(resource);
        }

        private set(_nodeResource: NodeResource): void {
            let serialization: Serialization = _nodeResource.serialize();
            this.deserialize(serialization["NodeResource"]);
            this.idSource = _nodeResource.idResource;
        }
    }
}