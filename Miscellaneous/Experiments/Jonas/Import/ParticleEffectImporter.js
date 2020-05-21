"use strict";
var Import;
(function (Import) {
    class ParticleEffectImporter {
        constructor(_storedValues, _randomNumbers) {
            this.definition = {};
            this.storedValues = _storedValues;
            this.randomNumbers = _randomNumbers;
        }
        importFile(_filename) {
            //TODO: import file
        }
        /**
         * Parse the data from json file and return a particle effect definition
         * @param _data the data to parse
         * @returns a definition of the particle effect containing the closure for translation, rotation etc.
         */
        parseFile(_data) {
            // pre parse storage and initialize stored values
            for (const key in _data.storage) {
                if (key in this.storedValues) {
                    Import.f.Debug.error("Predefined variables can not be overwritten");
                    return null;
                }
                else
                    this.storedValues[key] = 0;
            }
            // parse storage
            this.definition.storage = {};
            for (const key in _data.storage) {
                this.definition.storage[key] = this.parseClosure(_data.storage[key]);
            }
            // parse translation locale
            this.definition.translation = this.parseVectorData(_data.translation);
            // parse rotation
            this.definition.rotation = this.parseVectorData(_data.rotation);
            // parse translation world
            this.definition.translationWorld = this.parseVectorData(_data.translationWorld);
            return this.definition;
        }
        /**
         * Parse the given paticle vector. If _data is undefined return a closure vector which functions return 0.
         * @param _data the paticle vector data to parse
         */
        parseVectorData(_data) {
            if (!_data) {
                _data = {};
            }
            let closureVector = {};
            closureVector.x = this.parseClosure(_data.x);
            closureVector.y = this.parseClosure(_data.y);
            closureVector.z = this.parseClosure(_data.z);
            return closureVector;
        }
        /**
         * Parse the given closure data recursivley. If _data is undefined return a function which returns 0.
         * @param _data the closure data to parse recursively
         */
        parseClosure(_data) {
            if (!_data) {
                return function () {
                    return 0;
                };
            }
            if (!_data.function) {
                Import.f.Debug.error("Error, no operation defined");
                return null;
            }
            let parameters = [];
            for (let param of _data.parameters) {
                switch (typeof (param)) {
                    case "object":
                        let result = this.parseClosure(param);
                        parameters.push(result);
                        break;
                    case "string":
                        if (param in this.storedValues) {
                            parameters.push(() => {
                                Import.f.Debug.log("Variable", `"${param}"`, this.storedValues[param]);
                                return this.storedValues[param];
                            });
                        }
                        else {
                            Import.f.Debug.error(`"${param}" is not defined`);
                            return null;
                        }
                        break;
                    case "number":
                        parameters.push(function () {
                            Import.f.Debug.log("Constant", param);
                            return param;
                        });
                        break;
                }
            }
            // random closure needs to have the random numbers array as a parameter
            if (_data.function == "random") {
                parameters.push(() => {
                    return this.randomNumbers;
                });
            }
            let closure = Import.ClosureFactory.getClosure(_data.function, parameters);
            // pre evaluate closure so that only the result will be saved
            if (_data.preEvaluate) {
                Import.f.Debug.log("PreEvaluate");
                let result = closure();
                closure = () => {
                    Import.f.Debug.log("preEvaluated", result);
                    return result;
                };
            }
            return closure;
        }
    }
    Import.ParticleEffectImporter = ParticleEffectImporter;
})(Import || (Import = {}));
//# sourceMappingURL=ParticleEffectImporter.js.map