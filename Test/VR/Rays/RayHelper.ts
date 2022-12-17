namespace AudioSceneVR {
    import f = FudgeCore;
    f.Project.registerScriptNamespace(AudioSceneVR);  // Register the namespace to FUDGE for serialization

    export class RayHelper extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        //  public static readonly iSubclass: number = f.Component.registerSubclass(RayHelper);

        // Properties may be mutated by users in the editor via the automatically created user interface
        private xrViewport: f.XRViewport = null;
        private controller: f.VRController;
        private maxLength: number;
        private pickableObjects: f.Node[];
        private pick: f.Node = null;
        constructor(_xrViewport: f.XRViewport, _controller: f.VRController, _lengthRay: number, _pickableObjects: f.Node[]) {
            super();
            this.xrViewport = _xrViewport;
            this.controller = _controller;
            this.maxLength = _lengthRay;
            this.pickableObjects = _pickableObjects;
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


            this.node.getComponent(f.ComponentTransform).mtxLocal = this.controller.cntrlTransform.mtxLocal;
            let forward: f.Vector3;
            forward = f.Vector3.Z();
            forward.transform(this.node.mtxWorld, false);
            let ray: f.Ray = new f.Ray(new f.Vector3(forward.x * 10000, forward.y * 10000, forward.z * 10000), this.node.mtxLocal.translation, 0.1);

            if (!this.pick) {
                this.node.getComponent(f.ComponentMesh).mtxPivot.scaling = new f.Vector3(0.1, this.maxLength, 0.1);
                this.node.getComponent(f.ComponentMesh).mtxPivot.translation = new f.Vector3(0, 0, -this.maxLength / 2);
            } else {
                let distance: f.Vector3 = ray.getDistance(this.pick.mtxLocal.translation);
                this.node.getComponent(f.ComponentMesh).mtxPivot.scaling = new f.Vector3(0.1, distance.magnitude, 0.1);
                this.node.getComponent(f.ComponentMesh).mtxPivot.translation = new f.Vector3(0, 0, -distance.magnitude / 2);
            }


            // let picker: f.Pick[] = f.Picker.pickRay(this.pickableObjects, ray, 0, 100000000000000000);
            // picker.sort((a: f.Pick, b: f.Pick) => a.zBuffer < b.zBuffer ? -1 : 1);

            // picker.forEach(element => {
            //     console.log(element.node.name);
            // });

            // if (picker.length > 0) {
            //     this.pick = picker[0].node;
            // } else this.pick = null;


        }

        private update = (): void => {
            if (this.xrViewport.session)
                this.computeRay();
        }
    }
}