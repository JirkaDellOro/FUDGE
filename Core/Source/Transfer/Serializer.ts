namespace FudgeCore {
    // tslint:disable-next-line: no-any
    export type General = any;

    export interface Serialization {
        [type: string]: General;
    }
    export interface Serializable {
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
    }

    interface NamespaceRegister {
        [name: string]: Object;
    }

    /**
     * Handles the external serialization and deserialization of [[Serializable]] objects. The internal process is handled by the objects themselves.  
     * A [[Serialization]] object can be created from a [[Serializable]] object and a JSON-String may be created from that.  
     * Vice versa, a JSON-String can be parsed to a [[Serialization]] which can be deserialized to a [[Serializable]] object.
     * ```plaintext
     *  [Serializable] → (serialize) → [Serialization] → (stringify)  
     *                                                        ↓
     *                                                    [String]
     *                                                        ↓
     *  [Serializable] ← (deserialize) ← [Serialization] ← (parse)
     * ```      
     * While the internal serialize/deserialize methods of the objects care of the selection of information needed to recreate the object and its structure,  
     * the [[Serializer]] keeps track of the namespaces and classes in order to recreate [[Serializable]] objects. The general structure of a [[Serialization]] is as follows  
     * ```plaintext
     * {
     *      namespaceName.className: {
     *          propertyName: propertyValue,
     *          ...,
     *          propertyNameOfReference: SerializationOfTheReferencedObject,
     *          ...,
     *          constructorNameOfSuperclass: SerializationOfSuperClass
     *      }
     * }
     * ```
     * Since the instance of the superclass is created automatically when an object is created, 
     * the SerializationOfSuperClass omits the the namespaceName.className key and consists only of its value. 
     * The constructorNameOfSuperclass is given instead as a property name in the serialization of the subclass.
     */
    export abstract class Serializer {
        /** In order for the Serializer to create class instances, it needs access to the appropriate namespaces */
        private static namespaces: NamespaceRegister = { "ƒ": FudgeCore };

        /**
         * Registers a namespace to the [[Serializer]], to enable automatic instantiation of classes defined within
         * @param _namespace 
         */
        public static registerNamespace(_namespace: Object): void {
            for (let name in Serializer.namespaces)
                if (Serializer.namespaces[name] == _namespace)
                    return;

            let name: string = Serializer.findNamespaceIn(_namespace, window);
            if (!name)
                for (let parentName in Serializer.namespaces) {
                    name = Serializer.findNamespaceIn(_namespace, Serializer.namespaces[parentName]);
                    if (name) {
                        name = parentName + "." + name;
                        break;
                    }
                }

            if (!name)
                throw new Error("Namespace not found. Maybe parent namespace hasn't been registered before?");

            Serializer.namespaces[name] = _namespace;
        }


        /**
         * Returns a javascript object representing the serializable FUDGE-object given,
         * including attached components, children, superclass-objects all information needed for reconstruction
         * @param _object An object to serialize, implementing the [[Serializable]] interface
         */
        public static serialize(_object: Serializable): Serialization {
            let serialization: Serialization = {};
            // TODO: save the namespace with the constructors name
            // serialization[_object.constructor.name] = _object.serialize();
            let path: string = this.getFullPath(_object);
            if (!path)
                throw new Error(`Namespace of serializable object of type ${_object.constructor.name} not found. Maybe the namespace hasn't been registered or the class not exported?`);
            serialization[path] = _object.serialize();
            return serialization;
            // return _object.serialize();
        }

        /**
         * Returns a FUDGE-object reconstructed from the information in the [[Serialization]] given,
         * including attached components, children, superclass-objects
         * @param _serialization 
         */
        public static deserialize(_serialization: Serialization): Serializable {
            let reconstruct: Serializable;
            try {
                // loop constructed solely to access type-property. Only one expected!
                for (let path in _serialization) {
                    // reconstruct = new (<General>Fudge)[typeName];
                    reconstruct = Serializer.reconstruct(path);
                    reconstruct.deserialize(_serialization[path]);
                    return reconstruct;
                }
            } catch (message) {
                throw new Error("Deserialization failed: " + message);
            }
            return null;
        }

        //TODO: implement prettifier to make JSON-Stringification of serializations more readable, e.g. placing x, y and z in one line
        public static prettify(_json: string): string { return _json; }

        /**
         * Returns a formatted, human readable JSON-String, representing the given [[Serializaion]] that may have been created by [[Serializer]].serialize
         * @param _serialization
         */
        public static stringify(_serialization: Serialization): string {
            // adjustments to serialization can be made here before stringification, if desired
            let json: string = JSON.stringify(_serialization, null, 2);
            let pretty: string = Serializer.prettify(json);
            return pretty;
        }

        /**
         * Returns a [[Serialization]] created from the given JSON-String. Result may be passed to [[Serializer]].deserialize
         * @param _json 
         */
        public static parse(_json: string): Serialization {
            return JSON.parse(_json);
        }
        
        /**
         * Creates an object of the class defined with the full path including the namespaceName(s) and the className seperated by dots(.) 
         * @param _path 
         */
        private static reconstruct(_path: string): Serializable {
            let typeName: string = _path.substr(_path.lastIndexOf(".") + 1);
            let namespace: Object = Serializer.getNamespace(_path);
            if (!namespace)
                throw new Error(`Namespace of serializable object of type ${typeName} not found. Maybe the namespace hasn't been registered?`);
            let reconstruction: Serializable = new (<General>namespace)[typeName];
            return reconstruction;
        }

        /**
         * Returns the full path to the class of the object, if found in the registered namespaces
         * @param _object 
         */
        private static getFullPath(_object: Serializable): string {
            let typeName: string = _object.constructor.name;
            // Debug.log("Searching namespace of: " + typeName);
            for (let namespaceName in Serializer.namespaces) {
                let found: General = (<General>Serializer.namespaces)[namespaceName][typeName];
                if (found && _object instanceof found)
                    return namespaceName + "." + typeName;
            }
            return null;
        }

        /**
         * Returns the namespace-object defined within the full path, if registered
         * @param _path
         */
        private static getNamespace(_path: string): Object {
            let namespaceName: string = _path.substr(0, _path.lastIndexOf("."));
            return Serializer.namespaces[namespaceName];
        }

        /**
         * Finds the namespace-object in properties of the parent-object (e.g. window), if present
         * @param _namespace 
         * @param _parent 
         */
        private static findNamespaceIn(_namespace: Object, _parent: Object): string {
            for (let prop in _parent)
                if ((<General>_parent)[prop] == _namespace)
                    return prop;
            return null;
        }
    }
}