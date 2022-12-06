var RaysSceneVR;
(function (RaysSceneVR) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(RaysSceneVR); // Register the namespace to FUDGE for serialization
    class RayHelper extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        //  public static readonly iSubclass: number = f.Component.registerSubclass(RayHelper);
        // Properties may be mutated by users in the editor via the automatically created user interface
        xrViewport = null;
        controllerTransform;
        maxLength;
        pickableObjects;
        pick = null;
        constructor(_xrViewport, _controllerTransform, _lengthRay, _pickableObjects) {
            super();
            this.xrViewport = _xrViewport;
            this.controllerTransform = _controllerTransform;
            this.maxLength = _lengthRay;
            this.pickableObjects = _pickableObjects;
            // Don't start when running in editor
            if (f.Project.mode == f.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
        computeRay = (_webXRControllerTransform, rayNode) => {
            rayNode.getComponent(f.ComponentTransform).mtxLocal = _webXRControllerTransform.mtxLocal;
            let forward;
            forward = f.Vector3.Z();
            forward.transform(rayNode.mtxWorld, false);
            let ray = new f.Ray(new f.Vector3(forward.x * 10000, forward.y * 10000, forward.z * 10000), rayNode.mtxLocal.translation, 0.1);
            if (!this.pick) {
                rayNode.getComponent(f.ComponentMesh).mtxPivot.scaling = new f.Vector3(0.1, this.maxLength, 0.1);
                rayNode.getComponent(f.ComponentMesh).mtxPivot.translation = new f.Vector3(0, 0, -this.maxLength / 2);
            }
            else {
                let distance = ray.getDistance(this.pick.mtxLocal.translation);
                rayNode.getComponent(f.ComponentMesh).mtxPivot.scaling = new f.Vector3(0.1, distance.magnitude, 0.1);
                rayNode.getComponent(f.ComponentMesh).mtxPivot.translation = new f.Vector3(0, 0, -distance.magnitude / 2);
            }
            // let picker: f.Pick[] = f.Picker.pickRay(this.pickableObjects, ray, 0, 100000000000000000);
            // picker.sort((a: f.Pick, b: f.Pick) => a.zBuffer < b.zBuffer ? -1 : 1);
            // picker.forEach(element => {
            //     console.log(element.node.name);
            // });
            // if (picker.length > 0) {
            //     this.pick = picker[0].node;
            // } else this.pick = null;
        };
        update = () => {
            if (this.xrViewport.vr.xrSession)
                this.computeRay(this.controllerTransform, this.node);
        };
    }
    RaysSceneVR.RayHelper = RayHelper;
})(RaysSceneVR || (RaysSceneVR = {}));
//# sourceMappingURL=RayHelper.js.map