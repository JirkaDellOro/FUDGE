/// <reference types="golden-layout" />
declare namespace Fudge {
    enum VIEW {
        PROJECT = "viewProject",
        NODE = "viewNode",
        ANIMATION = "viewAnimation",
        SKETCH = "viewSketch",
        MESH = "viewMesh",
        DATA = "viewData"
    }
    class Container {
        static goldenLayout: GoldenLayout;
        constructor();
        getLayout(): GoldenLayout.Config;
    }
}
declare namespace Fudge {
}
declare namespace Fudge {
    function createViewData(container: GoldenLayout.Container, state: Object): void;
    class ViewData {
        static goldenLayout: GoldenLayout;
        constructor(container: GoldenLayout.Container, state: Object);
        static getLayout(): GoldenLayout.Config;
    }
}
