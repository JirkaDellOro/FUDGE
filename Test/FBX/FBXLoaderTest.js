///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
var SkeletonTest;
///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
(function (SkeletonTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    async function init() {
        const loader = await ƒ.FBXLoader.LOAD("./Unarmed Walk Forward.fbx");
        console.log(loader.nodes);
        console.log(loader.getObjects());
    }
})(SkeletonTest || (SkeletonTest = {}));
//# sourceMappingURL=FBXLoaderTest.js.map