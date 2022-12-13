namespace RaySceneVR {
    import f = FudgeCore;
    f.Project.registerScriptNamespace(RaySceneVR);  // Register the namespace to FUDGE for serialization

    export class Controller extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        //  public static readonly iSubclass: number = f.Component.registerSubclass(RayHelper);

        // Properties may be mutated by users in the editor via the automatically created user interface
        private xrViewport: f.XRViewport = null;
        private joyStick: f.ComponentTransform = new f.ComponentTransform();
        private controller: f.VRController;
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
                    this.joyStick = this.node.getChildrenByName("Joystick")[0].getComponent(f.ComponentTransform);
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

            this.joyStick.mtxLocal.rotation = new f.Vector3(this.controller.thumbstickX * 20, this.controller.thumbstickY * 20, 0);
            console.log(this.joyStick.mtxLocal.rotation.x);
            //this.joyStick.mtxLocal.rotation.z = this.controller.thumbstickY;

        }

        private update = (): void => {
            if (this.xrViewport.vr.session)
                this.checkController();
        }
    }
}