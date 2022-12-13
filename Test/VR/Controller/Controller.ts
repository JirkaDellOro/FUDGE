namespace RaySceneVR {
    import f = FudgeCore;
    f.Project.registerScriptNamespace(RaySceneVR);  // Register the namespace to FUDGE for serialization

    export class Controller extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        //  public static readonly iSubclass: number = f.Component.registerSubclass(RayHelper);

        // Properties may be mutated by users in the editor via the automatically created user interface
        private xrViewport: f.XRViewport = null;
        private controller: f.VRController;

        private aButton: f.ComponentMesh = null;
        private bButton: f.ComponentMesh = null;
        private trigger: f.ComponentMesh = null;
        private select: f.ComponentMesh = null;
        private joyStick: f.ComponentMesh = null;

        private oldaButton: f.Vector3 = null;
        private oldbButton: f.Vector3 = null;
        private oldtrigger: f.Vector3 = null;
        private oldselect: f.Vector3 = null;
        private oldjoyStick: f.Vector3 = null;
        constructor(_xrViewport: f.XRViewport, _controller: f.VRController) {
            super();
            this.xrViewport = _xrViewport;
            this.controller = _controller;
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
                    this.joyStick = this.node.getChildrenByName("Joystick")[0].getChild(0).getComponent(f.ComponentMesh);
                    this.oldjoyStick = this.joyStick.mtxPivot.translation.clone;
                    this.aButton = this.node.getChildrenByName("AButton")[0].getComponent(f.ComponentMesh);
                    this.oldaButton = this.aButton.mtxPivot.translation.clone;
                    this.bButton = this.node.getChildrenByName("BButton")[0].getComponent(f.ComponentMesh);
                    this.oldbButton = this.bButton.mtxPivot.translation.clone;

                    this.trigger = this.node.getChildrenByName("Trigger")[0].getComponent(f.ComponentMesh);
                    this.oldtrigger = this.trigger.mtxPivot.translation.clone;
                    this.select = this.node.getChildrenByName("Select")[0].getComponent(f.ComponentMesh);
                    this.oldselect = this.select.mtxPivot.translation.clone;

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

        private checkController = (): void => {
            this.node.getComponent(f.ComponentTransform).mtxLocal = this.controller.cntrlTransform.mtxLocal;

            this.joyStick.mtxPivot.rotation = new f.Vector3(this.controller.thumbstickX * 25, 0, this.controller.thumbstickY * 25);

            if (this.controller.mappedButtons["select"].pressed) this.select.mtxPivot.translation = new f.Vector3(this.select.mtxPivot.translation.x, this.select.mtxPivot.translation.y, this.oldselect.z + 0.007);
            else this.select.mtxPivot.translation = new f.Vector3(this.select.mtxPivot.translation.x, this.select.mtxPivot.translation.y, this.oldselect.z);

            if (this.controller.mappedButtons["trigger"].pressed) this.trigger.mtxPivot.translation = new f.Vector3(this.trigger.mtxPivot.translation.x, this.trigger.mtxPivot.translation.y, this.oldtrigger.z + 0.008);
            else this.trigger.mtxPivot.translation = new f.Vector3(this.trigger.mtxPivot.translation.x, this.trigger.mtxPivot.translation.y, this.oldtrigger.z);

            if (this.controller.mappedButtons["A"].pressed) this.aButton.mtxPivot.translation = new f.Vector3(this.aButton.mtxPivot.translation.x, this.oldaButton.y - 0.0075, this.aButton.mtxPivot.translation.z);
            else this.aButton.mtxPivot.translation = new f.Vector3(this.aButton.mtxPivot.translation.x, this.oldaButton.y, this.aButton.mtxPivot.translation.z);

            if (this.controller.mappedButtons["B"].pressed) this.bButton.mtxPivot.translation = new f.Vector3(this.bButton.mtxPivot.translation.x, this.oldbButton.y - 0.0075, this.bButton.mtxPivot.translation.z);
            else this.bButton.mtxPivot.translation = new f.Vector3(this.bButton.mtxPivot.translation.x, this.oldbButton.y, this.bButton.mtxPivot.translation.z);

            if (this.controller.mappedButtons["thumbStick"].pressed) this.joyStick.mtxPivot.translation = new f.Vector3(this.joyStick.mtxPivot.translation.x, this.oldjoyStick.y - 0.0075, this.joyStick.mtxPivot.translation.z);
            else this.joyStick.mtxPivot.translation = new f.Vector3(this.joyStick.mtxPivot.translation.x, this.oldjoyStick.y, this.joyStick.mtxPivot.translation.z);

            //this.joyStick.mtxLocal.rotation.z = this.controller.thumbstickY;

        }

        private update = (): void => {
            if (this.xrViewport.vr.session)
                this.checkController();
        }
    }
}