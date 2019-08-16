/// <reference types="../../../Core/Build/FudgeCore" />
//import * as ƒ from "../../../Core/Build/Fudge";
var SumUp;
/// <reference types="../../../Core/Build/FudgeCore" />
//import * as ƒ from "../../../Core/Build/Fudge";
(function (SumUp) {
    var ƒ = FudgeCore;
    let v1 = new ƒ.Vector3(1, 0, 0);
    let v2 = new ƒ.Vector3(0, 1, 0);
    let v3 = new ƒ.Vector3(0, 0, 1);
    let sum = ƒ.Vector3.SUM(v1, v2, v3);
    console.log(sum.getMutator());
})(SumUp || (SumUp = {}));
//# sourceMappingURL=SumUp.js.map