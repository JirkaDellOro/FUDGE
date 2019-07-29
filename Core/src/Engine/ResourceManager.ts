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

    /**
     * Static class handling the resources used with the current FUDGE-instance.  
     * Keeps a list of the resources and generates ids to retrieve them
     * 
     */
    export class ResourceManager {
        public static resources: Resources = {};
        public static serialization: SerializationOfResources = null;

        /**
         * Generates an id for the resources and registers it with the list of resources 
         * @param _resource 
         */
        public static register(_resource: SerializableResource): void {
            if (!_resource.idResource)
                _resource.idResource = ResourceManager.generateId(_resource);
            ResourceManager.resources[_resource.idResource] = _resource;
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
            while (ResourceManager.resources[idResource]);
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
         * @param _idResource
         */
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

        /**
         * Creates and registers a resource from a [[Node]], copying the complete branch starting with it
         * @param _node A node to create the resource from
         * @param _replaceWithInstance if true (default), the node used as origin is replaced by a [[NodeResourceInstance]] of the [[NodeResource]] created
         */
        public static registerNodeAsResource(_node: Node, _replaceWithInstance: boolean = true): NodeResource {
            let serialization: Serialization = _node.serialize();
            let nodeResource: NodeResource = new NodeResource("NodeResource");
            nodeResource.deserialize(serialization["Node"]);
            ResourceManager.register(nodeResource);

            if (_replaceWithInstance && _node.getParent()) {
                let instance: NodeResourceInstance = new NodeResourceInstance(nodeResource);
                _node.getParent().replaceChild(_node, instance);
            }

            return nodeResource;
        }

        /**
         * Serialize all resources
         */
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

        /**
         * Create resources from a serialization, deleting all resources previously registered
         * @param _serialization 
         */
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

        private static deserializeResource(_serialization: Serialization): SerializableResource {
            // TODO: examine, if this could be accomplished using the regular Serializer...
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