/// <reference path="../../../../Core/build/Fudge.d.ts"/>
import ƒ = Fudge;

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
    console.log("Entering Setup");
    console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
    let cameraComponent:CameraComponent = new CameraComponent();

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

    myLayout.init();

}