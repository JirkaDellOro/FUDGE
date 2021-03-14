/// <reference types="../../../Core/Build/FudgeCore" />
//import * as ƒ from "../../../Core/Build/Fudge";

namespace SumUp {
    import ƒ = FudgeCore;
    
    let v1: ƒ.Vector3 = new ƒ.Vector3(1, 0, 0);
    let normal: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(new ƒ.Vector3(1, 1, 0));

    let reflection: ƒ.Vector3 = ƒ.Vector3.REFLECTION(v1, normal);
    console.log(reflection.getMutator());  
}