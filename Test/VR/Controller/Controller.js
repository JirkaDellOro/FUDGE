var RaySceneVR;
(function (RaySceneVR) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(RaySceneVR); // Register the namespace to FUDGE for serialization
    class Controller extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        //  public static readonly iSubclass: number = f.Component.registerSubclass(RayHelper);
        // Properties may be mutated by users in the editor via the automatically created user interface
        xrViewport = null;
        joyStick = new f.ComponentTransform();
        controller;
        constructor(_xrViewport, _controller) {
            super();
            this.xrViewport = _xrViewport;
            this.controller = _controller;
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
                    this.joyStick = this.node.getChildrenByName("Joystick")[0].getComponent(f.ComponentTransform);
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
        checkController = () => {
            this.node.getComponent(f.ComponentTransform).mtxLocal = this.controller.cntrlTransform.mtxLocal;
            this.joyStick.mtxLocal.rotation = new f.Vector3(this.controller.thumbstickX * 20, this.controller.thumbstickY * 20, 0);
            console.log(this.joyStick.mtxLocal.rotation);
            //this.joyStick.mtxLocal.rotation.z = this.controller.thumbstickY;
        };
        update = () => {
            if (this.xrViewport.vr.session)
                this.checkController();
        };
    }
    RaySceneVR.Controller = Controller;
})(RaySceneVR || (RaySceneVR = {}));
//# sourceMappingURL=Controller.js.map