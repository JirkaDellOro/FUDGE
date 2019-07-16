/// <reference path="../../../../Core/build/Fudge.d.ts"/>
var ƒ = Fudge;
var UI;
(function (UI) {
    let myLayout;
    let savedState;
    // let file:HTML = "test.html"
    let config = {
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
    let cameraComponent = new UI.CameraComponent();
    function createSimpleComponent(container, state) {
        console.log("Create Test");
        console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
        return cameraComponent.createTestRect(container, state);
    }
    function createCameraComponent(container, state) {
        console.log("Create Camera Component");
        console.log(new Date().getSeconds() + " " + new Date().getUTCMilliseconds());
        return cameraComponent.createCameraComponent(container, state);
    }
    myLayout = new GoldenLayout(config);
    myLayout.registerComponent('Inspector', createCameraComponent);
    myLayout.registerComponent('Viewport', createSimpleComponent);
    myLayout.init();
})(UI || (UI = {}));
//# sourceMappingURL=app.js.map