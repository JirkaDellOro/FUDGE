namespace Fudge {
    // tslint:disable-next-line: no-any
    export type General = any;

    export interface Serialization {
        [type: string]: General;
    }
    export interface Serializable {
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
    }

    export class Serializer {
        // TODO: examine, if this class should be placed in another namespace, since calling Fudge[...] there doesn't require the use of 'any'
        // TODO: examine, if the deserialize-Methods of Serializables should be static, returning a new object of the class

        /**
         * Returns a javascript object representing the serializable FUDGE-object given,
         * including attached components, children, superclass-objects all information needed for reconstruction
         * @param _object An object to serialize, implementing the Serializable interface
         */
        public static serialize(_object: Serializable): Serialization {
            let serialization: Serialization = {};
            serialization[_object.constructor.name] = _object.serialize();
            return serialization;
            // return _object.serialize();
        }

        /**
         * Returns a FUDGE-object reconstructed from the information in the serialization-object given,
         * including attached components, children, superclass-objects
         * @param _serialization Required as { "Classname": {attribute: value, ... } }
         */
        public static deserialize(_serialization: Serialization): Serializable {
            let reconstruct: Serializable;
            try {
                // loop constructed solely to access type-property. Only one expected!
                for (let typeName in _serialization) {
                    reconstruct = new (<General>Fudge)[typeName];
                    reconstruct.deserialize(_serialization[typeName]);
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
    }
}