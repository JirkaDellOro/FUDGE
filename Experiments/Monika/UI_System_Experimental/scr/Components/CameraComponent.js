/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>
var UI;
(function (UI) {
    var ƒ = Fudge;
    class CameraComponent extends UI.MutableUI {
        constructor() {
            console.log("Entering constructor");
            console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
            let camera;
            camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
            let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
            super(cmpCamera);
            this.viewPort = new ƒ.Viewport();
            this.branch = Scenes.createAxisCross();
            this.branch.addComponent(new ƒ.ComponentTransform());
            console.log("branch:");
            console.log(this.branch);
            // initialize RenderManager and transmit content
            ƒ.RenderManager.initialize();
            ƒ.RenderManager.addBranch(this.branch);
            ƒ.RenderManager.update();
            // initialize viewports
            this.canvas = document.createElement("canvas");
            this.viewPort.initialize(this.canvas.id, this.branch, cmpCamera, this.canvas);
            this.camera = camera;
        }
        createCameraComponent(container, state) {
            console.log("Entering CameraComponent");
            console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
            UI.UIGenerator.createFromMutator(this.mutable, this.root);
            container.getElement().html(this.root);
        }
        createTestRect(container, state) {
            console.log("Entering TestRect");
            console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
            let uiMaps = {};
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, function (_event) {
                console.log("Entering animate function");
                console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
                console.log(this.branch);
                this.branch.cmpTransform.local.rotateY(1);
                ƒ.RenderManager.update();
                // prepare and draw viewport
                //viewPort.prepare();
                this.viewPort.draw();
            });
            ƒ.Loop.start();
            container.getElement().html(this.canvas);
        }
    }
    UI.CameraComponent = CameraComponent;
})(UI || (UI = {}));
//# sourceMappingURL=CameraComponent.js.map