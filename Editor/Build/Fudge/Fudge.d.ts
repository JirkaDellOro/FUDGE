/// <reference types="../../../core/build/fudgecore" />
/// <reference types="../../../userinterface/build/fudgeuserinterface" />
/// <reference types="golden-layout" />
declare namespace Fudge {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    enum EVENT_EDITOR {
        REMOVE = "nodeRemoveEvent",
        HIDE = "nodeHideEvent",
        ACTIVEVIEWPORT = "activeViewport"
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
    class ComponentController extends ƒui.Controller {
        constructor(_mutable: ƒ.Mutable, _domElement: HTMLElement);
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
    enum PANEL {
        GRAPH = "PanelGraph"
    }
    /**
     * Base class for all [[Panel]]s aggregating [[View]]s
     * Subclasses are presets for common panels. A user might add or delete [[View]]s at runtime
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    abstract class Panel extends EventTarget {
        protected goldenLayout: GoldenLayout;
        protected dom: HTMLElement;
        private views;
        constructor(_container: GoldenLayout.Container, _state: Object);
        /** Send custom copies of the give event to the views */
        broadcastEvent(_event: Event): void;
        private addViewComponent;
    }
}
import ƒui = FudgeUserInterface;
declare namespace Fudge {
    import ƒ = FudgeCore;
    /**
    * Panel that functions as a Node Editor. Uses ViewData, ViewPort and ViewNode.
    * Use NodePanelTemplate to initialize the default NodePanel.
    * @authors Monika Galkewitsch, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
    */
    class PanelGraph extends Panel {
        private node;
        constructor(_container: GoldenLayout.Container, _state: Object);
        setNode(_node: ƒ.Node): void;
        getNode(): ƒ.Node;
        private hndSelectNode;
    }
}
declare namespace Fudge {
    /**
     * Manages all [[Panel]]s used by Fudge at the time. Call the static instance Member to use its functions.
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     * @author
     */
    class PanelManager extends EventTarget {
        static idCounter: number;
        static instance: PanelManager;
        editorLayout: GoldenLayout;
        private panels;
        private activePanel;
        private constructor();
        /**
         * Add View to PanelManagers View List and add the view to the active panel
         */
        static add(_panel: typeof Panel, _title: string, _state?: Object): void;
        private static generateID;
        /**
         * Returns the currently active Panel
         */
        getActivePanel(): Panel;
        /**
         * Initialize GoldenLayout Context of the PanelManager Instance
         */
        init(): void;
    }
    /**
     * Factory Function for the generic "View"-Component
     */
    function registerViewComponent(_container: GoldenLayout.Container, _state: Object): void;
    /**
     * Factory Function for the generic "Panel"-Component
     */
    function registerPanelComponent(_container: GoldenLayout.Container, _state: Object): void;
}
declare namespace Fudge {
    enum VIEW {
        HIERARCHY = "ViewHierarchy",
        ANIMATION = "ViewAnimation",
        RENDER = "ViewRender",
        COMPONENTS = "ViewComponents",
        CAMERA = "ViewCamera"
    }
    /**
     * Base class for all [[View]]s to support generic functionality
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    abstract class View extends EventTarget {
        dom: HTMLElement;
        constructor(_container: GoldenLayout.Container, _state: Object);
        /** Cleanup when user closes view */
        abstract cleanup(): void;
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
    class ViewAnimation extends View {
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
        constructor(_container: GoldenLayout.Container, _state: Object);
        openAnimation(): void;
        fillContent(): void;
        installListeners(): void;
        cleanup(): void;
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
}
declare namespace Fudge {
    /**
     * View all components attached to a node
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewComponents extends View {
        private node;
        constructor(_container: GoldenLayout.Container, _state: Object);
        cleanup(): void;
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
     * View the hierarchy of a graph as tree-control
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewHierarchy extends View {
        graph: ƒ.Node;
        selectedNode: ƒ.Node;
        tree: ƒui.Tree<ƒ.Node>;
        contextMenu: Electron.Menu;
        constructor(_container: GoldenLayout.Container, _state: Object);
        cleanup(): void;
        setRoot(_node: ƒ.Node): void;
        private setNode;
        private passEventToPanel;
        private openContextMenu;
        private contextMenuCallback;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    /**
     * View the rendering of a graph in a viewport with an independent camera
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewRender extends View {
        viewport: ƒ.Viewport;
        canvas: HTMLCanvasElement;
        graph: ƒ.Node;
        constructor(_container: GoldenLayout.Container, _state: Object);
        cleanup(): void;
        createUserInterface(): void;
        setRoot(_node: ƒ.Node): void;
        private animate;
        private activeViewport;
    }
}
