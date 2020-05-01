"use strict";
var Import;
(function (Import) {
    console.log(Import.data);
    for (let dim in Import.data) {
        console.groupCollapsed(dim);
        let closure = parseOperation(Import.data[dim]);
        console.groupEnd();
        console.log("Created", closure);
        closure();
    }
    function parseOperation(_data) {
        let op = _data["operation"];
        let args = _data["arguments"];
        if (!op) {
            console.log("Error, no operation defined");
            return null;
        }
        // console.log(op);
        // console.log(args);
        let parameters = [];
        for (let arg of args) {
            switch (typeof (arg)) {
                case "object":
                    console.log("Operation", arg);
                    let result = parseOperation(arg);
                    parameters.push(result);
                    break;
                case "string":
                    console.log("String", arg);
                    parameters.push(arg);
                    break;
                case "number":
                    console.log("Number", arg);
                    parameters.push(arg);
                    break;
            }
        }
        let closure = createClosure(parameters);
        return closure;
    }
    function createClosure(_parameters) {
        let closure = function ( /* imput parameter */) {
            console.log("Closure", _parameters);
            for (let param of _parameters) {
                if (typeof (param) == "function") {
                    let result = param();
                    console.log("Result", result);
                }
            }
            return 0.5;
        };
        return closure;
    }
})(Import || (Import = {}));
//# sourceMappingURL=Import.js.map