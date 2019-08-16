/// <reference path="../../../../../Core/Build/Fudge.d.ts"/>

import ƒ = FudgeCore;


namespace UI {
    let myLayout: GoldenLayout;
    let savedState: string;

    let canvas: HTMLCanvasElement;
    let viewPort: ƒ.Viewport = new ƒ.Viewport();
    let camera: ƒ.Node;
    window.addEventListener("load", init);

    function init() {
        let config: GoldenLayout.Config = {
            content: [{
                type: 'column',
                content: [{
                    type: 'component',
                    componentName: 'Inspector',
                    title: "Inspector",
                    height: 10
                },
                {
                    type: 'component',
                    componentName: 'Manual',
                    title: "Manual",
                    height: 12
                },
                {
                    type: 'component',
                    componentName: 'Viewport',
                    title: "Viewport",
                },

                ]
            }]
        };


        initViewport()
        myLayout = new GoldenLayout(config);
        myLayout.registerComponent('Inspector', createCameraComponent);
        myLayout.registerComponent('Viewport', createViewportComponent);
        myLayout.registerComponent('Manual', createTestComponent);

        myLayout.init();
    }
    function initViewport() {
        // create asset
        let branch: ƒ.Node = Scenes.createAxisCross();
        branch.addComponent(new ƒ.ComponentTransform());

        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        // initialize viewports
        canvas = document.createElement("canvas");
        canvas.height = 800;
        canvas.width = 1200;
        document.body.append(canvas);
        camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);
        viewPort.adjustingFrames = false;
        viewPort.adjustingCamera = false;
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
        ƒ.Loop.start();
        function animate(_event: Event): void {

            branch.cmpTransform.local.rotateY(1);
            ƒ.RenderManager.update();
            // prepare and draw viewport
            viewPort.draw();
        }
    }
    function createViewportComponent(container: any, state: any) {
        container.getElement().append(canvas);
    }

    function createCameraComponent(container: any, state: any) {
        return new CameraUI(container, state, camera.getComponent(ƒ.ComponentCamera));
    }
    function createTestComponent(container: any, state: any) {
        return new TestUI(container, state, camera.getComponent(ƒ.ComponentCamera));
    }



}