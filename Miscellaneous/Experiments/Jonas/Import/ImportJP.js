"use strict";
var Import;
(function (Import) {
    let storedClosures = {};
    let storedValues = {
        "time": 0.5,
        "index": 0,
        "size": 1
    };
    let randomNumbers = [42];
    test();
    function test() {
        console.log(Import.data);
        parseFile(Import.data);
    }
    function parseFile(_data) {
        for (const key in _data.particle.store) {
            if (storedValues[key])
                console.error("Predfined varaiables can not be overwritten");
            else
                storedClosures[key] = parseOperation(_data.particle.store[key]);
        }
        let closureX = parseOperation(_data.particle.translation["x"]);
        let closureY = parseOperation(_data.particle.translation["y"]);
        for (const key in storedClosures) {
            console.groupCollapsed(`Evaluate storage "${key}"`);
            storedValues[key] = storedClosures[key]();
            console.log(`Stored "${key}"`, storedValues[key]);
            console.groupEnd();
        }
        console.groupCollapsed("Evaluate x");
        console.log("x =", closureX());
        console.groupEnd();
        console.groupCollapsed("Evaluate y");
        console.log("y =", closureY());
        console.groupEnd();
    }
    function parseOperation(_data) {
        if (!_data.operation) {
            console.log("Error, no operation defined");
            return null;
        }
        let parameters = [];
        for (let arg of _data.arguments) {
            switch (typeof (arg)) {
                case "object":
                    let result = parseOperation(arg);
                    parameters.push(result);
                    break;
                case "string":
                    if (arg in storedClosures || arg in storedValues) {
                        parameters.push(function () {
                            console.log("Variable", `"${arg}"`, storedValues[arg]);
                            return storedValues[arg];
                        });
                    }
                    else {
                        console.error(`"${arg}" is not defined`);
                        return null;
                    }
                    break;
                case "number":
                    parameters.push(function () {
                        console.log("Constant", arg);
                        return arg;
                    });
                    break;
            }
        }
        if (_data.operation == "random") {
            parameters.push(function () {
                return randomNumbers;
            });
        }
        let closure = Import.ClosureFactory.getClosure(_data.operation, parameters);
        return closure;
    }
})(Import || (Import = {}));
//# sourceMappingURL=ImportJP.js.map