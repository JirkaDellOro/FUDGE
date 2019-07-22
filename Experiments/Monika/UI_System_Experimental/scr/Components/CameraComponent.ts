/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>

namespace UI {
    import ƒ = Fudge;
    export class CameraComponent extends MutableUI {
        private camera: ƒ.Node;
        private canvas: HTMLCanvasElement;
        private viewPort: ƒ.Viewport;
        private branch: ƒ.Node;

        public constructor(mutable:ƒ.Mutable) {
            super(mutable);
            this.camera = <ƒ.ComponentCamera>mutable;
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

        public createCameraComponent(_container: any, state: any) {
            console.log("Entering CameraComponent");
            console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
            UIGenerator.createFromMutator(this.mutable, this.root);
            _container.getElement().html(this.root);
        }

        public createTestRect(_container: any, state: any) {
            console.log("Entering TestRect")
            console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
            let uiMaps: { [name: string]: { ui: UI.FieldSet<null>, framing: ƒ.Framing } } = {};
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);

            ƒ.Loop.start();
            _container.getElement().html(this.canvas);
        }
        private animate = (_event: Event) => {
            console.log("Entering animate function");
            console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
            console.log(this.branch);
            this.branch.cmpTransform.local.rotateY(1);
            ƒ.RenderManager.update();
            // prepare and draw viewport
            //viewPort.prepare();
            this.viewPort.draw();
        }
    }

}