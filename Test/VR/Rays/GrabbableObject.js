var RaySceneVR;
(function (RaySceneVR) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(RaySceneVR); // Register the namespace to FUDGE for serialization
    class GrabbableObject extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        isGrabbed = false;
        constructor() {
            super();
        }
    }
    RaySceneVR.GrabbableObject = GrabbableObject;
})(RaySceneVR || (RaySceneVR = {}));
//# sourceMappingURL=GrabbableObject.js.map