"use strict";
var Import;
(function (Import) {
    class ParticleEffectImporter {
        constructor() {
            this.definition = {};
        }
        importFile(_filename) {
            //TODO: import file
        }
        parseFile(_data) {
            this.definition.storage = {};
            for (const key in _data.particle.store) {
                if (key in this.storedValues)
                    console.error("Predfined varaiables can not be overwritten");
                else
                    this.definition.storage[key] = this.parseClosure(_data.particle.store[key]);
            }
            this.definition.translation = {};
            for (const key in _data.particle.translation) {
                if (["x", "y", "z"].includes(key)) { //TODO: define only once
                    this.definition.translation[key] = this.parseClosure(_data.particle.translation[key]);
                }
                else {
                    console.error(`"${key}" is not part of a translation`);
                }
            }
            return this.definition;
        }
        parseClosure(_data) {
            if (!_data.operation) {
                console.error("Error, no operation defined");
                return null;
            }
            let parameters = [];
            for (let argument of _data.arguments) {
                switch (typeof (argument)) {
                    case "object":
                        let result = this.parseClosure(argument);
                        parameters.push(result);
                        break;
                    case "string":
                        if (argument in this.definition.storage || argument in this.storedValues) {
                            parameters.push(() => {
                                console.log("Variable", `"${argument}"`, this.storedValues[argument]);
                                return this.storedValues[argument];
                            });
                        }
                        else {
                            console.error(`"${argument}" is not defined`);
                            return null;
                        }
                        break;
                    case "number":
                        parameters.push(function () {
                            console.log("Constant", argument);
                            return argument;
                        });
                        break;
                }
            }
            if (_data.operation == "random") {
                parameters.push(() => {
                    return this.randomNumbers;
                });
            }
            let closure = Import.ClosureFactory.getClosure(_data.operation, parameters);
            return closure;
        }
    }
    Import.ParticleEffectImporter = ParticleEffectImporter;
})(Import || (Import = {}));
//# sourceMappingURL=ParticleEffectImporter.js.map