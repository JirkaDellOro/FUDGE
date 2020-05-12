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
        parseFile(_data) {
            this.definition.storage = {};
            for (const key in _data.storage) {
                if (key in this.storedValues)
                    console.error("Predfined varaiables can not be overwritten");
                else
                    this.definition.storage[key] = this.parseClosure(_data.storage[key]);
            }
            this.definition.translation = {};
            for (const key in _data.translation) {
                if (["x", "y", "z"].includes(key)) { //TODO: define only once
                    this.definition.translation[key] = this.parseClosure(_data.translation[key]);
                }
                else {
                    console.error(`"${key}" is not part of a translation`);
                }
            }
            this.definition.translationWorld = {};
            for (const key in _data.translationWorld) {
                if (["x", "y", "z"].includes(key)) { //TODO: define only once
                    this.definition.translationWorld[key] = this.parseClosure(_data.translationWorld[key]);
                }
                else {
                    console.error(`"${key}" is not part of a translation`);
                }
            }
            return this.definition;
        }
        parseClosure(_data) {
            if (!_data.function) {
                console.error("Error, no operation defined");
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
                        if (param in this.definition.storage || param in this.storedValues) { // TODO: simplify this, Problem: this.storedValues only contains time, index, size while parsing
                            parameters.push(() => {
                                console.log("Variable", `"${param}"`, this.storedValues[param]);
                                return this.storedValues[param];
                            });
                        }
                        else {
                            console.error(`"${param}" is not defined`);
                            return null;
                        }
                        break;
                    case "number":
                        parameters.push(function () {
                            console.log("Constant", param);
                            return param;
                        });
                        break;
                }
            }
            if (_data.function == "random") {
                parameters.push(() => {
                    return this.randomNumbers;
                });
            }
            let closure = Import.ClosureFactory.getClosure(_data.function, parameters);
            // pre evaluate closure so that only the result will be saved
            if (_data.preEvaluate) {
                console.log("PreEvaluate");
                let result = closure();
                closure = () => {
                    console.log("preEvaluated", result);
                    return result;
                };
            }
            return closure;
        }
    }
    Import.ParticleEffectImporter = ParticleEffectImporter;
})(Import || (Import = {}));
//# sourceMappingURL=ParticleEffectImporter.js.map