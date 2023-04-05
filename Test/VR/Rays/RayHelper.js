var RaySceneVR;
(function (RaySceneVR) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(RaySceneVR); // Register the namespace to FUDGE for serialization
    class RayHelper extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        //  public static readonly iSubclass: number = f.Component.registerSubclass(RayHelper);
        // Properties may be mutated by users in the editor via the automatically created user interface
        xrViewport = null;
        controller;
        maxLength;
        pickableObjects;
        cubeContainer;
        pick = null;
        ray = null;
        constructor(_xrViewport, _controller, _lengthRay, _cubeContainer) {
            super();
            this.xrViewport = _xrViewport;
            this.controller = _controller;
            this.maxLength = _lengthRay;
            this.cubeContainer = _cubeContainer;
            this.pickableObjects = _cubeContainer.getChildren();
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
                    this.xrViewport.session.addEventListener("squeeze", this.onSqueeze);
                    this.xrViewport.session.addEventListener("selectstart", this.onSelectStart);
                    this.xrViewport.session.addEventListener("selectend", this.onSelectEnd);
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
        computeRay = () => {
            if (!this.hasObject) {
                this.node.getComponent(f.ComponentTransform).mtxLocal = this.controller.cmpTransform.mtxLocal;
                let forward;
                forward = f.Vector3.Z();
                forward.transform(this.node.mtxWorld, false);
                this.ray = new f.Ray(f.Vector3.SCALE(new f.Vector3(forward.x, forward.y, forward.z), -1000), this.node.mtxLocal.translation, 0.1);
                if (!this.pick) {
                    this.node.getComponent(f.ComponentMesh).mtxPivot.scaling = new f.Vector3(0.025, this.maxLength, 0.025);
                    this.node.getComponent(f.ComponentMesh).mtxPivot.translation = new f.Vector3(0, 0, -this.maxLength / 2 + 0.2);
                    this.node.getComponent(f.ComponentMaterial).clrPrimary = new f.Color(100, 100, 100, 0.5);
                }
                else {
                    let distance = f.Vector3.DIFFERENCE(this.pick.mtxLocal.translation, this.controller.cmpTransform.mtxLocal.translation);
                    this.node.getComponent(f.ComponentMesh).mtxPivot.scaling = new f.Vector3(0.025, distance.magnitude, 0.025);
                    this.node.getComponent(f.ComponentMesh).mtxPivot.translation = new f.Vector3(0, 0, -distance.magnitude / 2 + 0.2);
                    this.node.getComponent(f.ComponentMaterial).clrPrimary = this.pick.getComponent(f.ComponentMaterial).clrPrimary;
                    this.node.getComponent(f.ComponentMaterial).clrPrimary.a = 0.5;
                }
                let picker = f.Picker.pickRay(this.pickableObjects, this.ray, 0, 1);
                picker.sort((a, b) => a.zBuffer < b.zBuffer ? -1 : 1);
                if (picker.length > 0) {
                    this.pick = picker[0].node;
                }
                else
                    this.pick = null;
            }
        };
        hasObject = false;
        lastPosCntrl = f.Vector3.ZERO();
        update = () => {
            if (this.xrViewport.session) {
                this.computeRay();
                if (this.hasObject) {
                    let interpolatedDiff = f.Vector3.DIFFERENCE(this.lastPosCntrl, this.controller.cmpTransform.mtxLocal.translation).z;
                    if (this.lastPosCntrl.z < 0)
                        this.pick.mtxLocal.translation = new f.Vector3(0, 0, -this.node.getComponent(f.ComponentMesh).mtxPivot.scaling.y + (interpolatedDiff * 25));
                    else
                        this.pick.mtxLocal.translation = new f.Vector3(0, 0, -this.node.getComponent(f.ComponentMesh).mtxPivot.scaling.y + (-interpolatedDiff * 25));
                    this.pick.mtxLocal.rotation = this.controller.cmpTransform.mtxLocal.rotation;
                }
            }
        };
        onSqueeze = (_event) => {
            if (this.pick) {
                this.xrViewport.vrDevice.translation = this.pick.getComponent(f.ComponentTransform).mtxLocal.translation;
            }
        };
        onSelectStart = (_event) => {
            if (this.pick && !this.pick.getComponent(RaySceneVR.GrabbableObject).isGrabbed) {
                this.node.addChild(this.pick);
                this.lastPosCntrl = this.controller.cmpTransform.mtxLocal.translation;
                this.pick.getComponent(RaySceneVR.GrabbableObject).isGrabbed = true;
                this.hasObject = true;
            }
        };
        onSelectEnd = (_event) => {
            if (this.pick) {
                this.hasObject = false;
                this.pick.getComponent(RaySceneVR.GrabbableObject).isGrabbed = false;
                this.cubeContainer.addChild(this.pick);
                this.pick.mtxLocal.translation = new f.Vector3(this.pick.mtxWorld.translation.x, this.pick.mtxWorld.translation.y, this.pick.mtxWorld.translation.z);
                this.pick.mtxLocal.rotation = new f.Vector3(this.pick.mtxWorld.rotation.x, this.pick.mtxWorld.rotation.y, this.pick.mtxWorld.rotation.z);
            }
        };
    }
    RaySceneVR.RayHelper = RayHelper;
})(RaySceneVR || (RaySceneVR = {}));
//# sourceMappingURL=RayHelper.js.map