namespace RaySceneVR {
    import f = FudgeCore;
    f.Project.registerScriptNamespace(RaySceneVR);  // Register the namespace to FUDGE for serialization

    export class RayHelper extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        //  public static readonly iSubclass: number = f.Component.registerSubclass(RayHelper);

        // Properties may be mutated by users in the editor via the automatically created user interface
        private xrViewport: f.XRViewport = null;
        private controller: f.VRController;
        private maxLength: number;
        private pickableObjects: f.Node[];
        private cubeContainer: f.Node;
        private pick: f.Node = null;
        private ray: f.Ray = null;
        constructor(_xrViewport: f.XRViewport, _controller: f.VRController, _lengthRay: number, _cubeContainer: f.Node) {
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
            this.addEventListener(f.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(f.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(f.EVENT.NODE_DESERIALIZED, this.hndEvent);
        }

        // Activate the functions of this component as response to events
        public hndEvent = (_event: Event): void => {
            switch (_event.type) {
                case f.EVENT.COMPONENT_ADD:
                    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.update);
                    f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
                    this.xrViewport.session.addEventListener("squeeze", this.onSqueeze);
                    this.xrViewport.session.addEventListener("selectstart", this.onSelectStart);
                    this.xrViewport.session.addEventListener("selectend", this.onSelectEnd);

                    break;
                case f.EVENT.COMPONENT_REMOVE:
                    this.removeEventListener(f.EVENT.COMPONENT_ADD, this.hndEvent);
                    this.removeEventListener(f.EVENT.COMPONENT_REMOVE, this.hndEvent);
                    break;
                case f.EVENT.NODE_DESERIALIZED:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        }

        private computeRay = (): void => {
            if (!this.hasObject) {
                this.node.getComponent(f.ComponentTransform).mtxLocal = this.controller.cmpTransform.mtxLocal;
                let forward: f.Vector3;
                forward = f.Vector3.Z();
                forward.transform(this.node.mtxWorld, false);
                this.ray = new f.Ray(f.Vector3.SCALE(new f.Vector3(forward.x, forward.y, forward.z), -1000), this.node.mtxLocal.translation, 0.1);

                if (!this.pick) {
                    this.node.getComponent(f.ComponentMesh).mtxPivot.scaling = new f.Vector3(0.025, this.maxLength, 0.025);
                    this.node.getComponent(f.ComponentMesh).mtxPivot.translation = new f.Vector3(0, 0, -this.maxLength / 2 + 0.2);
                    this.node.getComponent(f.ComponentMaterial).clrPrimary = new f.Color(100, 100, 100, 0.5);
                } else {
                    let distance: f.Vector3 = f.Vector3.DIFFERENCE(this.pick.mtxLocal.translation, this.controller.cmpTransform.mtxLocal.translation);
                    this.node.getComponent(f.ComponentMesh).mtxPivot.scaling = new f.Vector3(0.025, distance.magnitude, 0.025);
                    this.node.getComponent(f.ComponentMesh).mtxPivot.translation = new f.Vector3(0, 0, -distance.magnitude / 2 + 0.2);
                    this.node.getComponent(f.ComponentMaterial).clrPrimary = this.pick.getComponent(f.ComponentMaterial).clrPrimary;
                    this.node.getComponent(f.ComponentMaterial).clrPrimary.a = 0.5;
                }

                let picker: f.Pick[] = f.Picker.pickRay(this.pickableObjects, this.ray, 0, 1);
                picker.sort((a: f.Pick, b: f.Pick) => a.zBuffer < b.zBuffer ? -1 : 1);

                if (picker.length > 0) {
                    this.pick = picker[0].node;
                } else this.pick = null;
            }

        }
        private hasObject: boolean = false;
        private lastPosCntrl: f.Vector3 = f.Vector3.ZERO();
        private update = (): void => {
            if (this.xrViewport.session) {
                this.computeRay();

                if (this.hasObject) {
                    let interpolatedDiff: number = f.Vector3.DIFFERENCE(this.lastPosCntrl, this.controller.cmpTransform.mtxLocal.translation).z;
                    if (this.lastPosCntrl.z < 0)
                        this.pick.mtxLocal.translation = new f.Vector3(0, 0, -this.node.getComponent(f.ComponentMesh).mtxPivot.scaling.y + (interpolatedDiff * 25));
                    else
                        this.pick.mtxLocal.translation = new f.Vector3(0, 0, -this.node.getComponent(f.ComponentMesh).mtxPivot.scaling.y + (-interpolatedDiff * 25));

                    this.pick.mtxLocal.rotation = this.controller.cmpTransform.mtxLocal.rotation;

                }
            }
        }

        private onSqueeze = (_event: XRInputSourceEvent): void => {
            if (this.pick) {
                this.xrViewport.vrDevice.translation = this.pick.getComponent(f.ComponentTransform).mtxLocal.translation;
            }
        }
        private onSelectStart = (_event: XRInputSourceEvent): void => {
            if (this.pick && !this.pick.getComponent(GrabbableObject).isGrabbed) {
                this.node.addChild(this.pick);
                this.lastPosCntrl = this.controller.cmpTransform.mtxLocal.translation;
                this.pick.getComponent(GrabbableObject).isGrabbed = true;
                this.hasObject = true;
            }

        }

        private onSelectEnd = (_event: XRInputSourceEvent): void => {
            if (this.pick) {
                this.hasObject = false;
                this.pick.getComponent(GrabbableObject).isGrabbed = false;
                this.cubeContainer.addChild(this.pick);
                this.pick.mtxLocal.translation = new f.Vector3(this.pick.mtxWorld.translation.x, this.pick.mtxWorld.translation.y, this.pick.mtxWorld.translation.z);
                this.pick.mtxLocal.rotation = new f.Vector3(this.pick.mtxWorld.rotation.x, this.pick.mtxWorld.rotation.y, this.pick.mtxWorld.rotation.z);

            }
        }
    }
}