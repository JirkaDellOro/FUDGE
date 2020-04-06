/// <reference types="../../../core/build/fudgecore" />
/// <reference types="../../../userinterface/build/fudgeui" />
/// <reference types="golden-layout" />
declare namespace Fudge {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    enum EVENT_EDITOR {
        REMOVE = "nodeRemoveEvent",
        HIDE = "nodeHideEvent",
        ACTIVEVIEWPORT = "activeViewport"
    }
    enum NODEMENU {
        EMPTY = "Empty Node",
        BOX = "Box Mesh Node",
        PYRAMID = "Pyramid Mesh Node",
        PLANE = "Plane Mesh Node"
    }
    enum COMPONENTMENU {
        MESHBOX = "Mesh Component.Box Mesh Component",
        MESHPLANE = "Mesh Component.Plane Mesh Component",
        MESHPYRAMID = "Mesh Component.Pyramid Mesh Component",
        AUDIOLISTENER = "Audio Listener Component",
        AUDIO = "Audio Component",
        ANIMATION = "Animation Component",
        CAMERA = "Camera Component",
        LIGHT = "Light Component",
        SCRIPT = "Script Component",
        TRANSFORM = "Transform Component"
    }
    class UIAnimationList {
        listRoot: HTMLElement;
        private mutator;
        private index;
        constructor(_mutator: ƒ.Mutator, _listContainer: HTMLElement);
        getMutator(): ƒ.Mutator;
        setMutator(_mutator: ƒ.Mutator): void;
        collectMutator: () => ƒ.Mutator;
        getElementIndex(): ƒ.Mutator;
        updateMutator(_update: ƒ.Mutator): void;
        private updateEntry;
        private updateMutatorEntry;
        private buildFromMutator;
        private toggleCollapse;
    }
    class NodeData extends ƒui.Mutable {
        constructor(_mutable: ƒ.Mutable, _container: HTMLElement);
    }
}
declare namespace Fudge {
    const ipcRenderer: Electron.IpcRenderer;
    const remote: Electron.Remote;
}
declare namespace Fudge {
    export enum MENU {
        ADD_NODE = 0,
        ADD_COMPONENT = 1
    }
    type ContextMenuCallback = (menuItem: Electron.MenuItem, browserWindow: Electron.BrowserWindow, event: Electron.KeyboardEvent) => void;
    export class ContextMenu {
        static getMenu(_for: typeof View, _callback: ContextMenuCallback): Electron.Menu;
        private static appendCopyPaste;
        private static getComponents;
    }
    export {};
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    import ƒUi = FudgeUserInterface;
    class ControllerTreeNode extends ƒUi.TreeController<ƒ.Node> {
        getLabel(_node: ƒ.Node): string;
        rename(_node: ƒ.Node, _new: string): boolean;
        hasChildren(_node: ƒ.Node): boolean;
        getChildren(_node: ƒ.Node): ƒ.Node[];
        delete(_focussed: ƒ.Node[]): ƒ.Node[];
        addChildren(_children: ƒ.Node[], _target: ƒ.Node): ƒ.Node[];
        copy(_originals: ƒ.Node[]): ƒ.Node[];
    }
}
declare namespace Fudge {
    /**
     * Holds various views into the currently processed Fudge-project.
     * There must be only one ViewData in this panel, that displays data for the selected entity
     * Multiple panels may be created by the user, presets for different processing should be available
     * @author Monika Galkewitsch, HFU, 2019
     * @author Lukas Scheuerle, HFU, 2019
     */
    abstract class Panel extends EventTarget {
        private static idCounter;
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
    import ƒ = FudgeCore;
    /**
    * Panel that functions as a Node Editor. Uses ViewData, ViewPort and ViewNode.
    * Use NodePanelTemplate to initialize the default NodePanel.
    * @author Monika Galkewitsch, 2019, HFU
    */
    class PanelNode extends Panel {
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
    interface ViewAnimationKey {
        key: FudgeCore.AnimationKey;
        path2D: Path2D;
        sequence: ViewAnimationSequence;
    }
    interface ViewAnimationSequence {
        color: string;
        element: HTMLElement;
        sequence: FudgeCore.AnimationSequence;
    }
    interface ViewAnimationEvent {
        event: string;
        path2D: Path2D;
    }
    interface ViewAnimationLabel {
        label: string;
        path2D: Path2D;
    }
    class ViewAnimation extends Fudge.View {
        node: FudgeCore.Node;
        animation: FudgeCore.Animation;
        cmpAnimator: FudgeCore.ComponentAnimator;
        playbackTime: number;
        controller: UIAnimationList;
        private canvas;
        private attributeList;
        private crc;
        private sheet;
        private toolbar;
        private hover;
        private time;
        private playing;
        constructor(_parent: Panel);
        openAnimation(): void;
        fillContent(): void;
        installListeners(): void;
        deconstruct(): void;
        mouseClick(_e: MouseEvent): void;
        mouseDown(_e: MouseEvent): void;
        mouseMove(_e: MouseEvent): void;
        mouseUp(_e: MouseEvent): void;
        private fillToolbar;
        private toolbarClick;
        private toolbarChange;
        private changeAttribute;
        private updateDisplay;
        private setTime;
        private playAnimation;
        private randomNameGenerator;
    }
}
declare namespace Fudge {
    abstract class ViewAnimationSheet {
        view: ViewAnimation;
        seq: FudgeCore.AnimationSequence[];
        crc2: CanvasRenderingContext2D;
        scale: FudgeCore.Vector2;
        protected position: FudgeCore.Vector2;
        protected savedImage: ImageData;
        protected keys: ViewAnimationKey[];
        protected sequences: ViewAnimationSequence[];
        protected labels: ViewAnimationLabel[];
        protected events: ViewAnimationEvent[];
        constructor(_view: ViewAnimation, _crc: CanvasRenderingContext2D, _seq: FudgeCore.AnimationSequence[], _scale?: FudgeCore.Vector2, _pos?: FudgeCore.Vector2);
        moveTo(_time: number, _value?: number): void;
        translate(): void;
        redraw(_time: number): void;
        clear(): void;
        drawTimeline(): void;
        drawCursor(_time: number): void;
        drawKeys(): void;
        getObjectAtPoint(_x: number, _y: number): ViewAnimationLabel | ViewAnimationKey | ViewAnimationEvent;
        protected traverseStructures(_animation: FudgeCore.AnimationStructure, _inputs: FudgeCore.Mutator): void;
        protected abstract drawSequence(_sequence: FudgeCore.AnimationSequence, _input: HTMLInputElement): void;
        protected drawKey(_x: number, _y: number, _h: number, _w: number, _c: string): Path2D;
        private drawEventsAndLabels;
        private calculateDisplay;
    }
}
declare namespace Fudge {
    class ViewAnimationSheetCurve extends ViewAnimationSheet {
        drawKeys(): void;
        protected drawSequence(_sequence: FudgeCore.AnimationSequence, _input: HTMLInputElement): void;
        protected drawKey(_x: number, _y: number, _h: number, _w: number, _c: string): Path2D;
        private drawYScale;
        private calcScaleSize;
        private randomColor;
    }
}
declare namespace Fudge {
    class ViewAnimationSheetDope extends ViewAnimationSheet {
        drawKeys(): Promise<void>;
        protected drawSequence(_sequence: FudgeCore.AnimationSequence, _input: HTMLInputElement): void;
    }
}
declare namespace Fudge {
    class ViewAnimationTemplate extends PanelTemplate {
        constructor();
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
    class ViewComponents extends View {
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
        tree: ƒui.Tree<ƒ.Node>;
        contextMenu: Electron.Menu;
        constructor(_parent: PanelNode);
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
        private openContextMenu;
        private contextMenuCallback;
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
        constructor(_parent: PanelNode);
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
