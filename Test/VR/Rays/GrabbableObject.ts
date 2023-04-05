namespace RaySceneVR {
    import f = FudgeCore;
    f.Project.registerScriptNamespace(RaySceneVR);  // Register the namespace to FUDGE for serialization

    export class GrabbableObject extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        public isGrabbed: boolean = false;
        constructor() {
            super();
        }
    }
}