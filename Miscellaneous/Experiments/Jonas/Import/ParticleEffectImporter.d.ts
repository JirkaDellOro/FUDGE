declare namespace Import {
    interface ClosureStorage {
        [key: string]: Function;
    }
    export interface ParticleEffectDefinition {
        system?: ClosureStorage;
        storage?: ClosureStorage;
        translation?: ClosureStorage;
        rotation?: ClosureStorage;
    }
    export class ParticleEffectImporter {
        storedValues: StoredValues;
        randomNumbers: number[];
        private definition;
        importFile(_filename: string): void;
        parseFile(_data: ParticleSystemData): ParticleEffectDefinition;
        private parseClosure;
    }
    export {};
}
