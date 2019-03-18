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

        public serialize(_object: Serializable): Serialization {
            let serialization: Serialization = {};
            serialization[_object.constructor.name] = _object.serialize();
            return serialization;
        }

        public deserialize(_serialization: Serialization): Serializable {
            let reconstruct: Serializable;
            for (let typeName in _serialization) {
                reconstruct = new (<General>Fudge)[typeName];
                reconstruct.deserialize(_serialization[typeName]);
            }
            return reconstruct;
        }
    }
}