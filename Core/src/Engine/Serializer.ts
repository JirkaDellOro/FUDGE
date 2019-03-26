namespace Fudge {
    // tslint:disable-next-line: no-any
    type General = any;

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

        public static serialize(_object: Serializable): Serialization {
            let serialization: Serialization = {};
            serialization[_object.constructor.name] = _object.serialize();
            return serialization;
        }

        public static deserialize(_serialization: Serialization): Serializable {
            let reconstruct: Serializable;
            for (let typeName in _serialization) {
                // TODO: it doesn't make sense to overwrite reconstruct in the loop. Either accumulate or no loop...
                reconstruct = new (<General>Fudge)[typeName];
                reconstruct.deserialize(_serialization[typeName]);
            }
            return reconstruct;
        }
    }
}