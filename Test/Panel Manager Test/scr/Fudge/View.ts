///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>

namespace Fudge {
    import ƒ = FudgeCore;

    export enum VIEW {
        PROJECT = "viewProject",
        NODE = "viewNode",
        ANIMATION = "viewAnimation",
        SKETCH = "viewSketch",
        MESH = "viewMesh",
        PORT = "viewPort",
        DATA = "viewData"
    }

    /**
     * Base class for all Views to support generic functionality and communication between
     * TODO: examine, if this should/could be derived from some GoldenLayout "class"
     */
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    export abstract class View {

        config: GoldenLayout.ComponentConfig;
        parentPanel: Panel;
        content: HTMLElement;
        type: string;

        constructor(_parent: Panel) {
            ƒ.Debug.info("Create view " + this.constructor.name);
            this.content = document.createElement("div");
            this.config = this.getLayout();
        }

        public getLayout(): GoldenLayout.ComponentConfig {
            /* TODO: fix the golden-layout.d.ts to include componentName in ContentItem*/
            const config: GoldenLayout.ComponentConfig = {
                type: "component",
                title: this.type,
                componentName: "View",
                componentState: { content: this.content}
            };
            return config;
        }

        abstract fillContent(): void; 
        abstract registerToLayout(container: GoldenLayout.Container, state: any): void;
        abstract deconstruct(): void;
    }
}