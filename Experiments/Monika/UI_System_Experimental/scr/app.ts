<<<<<<< Updated upstream
/// <reference path="../../../../Core/build/Fudge.d.ts"/>
import ƒ = Fudge;

=======
>>>>>>> Stashed changes
namespace UI {
    let myLayout: GoldenLayout;
    let savedState: string;
    // let file:HTML = "test.html"
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
<<<<<<< Updated upstream
    console.log("Entering Setup");
    console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
    console.log("Entering constructor");
    console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
    let camera: ƒ.Node;
    camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
    let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
    let cameraComponent:CameraComponent = new CameraComponent(cmpCamera);

    function createSimpleComponent (container: any, state: any) {
        console.log("Create Test");
        console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
        return cameraComponent.createTestRect(container, state);
    }

    function createCameraComponent (container:any, state:any)
    {
        console.log("Create Camera Component");
        console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
        return cameraComponent.createCameraComponent(container, state);
    }

    myLayout = new GoldenLayout(config);
    myLayout.registerComponent('Inspector', createCameraComponent);
    myLayout.registerComponent('Viewport', createSimpleComponent);
=======
    function createSimpleComponent (container: any, state: any) {
        // return SimpleComponent.create(container, state);
        return new SimpleComponent(container, state);
    }
    myLayout = new GoldenLayout(config);
    myLayout.registerComponent('Inspector', createSimpleComponent);
    myLayout.registerComponent('Viewport', createSimpleComponent);
    console.log("I work");
>>>>>>> Stashed changes

    myLayout.init();

}