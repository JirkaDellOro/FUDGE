/// <reference types="../@types/golden-layout" />
/// <reference types="../../core/build/fudgecore" />
/// <reference types="../../userinterface/build/fudgeui" />
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
        /**
         * Returns a randomly generated ID.
         * Used to identify panels
         */
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
        /**
         * Returns the currently active Panel
         */
        getActivePanel(): Panel;
        /**
         * Initialize GoldenLayout Context of the PanelManager Instance
         */
        init(): void;
        /**
         * Sets the currently active panel. Shouldn't be called by itself. Rather, it should be called by a goldenLayout-Event (i.e. when a tab in the Layout is selected)
         * "activeContentItemChanged" Events usually come from the first ContentItem in the root-Attribute of the GoldenLayout-Instance or when a new Panel is
         * created and added to the Panel-List.
         * During Initialization and addPanel function, this method is called already.
         */
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
        ANIMATION = "ViewAnimation",
        PORT = "ViewPort",
        DATA = "ViewData",
        CAMERA = "ViewCamera"
    }
    /**
     * Base class for all Views to support generic functionality
     * @author Monika Galkewitsch, HFU, 2019
     * @author Lukas Scheuerle, HFU, 2019
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
    import ƒ = FudgeCore;
    class ViewCamera extends View {
        camera: ƒ.ComponentCamera;
        constructor(_panel: Panel);
        fillContent(): void;
        deconstruct(): void;
        private setCamera;
    }
}
declare namespace Fudge {
    class ViewData extends View {
        private data;
        constructor(_parent: Panel);
        deconstruct(): void;
        fillContent(): void;
        /**
         * Changes the name of the displayed node
         */
        private changeNodeName;
        /**
         * Change displayed node
         */
        private setNode;
        /**
         * Add Component to displayed node
         */
        private addComponent;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    /**
     * View displaying a Node and the hierarchical relation to its parents and children.
     * Consists of a viewport, a tree-control and .
     */
    class ViewNode extends View {
        branch: ƒ.Node;
        selectedNode: ƒ.Node;
        listController: ƒui.UINodeList;
        constructor(_parent: NodePanel);
        deconstruct(): void;
        fillContent(): void;
        /**
         * Display structure of node
         * @param _node Node to be displayed
         */
        setRoot(_node: ƒ.Node): void;
        /**
         * Add new Node to Node Structure
         */
        private createNode;
        /**
         * Change the selected Node
         */
        private setSelectedNode;
        /**
         * Pass Event to Panel
         */
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
        private activeViewport;
    }
}
