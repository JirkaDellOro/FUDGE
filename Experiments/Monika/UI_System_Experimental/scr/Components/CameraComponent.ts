/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>

namespace UI {
    import ƒ = Fudge;
    export class CameraComponent extends MutableUI {
        private camera: ƒ.Node;
        private canvas: HTMLCanvasElement;
        private viewPort: ƒ.Viewport;
        private branch: ƒ.Node;

        public constructor() {
            console.log("Entering constructor");
            console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
            let camera: ƒ.Node;
            camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
            let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
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

        public createCameraComponent(container:any, state:any)
        {
            console.log("Entering CameraComponent");
            console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
            UIGenerator.createFromMutator(this.mutable, this.root);
            container.getElement().html(this.root);
        }

        public createTestRect(container:any, state:any)
        {
            console.log("Entering TestRect")
            console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
            let uiMaps: { [name: string]: { ui: UI.FieldSet<null>, framing: ƒ.Framing } } = {};
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, function (_event: Event): void {
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

}