"use strict";
var MutatorGeneration;
(function (MutatorGeneration) {
    class ParticleEffectImporter {
        constructor(_storedValues, _randomNumbers) {
            this.storedValues = _storedValues;
            this.randomNumbers = _randomNumbers;
        }
        importFile(_filename) {
            //TODO: import file
            let file = new XMLHttpRequest();
            file.open("GET", _filename, false);
            file.send();
            let data = JSON.parse(file.responseText);
            return this.parseFile(data);
        }
        /**
         * Parse the data from json file and return a particle effect definition
         * @param _data the data to parse
         * @returns a definition of the particle effect containing the closure for translation, rotation etc.
         */
        parseFile(_data) {
            // console.log(_data);
            // pre parse storage and initialize stored values
            this.preParseStorage(_data["Storage"]);
            this.parseDataRecursively(_data);
            return _data;
        }
        /**
         * Create entries in stored values for each defined storage closure. Predefined values (time, index...) and previously defined ones (in json) can not be overwritten.
         * @param _data The paticle data to parse
         */
        preParseStorage(_data) {
            for (const storagePartition in _data) {
                let storage = _data[storagePartition];
                for (const storageValue in storage) {
                    if (storageValue in this.storedValues) {
                        throw `"${storageValue}" is already defined`;
                    }
                    else
                        this.storedValues[storageValue] = 0;
                }
            }
        }
        // TODO: COMMENT
        parseDataRecursively(_data) {
            for (const key in _data) {
                let value = _data[key];
                if (typeof value === "string" || typeof value === "number" || "function" in value)
                    _data[key] = this.parseClosure(value);
                else {
                    this.parseDataRecursively(value);
                }
            }
        }
        /**
         * Parse the given closure data recursivley. If _data is undefined return a function which returns the given _undefinedValue,
         * e.g. undefined scaling data (x,y,z values) should be set to 1 instead of 0.
         * @param _data The closure data to parse recursively
         * @param _undefinedValue The number which will be returned by the function if _data is undefined
         */
        parseClosure(_data) {
            switch (typeof _data) {
                case "object":
                    let parameters = [];
                    for (let param of _data.parameters) {
                        parameters.push(this.parseClosure(param));
                    }
                    // random closure needs to have the random numbers array as a parameter
                    if (_data.function == "random") {
                        parameters.push(() => {
                            return this.randomNumbers;
                        });
                    }
                    let closure = FudgeCore.ClosureFactory.getClosure(_data.function, parameters);
                    return closure;
                case "string":
                    if (_data in this.storedValues) {
                        return () => {
                            FudgeCore.Debug.log("Variable", `"${_data}"`, this.storedValues[_data]);
                            return this.storedValues[_data];
                        };
                    }
                    else {
                        throw `"${_data}" is not defined`;
                    }
                case "number":
                    return function () {
                        FudgeCore.Debug.log("Constant", _data);
                        return _data;
                    };
            }
        }
    }
    MutatorGeneration.ParticleEffectImporter = ParticleEffectImporter;
})(MutatorGeneration || (MutatorGeneration = {}));
//# sourceMappingURL=ParticleEffectImporter.js.map