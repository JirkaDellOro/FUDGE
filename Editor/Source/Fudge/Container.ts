///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>

namespace Fudge {

    export enum VIEW {
        PROJECT = "viewProject",
        NODE = "viewNode",
        ANIMATION = "viewAnimation",
        SKETCH = "viewSketch",
        MESH = "viewMesh",
        DATA = "viewData"
    }

    export class Container {
        public static goldenLayout: GoldenLayout;

        constructor() {
            if (Container.goldenLayout)
                // TODO: support multiple containers!
                return;
            Container.goldenLayout = new GoldenLayout(this.getLayout());
            // Container.goldenLayout.registerComponent(VIEW.DATA, createViewData);
            Container.goldenLayout.registerComponent(VIEW.DATA, ViewData);
            Container.goldenLayout.init();
        }

        public getLayout(): GoldenLayout.Config {
            const config: GoldenLayout.Config = {
                content: [{
                    type: "component",
                    componentName: VIEW.DATA,
                    title: "Data"
                }]
            };
            return config;
        }
    }
}