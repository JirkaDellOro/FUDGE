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
            // let serialization: Serialization = {};
            // serialization[_object.constructor.name] = _object.serialize();
            // return serialization;
            return _object.serialize();
        }

        /**
         * Returns a FUDGE-object reconstructed from the information in the serialization-object given,
         * including attached components, children, superclass-objects
         * @param _serialization 
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
    }
}