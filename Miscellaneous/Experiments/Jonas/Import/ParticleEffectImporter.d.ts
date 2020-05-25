declare namespace Import {
    interface ClosureStorage {
        [key: string]: Function;
    }
    interface ParticleEffectDefinition {
        storage?: ClosureStorage;
        translation?: ClosureVector;
        rotation?: ClosureVector;
        translationWorld?: ClosureVector;
        scaling?: ClosureVector;
        color?: ClosureColor;
    }
    interface ClosureVector {
        x?: Function;
        y?: Function;
        z?: Function;
    }
    interface ClosureColor {
        r?: Function;
        g?: Function;
        b?: Function;
        a?: Function;
    }
    class ParticleEffectImporter {
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
         * Parse the given paticle vector. If _data is undefined return a closure vector which functions return the given _identityElement.
         * @param _data the paticle vector data to parse
         * @param _identityElement the number which will be returned by each function if the respective closure data is undefined
         */
        private parseVectorData;
        /**
         * Parse the given closure data recursivley. If _data is undefined return a function which returns the given _identityElement.
         *  e.g. undefined scaling data (x,y,z values) should be set to 1 instead of 0.
         * @param _data the closure data to parse recursively
         * @param _identityElement the number which will be returned by the function if _data is undefined
         */
        private parseClosure;
    }
}
