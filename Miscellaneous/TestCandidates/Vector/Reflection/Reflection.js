/// <reference types="../../../Core/Build/FudgeCore" />
//import * as ƒ from "../../../Core/Build/Fudge";
var SumUp;
/// <reference types="../../../Core/Build/FudgeCore" />
//import * as ƒ from "../../../Core/Build/Fudge";
(function (SumUp) {
    var ƒ = FudgeCore;
    let v1 = new ƒ.Vector3(1, 0, 0);
    let normal = ƒ.Vector3.NORMALIZATION(new ƒ.Vector3(1, 1, 0));
    let reflection = ƒ.Vector3.REFLECTION(v1, normal);
    console.log(reflection.getMutator());
})(SumUp || (SumUp = {}));
//# sourceMappingURL=Reflection.js.map