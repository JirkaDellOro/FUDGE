///<reference types="../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>

namespace Fudge {
    import ƒ = FudgeCore;

    export enum VIEW {
        // PROJECT = ViewProject,
        NODE = "ViewNode",
        ANIMATION = "ViewAnimation",
        // SKETCH = ViewSketch,
        // MESH = ViewMesh,
        PORT = "ViewPort",
        DATA = "ViewData"
    }

    /**
     * Base class for all Views to support generic functionality
     * TODO: examine, if this should/could be derived from some GoldenLayout "class"
     * 
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
            this.parentPanel = _parent;
        }
        /**
         * Returns GoldenLayout ComponentConfig for the Views GoldenLayout Component.
         * If not overridden by inherited class, gives generic config with its type as its name.
         * If you want to use the "View"-Component, add {content: this.content} to componentState.
         */
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

        /**
         * Generates the Views content and pushs it into the views content
         */
        abstract fillContent(): void; 
        /***
         * Deconstructor for cleanup purposes
         */
        abstract deconstruct(): void;
    }
}