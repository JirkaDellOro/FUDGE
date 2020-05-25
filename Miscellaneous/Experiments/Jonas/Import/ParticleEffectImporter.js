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
            // parse scaling
            this.definition.scaling = this.parseVectorData(_data.scaling, 1);
            // parse color
            //TODO: Refactor color and vector because code duplication
            if (!_data.color)
                _data.color = {};
            this.definition.color = {
                r: this.parseClosure(_data.color.r),
                g: this.parseClosure(_data.color.g),
                b: this.parseClosure(_data.color.b),
                a: this.parseClosure(_data.color.a, 1)
            };
            return this.definition;
        }
        /**
         * Parse the given paticle vector. If _data is undefined return a closure vector which functions return the given _identityElement.
         * @param _data the paticle vector data to parse
         * @param _identityElement the number which will be returned by each function if the respective closure data is undefined
         */
        parseVectorData(_data, _identityElement = 0) {
            if (!_data) {
                _data = {};
            }
            return {
                x: this.parseClosure(_data.x, _identityElement),
                y: this.parseClosure(_data.y, _identityElement),
                z: this.parseClosure(_data.z, _identityElement)
            };
        }
        /**
         * Parse the given closure data recursivley. If _data is undefined return a function which returns the given _identityElement.
         *  e.g. undefined scaling data (x,y,z values) should be set to 1 instead of 0.
         * @param _data the closure data to parse recursively
         * @param _identityElement the number which will be returned by the function if _data is undefined
         */
        parseClosure(_data, _identityElement = 0) {
            switch (typeof _data) {
                case "undefined":
                    return () => {
                        return _identityElement;
                    };
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
                case "string":
                    if (_data in this.storedValues) {
                        return () => {
                            Import.f.Debug.log("Variable", `"${_data}"`, this.storedValues[_data]);
                            return this.storedValues[_data];
                        };
                    }
                    else {
                        Import.f.Debug.error(`"${_data}" is not defined`);
                        return null;
                    }
                case "number":
                    return function () {
                        Import.f.Debug.log("Constant", _data);
                        return _data;
                    };
            }
        }
    }
    Import.ParticleEffectImporter = ParticleEffectImporter;
})(Import || (Import = {}));
//# sourceMappingURL=ParticleEffectImporter.js.map