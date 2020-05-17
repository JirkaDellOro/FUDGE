"use strict";
// namespace Import {
//   console.log(data);
//   for (let dim in data) {
//     console.groupCollapsed(dim);
//     let closure: Function = parseOperation(data[dim]);
//     console.groupEnd();
//     console.log("Created", closure);
//     closure();
//   }
//   function parseOperation(_data: ParticleData): Function {
//     let op: string = _data["operation"];
//     let args: (ParticleData | string | number)[] = _data["arguments"];
//     if (!op) {
//       console.log("Error, no operation defined");
//       return null;
//     }
//     // console.log(op);
//     // console.log(args);
//     let parameters: (Function | string | number)[] = [];
//     for (let arg of args) {
//       switch (typeof (arg)) {
//         case "object":
//           console.log("Operation", arg);
//           let result: Function = parseOperation(<ParticleData>arg);
//           parameters.push(result);
//           break;
//         case "string":
//           console.log("String", arg);
//           parameters.push(arg);
//           break;
//         case "number":
//           console.log("Number", arg);
//           parameters.push(arg);
//           break;
//       }
//     }
//     let closure: Function = createClosure(parameters);
//     return closure;
//   }
//   function createClosure(_parameters: (Function | string | number)[]): Function {
//     let closure: Function = function (/* imput parameter */): number {
//       console.log("Closure", _parameters);
//       for (let param of _parameters) {
//         if (typeof (param) == "function") {
//           let result: number = (<Function>param)();
//           console.log("Result", result);
//         }
//       }
//       return 0.5;
//     };
//     return closure;
//   }
// }
//# sourceMappingURL=ImportOld.js.map