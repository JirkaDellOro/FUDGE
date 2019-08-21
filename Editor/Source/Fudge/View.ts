///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>

namespace Fudge {
    import ƒ = FudgeCore;
    
    export enum VIEW {
        PROJECT = "viewProject",
        NODE = "viewNode",
        ANIMATION = "viewAnimation",
        SKETCH = "viewSketch",
        MESH = "viewMesh",
        DATA = "viewData"
    }

    /**
     * Base class for all Views to support generic functionality and communication between
     * TODO: examine, if this should/could be derived from some GoldenLayout "class"
     */
    export class View {
        constructor(_container: GoldenLayout.Container, _state: Object) {
            ƒ.Debug.info("Create view " + this.constructor.name);
        }

        public getLayout(): GoldenLayout.Config {
            const config: GoldenLayout.Config = {
                content: []
            };
            return config;
        }
    }
}