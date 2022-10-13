/// <reference types="../../../../core/build/fudgecore" />
declare namespace MutatorGeneration {
    interface Data {
        [identifier: string]: Object;
    }
    class ParticleEffectImporter {
        private storedValues;
        private randomNumbers;
        constructor(_storedValues: FudgeCore.StoredValues, _randomNumbers: number[]);
        importFile(_filename: string): Data;
        /**
         * Parse the data from json file and return a particle effect definition
         * @param _data the data to parse
         * @returns a definition of the particle effect containing the closure for translation, rotation etc.
         */
        private parseFile;
        /**
         * Create entries in stored values for each defined storage closure. Predefined values (time, index...) and previously defined ones (in json) can not be overwritten.
         * @param _data The paticle data to parse
         */
        private preParseStorage;
        private parseDataRecursively;
        /**
         * Parse the given closure data recursivley. If _data is undefined return a function which returns the given _undefinedValue,
         * e.g. undefined scaling data (x,y,z values) should be set to 1 instead of 0.
         * @param _data The closure data to parse recursively
         * @param _undefinedValue The number which will be returned by the function if _data is undefined
         */
        private parseClosure;
    }
}
