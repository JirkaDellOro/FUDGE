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
        parseFile(_data: ParticleEffectData): ParticleEffectDefinition;
        private parseClosure;
    }
    export {};
}
