namespace Fudge {
    export interface SerializableResource extends Serializable {
        idResource: string;
    }

    export interface Resources {
        [idResource: string]: SerializableResource;
    }

    export interface SerializationOfResources {
        [idResource: string]: Serialization;
    }

    export class ResourceManager {
        public static resources: Resources = {};
        public static serialization: SerializationOfResources = null;

        public static register(_resource: SerializableResource): void {
            if (!_resource.idResource)
                _resource.idResource = ResourceManager.generateId(_resource);
            ResourceManager.resources[_resource.idResource] = _resource;
        }

        public static generateId(_resource: SerializableResource): string {
            // TODO: build id and integrate info from resource, not just date
            let idResource: string = _resource.constructor.name + "|" + new Date().toISOString() + "|" + Math.random().toPrecision(5);
            return idResource;
        }

        /**
         * Tests, if an object is a [[SerializableResource]]
         * @param _object The object to examine
         */
        public static isResource(_object: Serializable): boolean {
            return (Reflect.has(_object, "idResource"));
        }

        public static get(_idResource: string): SerializableResource {
            let resource: SerializableResource = ResourceManager.resources[_idResource];
            if (!resource) {
                let serialization: Serialization = ResourceManager.serialization[_idResource];
                if (!serialization) {
                    Debug.error("Resource not found", _idResource);
                    return null;
                }
                resource = ResourceManager.deserializeResource(serialization);
            }
            return resource;
        }

        public static registerNodeAsResource(_node: Node): NodeResource {
            // let nodeResource: NodeResource = <NodeResource>_node;
            // ResourceManager.register(nodeResource);
            // replace node with NodeResourceInstance 
            // -> therefore it would be better to just alter its class and create the resource be serializing/deserializing
            let serialization: Serialization = _node.serialize();
            let nodeResource: NodeResource = new NodeResource("NodeResource"); 
            nodeResource.deserialize(serialization["Node"]);
            ResourceManager.register(nodeResource);

            return nodeResource;
        }

        public static instantiateNodeResource(_nodeResource: NodeResource): NodeResourceInstance {
            let instance: NodeResourceInstance = new NodeResourceInstance("NodeResourceInstance");
            // TODO: cache serialization for optimization
            let serialization: Serialization = _nodeResource.serialize();
            instance.deserialize(serialization["NodeResource"]);
            instance.idSource = _nodeResource.idResource;   
            return instance;
        }

        public static serialize(): SerializationOfResources {
            let serialization: SerializationOfResources = {};
            for (let idResource in ResourceManager.resources) {
                let resource: SerializableResource = ResourceManager.resources[idResource];
                if (idResource != resource.idResource)
                    Debug.error("Resource-id mismatch", resource);
                serialization[idResource] = resource.serialize();
            }
            return serialization;
        }

        public static deserialize(_serialization: SerializationOfResources): Resources {
            ResourceManager.serialization = _serialization;
            ResourceManager.resources = {};
            for (let idResource in _serialization) {
                let serialization: Serialization = _serialization[idResource];
                let resource: SerializableResource = ResourceManager.deserializeResource(serialization);
                if (resource)
                    ResourceManager.resources[idResource] = resource;
            }
            return ResourceManager.resources;
        }

        public static deserializeResource(_serialization: Serialization): SerializableResource {
            let reconstruct: Serializable;
            try {
                // loop constructed solely to access type-property. Only one expected!
                for (let typeName in _serialization) {
                    reconstruct = new (<General>Fudge)[typeName];
                    reconstruct.deserialize(_serialization[typeName]);
                    return <SerializableResource>reconstruct;
                }
            } catch (message) {
                throw new Error("Deserialization failed: " + message);
            }
            return null;
        }
    }
}