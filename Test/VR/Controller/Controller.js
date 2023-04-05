var ControllerSceneVR;
(function (ControllerSceneVR) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(ControllerSceneVR); // Register the namespace to FUDGE for serialization
    class Controller extends f.ComponentScript {
        xrViewport = null;
        controller;
        aButton = null;
        bButton = null;
        trigger = null;
        select = null;
        joyStick = null;
        oldaButton = null;
        oldbButton = null;
        oldtrigger = null;
        oldselect = null;
        oldjoyStick = null;
        mappedButtons = {};
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
                    this.initController();
                    f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
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
        initController = () => {
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
        };
        updateController = () => {
            this.node.getComponent(f.ComponentTransform).mtxLocal = this.controller.cmpTransform.mtxLocal;
            this.joyStick.mtxPivot.rotation = new f.Vector3(this.controller.thumbstickX * 25, 0, this.controller.thumbstickY * 25);
            if (this.mappedButtons["select"].pressed)
                this.select.mtxPivot.translation = new f.Vector3(this.select.mtxPivot.translation.x, this.select.mtxPivot.translation.y, this.oldselect.z + 0.007);
            else
                this.select.mtxPivot.translation = new f.Vector3(this.select.mtxPivot.translation.x, this.select.mtxPivot.translation.y, this.oldselect.z);
            if (this.mappedButtons["trigger"].pressed)
                this.trigger.mtxPivot.translation = new f.Vector3(this.trigger.mtxPivot.translation.x, this.trigger.mtxPivot.translation.y, this.oldtrigger.z + 0.008);
            else
                this.trigger.mtxPivot.translation = new f.Vector3(this.trigger.mtxPivot.translation.x, this.trigger.mtxPivot.translation.y, this.oldtrigger.z);
            if (this.mappedButtons["A"].pressed)
                this.aButton.mtxPivot.translation = new f.Vector3(this.aButton.mtxPivot.translation.x, this.oldaButton.y - 0.0075, this.aButton.mtxPivot.translation.z);
            else
                this.aButton.mtxPivot.translation = new f.Vector3(this.aButton.mtxPivot.translation.x, this.oldaButton.y, this.aButton.mtxPivot.translation.z);
            if (this.mappedButtons["B"].pressed)
                this.bButton.mtxPivot.translation = new f.Vector3(this.bButton.mtxPivot.translation.x, this.oldbButton.y - 0.0075, this.bButton.mtxPivot.translation.z);
            else
                this.bButton.mtxPivot.translation = new f.Vector3(this.bButton.mtxPivot.translation.x, this.oldbButton.y, this.bButton.mtxPivot.translation.z);
            if (this.mappedButtons["thumbStick"].pressed)
                this.joyStick.mtxPivot.translation = new f.Vector3(this.joyStick.mtxPivot.translation.x, this.oldjoyStick.y - 0.0075, this.joyStick.mtxPivot.translation.z);
            else
                this.joyStick.mtxPivot.translation = new f.Vector3(this.joyStick.mtxPivot.translation.x, this.oldjoyStick.y, this.joyStick.mtxPivot.translation.z);
        };
        update = () => {
            if (this.xrViewport.session) {
                try {
                    if (this.mappedButtons["select"])
                        this.updateController();
                    if (!this.mappedButtons["select"])
                        for (let i = 0; i <= 5; i++) {
                            switch (i) {
                                case (0):
                                    this.mappedButtons["select"] = this.controller.gamePad.buttons[0];
                                    break;
                                case (1):
                                    this.mappedButtons["trigger"] = this.controller.gamePad.buttons[1];
                                    break;
                                case (3):
                                    this.mappedButtons["thumbStick"] = this.controller.gamePad.buttons[3];
                                    break;
                                case (4):
                                    this.mappedButtons["A"] = this.controller.gamePad.buttons[4];
                                    break;
                                case (5):
                                    this.mappedButtons["B"] = this.controller.gamePad.buttons[5];
                                    break;
                            }
                        }
                }
                catch (error) {
                    f.Debug.error("Mapped Buttons are not initialized correctly!");
                }
            }
        };
    }
    ControllerSceneVR.Controller = Controller;
})(ControllerSceneVR || (ControllerSceneVR = {}));
//# sourceMappingURL=Controller.js.map