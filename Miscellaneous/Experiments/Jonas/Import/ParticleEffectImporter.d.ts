declare namespace Import {
    interface ClosureStorage {
        [key: string]: Function;
    }
    export interface ParticleEffectDefinition {
        storage?: ClosureStorage;
        translation?: ClosureStorage;
        rotation?: ClosureStorage;
        translationWorld?: ClosureStorage;
    }
    export class ParticleEffectImporter {
        private storedValues;
        private randomNumbers;
        private definition;
        constructor(_storedValues: StoredValues, _randomNumbers: number[]);
        importFile(_filename: string): void;
        /**
         * Parse the data from json file and return a particle effect definition
         * @param _data the data to parse
         * @returns a definition of the particle effect containing the closure for translation, rotation etc.
         */
        parseFile(_data: ParticleEffectData): ParticleEffectDefinition;
        /**
         *
         * @param _data the closure data to parse recursively
         */
        private parseClosure;
    }
    export {};
}
