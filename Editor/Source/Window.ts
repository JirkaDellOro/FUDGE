// /<reference path="../../Scenes/Scenes.ts"/>
///<reference types="../../Core/Build/Fudge"/>
///<reference types="../../node_modules/@types/node/fs"/>
/// <reference types="../@types/jquery"/>
/// <reference types="../@types/golden-layout"/>

namespace EditorScene {
    import ƒ = Fudge;
    const { dialog } = require("electron").remote;
    const fs: ƒ.General = require("fs");

    window.addEventListener("DOMContentLoaded", initWindow);
    let myLayout: GoldenLayout;
    let savedState: string;

    let branch: ƒ.Node;
    let canvas: HTMLCanvasElement;
    let viewPort: ƒ.Viewport = new ƒ.Viewport();
    let camera: ƒ.Node;

    function initWindow(): void {
        let config: GoldenLayout.Config = {
            content: [{
                type: "row",
                content: [{
                    type: "component",
                    componentName: "Inspector",
                    title: "Inspector"
                },
                {
                    type: "component",
                    componentName: "Viewport",
                    title: "Viewport",
                }
                ]
            }]
        };

        createScene();
        myLayout = new GoldenLayout(config);

        myLayout.registerComponent("Viewport", createViewportComponent);
        myLayout.registerComponent("Inspector", createInspectorComponent);

        myLayout.init();
    }

    function createViewportComponent(container: GoldenLayout.Container, state: Object): void {
        container.getElement().append(canvas);
    }

    function createInspectorComponent(container: GoldenLayout.Container, state: Object): void {
        console.log(branch.getChildren()[0].name);
        let lblName: HTMLElement = document.createElement("label");
        lblName.innerHTML = "Node Name";
        let txtName: HTMLInputElement = document.createElement("input");
        txtName.value = <string>branch.getChildren()[0].name;
        container.getElement().append(lblName);
        container.getElement().append(txtName);
    }

    function createScene(): void {
        // create asset
        branch = Scenes.createAxisCross();

        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        // initialize viewport
        camera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
        cmpCamera.projectCentral(1, 45);
        canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);

        viewPort = new ƒ.Viewport();
        viewPort.initialize("TestViewport", branch, cmpCamera, canvas);
        viewPort.draw();
    }
}