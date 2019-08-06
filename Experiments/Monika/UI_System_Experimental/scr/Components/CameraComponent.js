/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>
var UI;
(function (UI) {
    var ƒ = Fudge;
    class CameraComponent extends UI.MutableUI {
        constructor(mutable) {
            super(mutable);
            this.animate = (_event) => {
                console.log("Entering animate function");
                console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
                console.log(this.branch);
                this.branch.cmpTransform.local.rotateY(1);
                ƒ.RenderManager.update();
                // prepare and draw viewport
                //viewPort.prepare();
                this.viewPort.draw();
            };
            this.camera = mutable;
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
        }
        createCameraComponent(_container, state) {
            console.log("Entering CameraComponent");
            console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
            UI.UIGenerator.createFromMutator(this.mutable, this.root);
            _container.getElement().html(this.root);
        }
        createTestRect(_container, state) {
            console.log("Entering TestRect");
            console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
            let uiMaps = {};
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.animate);
            ƒ.Loop.start();
            _container.getElement().html(this.canvas);
        }
    }
    UI.CameraComponent = CameraComponent;
})(UI || (UI = {}));
//# sourceMappingURL=CameraComponent.js.map