///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>

namespace FudgeViewNode {
    import ƒ = FudgeCore;
    const { ipcRenderer } = require("electron");

    window.addEventListener("DOMContentLoaded", initWindow);
    let myLayout: GoldenLayout;
    let savedState: string;

    let branch: ƒ.Node;
    let canvas: HTMLCanvasElement;
    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let camera: ƒ.Node;

    function initWindow(): void {
        ƒ.Debug.log("FudgeViewNode started");
        createScene();
        myLayout = new GoldenLayout(getLayout());

        myLayout.registerComponent("Viewport", createViewportComponent);
        myLayout.registerComponent("Inspector", createInspectorComponent);

        myLayout.init();
        ipcRenderer.addListener("update", (_event: Electron.IpcRendererEvent) => {
            ƒ.Debug.info("Update");
            ipcRenderer.send("getNode");
        });
        ipcRenderer.addListener("display", (_event: Electron.IpcRendererEvent, _node: ƒ.Node) => {
            ƒ.Debug.info("Display");
            displayNode(_node);
        });
    }

    function displayNode(_node: ƒ.Node): void {
        if (!_node)
            return;
        ƒ.Debug.log("Trying to display node: ", _node);
        ƒ.RenderManager.removeBranch(branch);
        branch = _node;
        viewport.setBranch(branch);
        viewport.draw();
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


    function getLayout(): GoldenLayout.Config {
        const config: GoldenLayout.Config = {
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
                    title: "Viewport"
                }
                ]
            }]
        };
        return config;
    }

    // TODO: remove this. Only here for testing in order not to start with an empty viewport
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

        viewport = new ƒ.Viewport();
        viewport.initialize("TestViewport", branch, cmpCamera, canvas);
        viewport.draw();
    }
}