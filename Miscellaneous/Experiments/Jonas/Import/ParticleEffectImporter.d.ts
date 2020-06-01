declare namespace Import {
    interface ParticleEffectDefinition {
        system?: ClosureStorage;
        update?: ClosureStorage;
        particle?: ClosureStorage;
        translation?: ClosureVector;
        rotation?: ClosureVector;
        translationWorld?: ClosureVector;
        scaling?: ClosureVector;
        color?: ClosureColor;
    }
    interface ClosureStorage {
        [key: string]: Function;
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
         * Create entries in stored values for each defined storage closure. Predefined values (time, index...) and previously defined ones (in json) can not be overwritten.
         * @param _data The paticle data to parse
         */
        private preParseParticleData;
        /**
         * Parse the given particle storage data, create a closure storage and return it
         * @param _data The storage data to parse
         * @param _closureStorage The closure storage to add to
         */
        private parsePaticleData;
        /**
         * Parse the given paticle vector. If _data is undefined return a closure vector which functions return the given _undefinedValue.
         * @param _data The paticle vector data to parse
         * @param _undefinedValue The number which will be returned by each function if the respective closure data is undefined
         */
        private parseVectorData;
        /**
         * Parse the given closure data recursivley. If _data is undefined return a function which returns the given _undefinedValue.
         *  e.g. undefined scaling data (x,y,z values) should be set to 1 instead of 0.
         * @param _data The closure data to parse recursively
         * @param _undefinedValue The number which will be returned by the function if _data is undefined
         */
        private parseClosure;
    }
}
