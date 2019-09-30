/// <reference types="../@types/golden-layout" />
/// <reference types="../../../core/build/fudgecore" />
/// <reference types="../../../userinterface/build/fudgeui" />
declare namespace Fudge {
}
declare namespace Fudge {
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    /**
     * Holds various views into the currently processed Fudge-project.
     * There must be only one ViewData in this panel, that displays data for the selected entity
     * Multiple panels may be created by the user, presets for different processing should be available
     * @author Monika Galkewitsch, HFU, 2019
     * @author Lukas Scheuerle, HFU, 2019
     */
    abstract class Panel extends EventTarget {
        views: View[];
        config: GoldenLayout.ItemConfig;
        /**
         * Constructor for panel Objects. Generates an empty panel with a single ViewData.
         * @param _name Panel Name
         * @param _template Optional. Template to be used in the construction of the panel.
         */
        constructor(_name: string);
        /**
         * Adds given View to the list of views on the panel.
         * @param _v View to be added
         * @param _pushToPanelManager Wether or not the View should also be pushed to the Panelmanagers list of views
         * @param _pushConfig Wether or not the config of the view should be pushed into the panel config. If this is false, you will have to push the view config manually. This is helpful for creating custom structures in the panel config.
         */
        addView(_v: View, _pushToPanelManager?: boolean, _pushConfig?: boolean): void;
        private generateID;
    }
    /**
    * Panel that functions as a Node Editor. Uses ViewData, ViewPort and ViewNode.
    * Use NodePanelTemplate to initialize the default NodePanel.
    * @author Monika Galkewitsch, 2019, HFU
    */
    class NodePanel extends Panel {
        private node;
        constructor(_name: string, _template?: PanelTemplate, _node?: ƒ.Node);
        setNode(_node: ƒ.Node): void;
        getNode(): ƒ.Node;
        /**
 * Allows to construct the view from a template config.
 * @param template Panel Template to be used for the construction
 * @param _type Type of the top layer container element used in the goldenLayout Config. This can be "row", "column" or "stack"
 */
        constructFromTemplate(template: GoldenLayout.ItemConfig, _type: string, _id?: string): GoldenLayout.ItemConfigType;
    }
}
declare namespace Fudge {
    /**
     * Manages all Panels used by Fudge at the time. Call the static instance Member to use its functions.
     * @author Monika Galkewitsch, 2019, HFU
     * @author Lukas Scheuerle, 2019, HFU
     */
    class PanelManager extends EventTarget {
        static instance: PanelManager;
        static templates: typeof PanelTemplate[];
        editorLayout: GoldenLayout;
        private panels;
        private activePanel;
        private constructor();
        /**
         * Add Panel to PanelManagers Panel List and to the PanelManagers GoldenLayout Config
         * @param _p Panel to be added
         */
        addPanel(_p: Panel): void;
        /**
         * Add View to PanelManagers View List and add the view to the active panel
         * @param _v View to be added
         */
        addView(_v: View): void;
        getActivePanel(): Panel;
        /**
         * Initialize GoldenLayout Context of the PanelManager Instance
         */
        init(): void;
        private setActivePanel;
    }
}
declare namespace Fudge {
    abstract class PanelTemplate {
        config: GoldenLayout.ItemConfig;
    }
    class NodePanelTemplate extends PanelTemplate {
        constructor();
    }
}
declare namespace Fudge {
    enum VIEW {
        NODE = "ViewNode",
        PORT = "ViewPort",
        DATA = "ViewData"
    }
    /**
     * Base class for all Views to support generic functionality
     * TODO: examine, if this should/could be derived from some GoldenLayout "class"
     *
     */
    abstract class View {
        config: GoldenLayout.ComponentConfig;
        parentPanel: Panel;
        content: HTMLElement;
        type: string;
        constructor(_parent: Panel);
        /**
         * Returns GoldenLayout ComponentConfig for the Views GoldenLayout Component.
         * If not overridden by inherited class, gives generic config with its type as its name.
         * If you want to use the "View"-Component, add {content: this.content} to componentState.
         */
        getLayout(): GoldenLayout.ComponentConfig;
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
declare namespace Fudge {
    class ViewData extends View {
        private data;
        constructor(_parent: Panel);
        deconstruct(): void;
        fillContent(): void;
        private changeNodeName;
        private setNode;
        private addComponent;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    /**
     * View displaying a Node and the hierarchical relation to its parents and children.
     * Consists of a viewport and a tree-control.
     */
    class ViewNode extends View {
        branch: ƒ.Node;
        selectedNode: ƒ.Node;
        listController: ƒui.UINodeList;
        constructor(_parent: NodePanel);
        deconstruct(): void;
        fillContent(): void;
        setRoot(_node: ƒ.Node): void;
        private createNode;
        private setSelectedNode;
        private passEventToPanel;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    /**
     * View displaying a Node and the hierarchical relation to its parents and children.
     * Consists of a viewport and a tree-control.
     */
    class ViewViewport extends View {
        viewport: ƒ.Viewport;
        canvas: HTMLCanvasElement;
        branch: ƒ.Node;
        constructor(_parent: NodePanel);
        deconstruct(): void;
        fillContent(): void;
        /**
         * Set the root node for display in this view
         * @param _node
         */
        setRoot(_node: ƒ.Node): void;
        /**
         * Update Viewport every frame
         */
        private animate;
    }
}
