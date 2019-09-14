/// <reference types="./@types/golden-layout" />
declare namespace GLEventTest {
    class View {
        config: any;
        parentPanel: Panel;
        content: HTMLElement;
        type: string;
        constructor(_parent: Panel);
        fillContent(): void;
        deconstruct(): void;
    }
    class Panel extends EventTarget {
        views: View[];
        config: GoldenLayout.ItemConfig;
        constructor(_name: string);
        addView(_v: View, _pushToPanelManager?: boolean): void;
    }
    class PanelManager extends EventTarget {
        static instance: PanelManager;
        gl: GoldenLayout;
        private panels;
        private constructor();
        addPanel(_p: Panel): void;
        addView(_v: View): void;
    }
}
