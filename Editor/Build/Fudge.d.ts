/// <reference types="golden-layout" />
/// <reference types="../../../core/build/fudgecore" />
declare namespace Fudge {
}
declare namespace Fudge {
    /**
     * Holds various views into the currently processed Fudge-project.
     * There must be only one ViewData in this panel, that displays data for the selected entity
     * Multiple panels may be created by the user, presets for different processing should be available
     */
    class Panel {
        static goldenLayout: GoldenLayout;
        viewContainers: GoldenLayout.Container[];
        constructor(_viewType: VIEW);
        getLayout(): GoldenLayout.Config;
    }
}
declare namespace Fudge {
    enum VIEW {
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
    class View {
        constructor(_container: GoldenLayout.Container, _state: Object);
        getLayout(): GoldenLayout.Config;
    }
}
declare namespace Fudge {
    /**
     * View displaying all information of any selected entity and offering simple controls for manipulation
     */
    class ViewData extends View {
        constructor(_container: GoldenLayout.Container, _state: Object);
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    /**
     * View displaying a Node and the hierarchical relation to its parents and children.
     * Consists of a viewport and a tree-control.
     */
    class ViewNode extends View {
        viewport: ƒ.Viewport;
        constructor(_container: GoldenLayout.Container, _state: Object);
        /**
         * Set the root node for display in this view
         * @param _node
         */
        setRoot(_node: ƒ.Node): void;
        getLayout(): GoldenLayout.Config;
    }
}
