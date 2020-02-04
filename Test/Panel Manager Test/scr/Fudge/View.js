///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
var FudgeTest;
///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
(function (FudgeTest) {
    var ƒ = FudgeCore;
    let VIEW;
    (function (VIEW) {
        // PROJECT = ViewProject,
        VIEW["NODE"] = "ViewNode";
        // ANIMATION = ViewAnimation,
        // SKETCH = ViewSketch,
        // MESH = ViewMesh,
        VIEW["PORT"] = "ViewPort";
        VIEW["DATA"] = "ViewData";
    })(VIEW = FudgeTest.VIEW || (FudgeTest.VIEW = {}));
    /**
     * Base class for all Views to support generic functionality
     * TODO: examine, if this should/could be derived from some GoldenLayout "class"
     *
     */
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    class View {
        constructor(_parent) {
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
        getLayout() {
            /* TODO: fix the golden-layout.d.ts to include componentName in ContentItem*/
            const config = {
                type: "component",
                title: this.type,
                componentName: "View",
                componentState: { content: this.content }
            };
            return config;
        }
    }
    FudgeTest.View = View;
})(FudgeTest || (FudgeTest = {}));
//# sourceMappingURL=View.js.map