/// <reference path="../../../../Core/build/Fudge.d.ts"/>
import ƒ = Fudge;


namespace UI {
    let myLayout: GoldenLayout;
    let savedState: string;

    let canvas: HTMLCanvasElement;
    let viewPort: ƒ.Viewport = new ƒ.Viewport();
    let camera: ƒ.Node;
    window.addEventListener("load", init);

    function init(){
        let config: GoldenLayout.Config = {
        content: [{
            type: 'row',
            content: [{
                type: 'component',
                componentName: 'Inspector',
                title: "Inspector",
            },
            {
                type: 'component',
                componentName: 'Viewport',
                title: "Viewport",
            }]
        }]
    };


    initViewport()
    myLayout = new GoldenLayout(config);
    myLayout.registerComponent('Inspector', createCameraComponent);
    myLayout.registerComponent('Viewport', createViewportComponent);

    myLayout.init();
}
    function initViewport(){
        // create asset
        let branch: ƒ.Node = Scenes.createAxisCross();
        branch.addComponent(new ƒ.ComponentTransform());

        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        // initialize viewports
        canvas = document.createElement("canvas");
        document.body.append(canvas);
        camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);
        viewPort.adjustingFrames = true;
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
        ƒ.Loop.start();
        function animate(_event: Event): void {

            branch.cmpTransform.local.rotateY(1);
            ƒ.RenderManager.update();
            // prepare and draw viewport
            viewPort.draw();
        }
    }
    function createViewportComponent (container: any, state: any) {
        container.getElement().append(canvas);
    }

    function createCameraComponent (container:any, state:any)
    {
        return new CameraUI(container, state, camera.getComponent(ƒ.ComponentCamera));
    }



}