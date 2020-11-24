/// <reference types="../../../node_modules/electron/electron" />
/// <reference types="../../../aid/build/fudgeaid" />
/// <reference types="golden-layout" />
/// <reference types="../../../userinterface/build/fudgeuserinterface" />
declare namespace Fudge {
    type ContextMenuCallback = (menuItem: Electron.MenuItem, browserWindow: Electron.BrowserWindow, event: Electron.KeyboardEvent) => void;
    class ContextMenu {
        static appendCopyPaste(_menu: Electron.Menu): void;
        static getSubclassMenu<T extends {
            name: string;
        }>(_id: CONTEXTMENU, _superclass: T[], _callback: ContextMenuCallback): Electron.Menu;
    }
}
declare namespace Fudge {
    enum CONTEXTMENU {
        ADD_NODE = 0,
        ADD_COMPONENT = 1,
        ADD_COMPONENT_SCRIPT = 2,
        DELETE_NODE = 3,
        EDIT = 4,
        CREATE = 5,
        CONTROL_MODE = 6,
        INTERACTION_MODE = 7,
        CREATE_MESH = 8,
        CREATE_MATERIAL = 9,
        CREATE_GRAPH = 10
    }
    enum MENU {
        QUIT = "quit",
        PROJECT_SAVE = "projectSave",
        PROJECT_LOAD = "projectLoad",
        DEVTOOLS_OPEN = "devtoolsOpen",
        PANEL_GRAPH_OPEN = "panelGraphOpen",
        PANEL_ANIMATION_OPEN = "panelAnimationOpen",
        PANEL_PROJECT_OPEN = "panelProjectOpen",
        FULLSCREEN = "fullscreen",
        PANEL_MODELLER_OPEN = "panelModellerOpen"
    }
    enum EVENT_EDITOR {
        SET_GRAPH = "setGraph",
        FOCUS_NODE = "focusNode",
        SET_PROJECT = "setProject",
        UPDATE = "update",
        DESTROY = "destroy"
    }
    enum PANEL {
        GRAPH = "PanelGraph",
        PROJECT = "PanelProject",
        MODELLER = "PanelModeller"
    }
    enum VIEW {
        HIERARCHY = "ViewHierarchy",
        ANIMATION = "ViewAnimation",
        RENDER = "ViewRender",
        COMPONENTS = "ViewComponents",
        CAMERA = "ViewCamera",
        INTERNAL = "ViewInternal",
        EXTERNAL = "ViewExternal",
        PROPERTIES = "ViewProperties",
        PREVIEW = "ViewPreview",
        MODELLER = "ViewModeller",
        OBJECT_PROPERTIES = "ViewObjectProperties",
        SCRIPT = "ViewScript"
    }
}
declare namespace Fudge {
    export enum MIME {
        TEXT = "text",
        AUDIO = "audio",
        IMAGE = "image",
        UNKNOWN = "unknown"
    }
    const fs: ƒ.General;
    export class DirectoryEntry {
        path: typeof fs.PathLike;
        pathRelative: typeof fs.PathLike;
        dirent: typeof fs.Dirent;
        stats: Object;
        constructor(_path: typeof fs.PathLike, _pathRelative: typeof fs.PathLike, _dirent: typeof fs.Dirent, _stats: Object);
        static createRoot(_path: typeof fs.PathLike): DirectoryEntry;
        get name(): string;
        set name(_name: string);
        get isDirectory(): boolean;
        get type(): string;
        delete(): void;
        getDirectoryContent(): DirectoryEntry[];
        getFileContent(): string;
        addEntry(_entry: DirectoryEntry): void;
        getMimeType(): MIME;
    }
    export {};
}
declare namespace Fudge {
    function saveProject(): Promise<void>;
    function saveMesh(jsonString: string): Promise<void>;
    function promptLoadProject(): Promise<URL>;
    function loadProject(_url: URL): Promise<void>;
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class FileInfo extends ƒ.Mutable {
        overwrite: boolean;
        filename: string;
        constructor(_overwrite: boolean, _filename: string);
        protected reduceMutator(_mutator: ƒ.Mutator): void;
    }
    export class Files extends ƒ.Mutable {
        index: FileInfo;
        style: FileInfo;
        internal: FileInfo;
        script: FileInfo;
        constructor();
        protected reduceMutator(_mutator: ƒ.Mutator): void;
    }
    export class Project extends ƒ.Mutable {
        files: Files;
        title: string;
        private includePhysics;
        private includeAutoViewScript;
        private graphToStartWith;
        constructor();
        openDialog(): Promise<boolean>;
        hndChange: (_event: Event) => void;
        getProjectJSON(): string;
        getProjectCSS(): string;
        getProjectHTML(): string;
        getGraphs(): Object;
        getMutatorAttributeTypes(_mutator: ƒ.Mutator): ƒ.MutatorAttributeTypes;
        protected reduceMutator(_mutator: ƒ.Mutator): void;
        private updateFilenames;
        private getAutoViewScript;
    }
    export {};
}
declare namespace Fudge {
    const ipcRenderer: Electron.IpcRenderer;
    const remote: Electron.Remote;
    let project: Project;
    /**
     * The uppermost container for all panels controlling data flow between.
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class Page {
        private static idCounter;
        private static goldenLayout;
        private static panels;
        private static currentPanel;
        static start(): Promise<void>;
        static setupGoldenLayout(): void;
        static add(_panel: typeof Panel, _title: string, _state?: Object): void;
        static find(_type: typeof Panel): Panel[];
        private static generateID;
        private static setupPageListeners;
        /** Send custom copies of the given event to the views */
        private static broadcastEvent;
        private static hndEvent;
        private static setupMainListeners;
    }
}
declare namespace Fudge {
    class AnimationList {
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
}
declare namespace Fudge {
    /**
     * Base class for all [[View]]s to support generic functionality
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    abstract class View {
        private static views;
        private static idCount;
        dom: HTMLElement;
        protected contextMenu: Electron.Menu;
        private container;
        private id;
        constructor(_container: GoldenLayout.Container, _state: Object);
        static getViewSource(_event: DragEvent): View;
        private static registerViewForDragDrop;
        setTitle(_title: string): void;
        getDragDropSources(): Object[];
        protected openContextMenu: (_event: Event) => void;
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        protected hndDrop(_event: DragEvent, _source: View): void;
        protected hndDragOver(_event: DragEvent, _source: View): void;
        private hndEventCommon;
    }
}
declare namespace Fudge {
    /**
     * List the external resources
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewExternal extends View {
        private tree;
        constructor(_container: GoldenLayout.Container, _state: Object);
        setProject(): void;
        getSelection(): DirectoryEntry[];
        getDragDropSources(): DirectoryEntry[];
        private hndEvent;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    let typesOfResources: ƒ.General[];
    /**
     * List the internal resources
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewInternal extends View {
        private table;
        constructor(_container: GoldenLayout.Container, _state: Object);
        listResources(): void;
        getSelection(): ƒ.SerializableResource[];
        getDragDropSources(): ƒ.SerializableResource[];
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): Promise<void>;
        protected hndDragOver(_event: DragEvent, _viewSource: View): void;
        protected hndDrop(_event: DragEvent, _viewSource: View): Promise<void>;
        private hndEvent;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    class ControllerComponent extends ƒui.Controller {
        constructor(_mutable: ƒ.Mutable, _domElement: HTMLElement);
        private hndDragOver;
        private hndDrop;
        private filterDragDrop;
        private getAncestorWithType;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class ControllerModeller {
        viewport: ƒ.Viewport;
        currentRotation: ƒ.Vector3;
        target: ƒ.Vector3;
        selectedNodes: ƒ.Node[];
        constructor(viewport: ƒ.Viewport);
        private onclick;
        private handleMove;
        private zoom;
        private rotateCamera;
        private moveCamera;
        private multiplyMatrixes;
    }
}
declare namespace Fudge {
    import ƒui = FudgeUserInterface;
    class ControllerTableResource extends ƒui.TableController<ƒ.SerializableResource> {
        private static head;
        private static getHead;
        getHead(): ƒui.TABLE[];
        getLabel(_object: ƒ.SerializableResource): string;
        rename(_object: ƒ.SerializableResource, _new: string): boolean;
        delete(_focussed: ƒ.SerializableResource[]): ƒ.SerializableResource[];
        copy(_originals: ƒ.SerializableResource[]): Promise<ƒ.SerializableResource[]>;
        sort(_data: ƒ.SerializableResource[], _key: string, _direction: number): void;
    }
}
declare namespace Fudge {
    import ƒui = FudgeUserInterface;
    class ScriptInfo {
        name: string;
        namespace: string;
        superClass: string;
        script: Function;
        isComponent: boolean;
        isComponentScript: boolean;
        constructor(_script: Function, _namespace: string);
    }
    class ControllerTableScript extends ƒui.TableController<ScriptInfo> {
        private static head;
        private static getHead;
        getHead(): ƒui.TABLE[];
        getLabel(_object: ScriptInfo): string;
        rename(_object: ScriptInfo, _new: string): boolean;
        delete(_focussed: ScriptInfo[]): ScriptInfo[];
        copy(_originals: ScriptInfo[]): Promise<ScriptInfo[]>;
        sort(_data: ScriptInfo[], _key: string, _direction: number): void;
    }
}
declare namespace Fudge {
    import ƒUi = FudgeUserInterface;
    class ControllerTreeDirectory extends ƒUi.TreeController<DirectoryEntry> {
        getLabel(_entry: DirectoryEntry): string;
        rename(_entry: DirectoryEntry, _new: string): boolean;
        hasChildren(_entry: DirectoryEntry): boolean;
        getChildren(_entry: DirectoryEntry): DirectoryEntry[];
        delete(_focussed: DirectoryEntry[]): DirectoryEntry[];
        addChildren(_entries: DirectoryEntry[], _target: DirectoryEntry): DirectoryEntry[];
        copy(_originals: DirectoryEntry[]): Promise<DirectoryEntry[]>;
    }
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
        copy(_originals: ƒ.Node[]): Promise<ƒ.Node[]>;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class Controller {
        private interactionMode;
        private currentControlMode;
        private viewport;
        private editableNode;
        private states;
        private controlModesMap;
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node);
        get controlMode(): AbstractControlMode;
        get controlModes(): Map<ControlMode, {
            type: AbstractControlMode;
            shortcut: string;
        }>;
        onmouseup(_event: ƒ.EventPointer): void;
        onmousedown(_event: ƒ.EventPointer): void;
        onmove(_event: ƒ.EventPointer): void;
        switchMode(_event: ƒ.EventKeyboard): void;
        setControlMode(mode: ControlMode): void;
        setInteractionMode(mode: InteractionMode): void;
        private loadState;
        private saveState;
    }
}
declare namespace Fudge {
    enum ControlMode {
        OBJECT_MODE = "ObjectMode",
        EDIT_MODE = "EditMode"
    }
    enum InteractionMode {
        SELECT = "Select",
        TRANSLATE = "Translate",
        ROTATE = "Rotate",
        SCALE = "Scale",
        EXTRUDE = "Extrude",
        IDLE = "Idle"
    }
}
declare namespace Fudge {
    abstract class AbstractControlMode {
        static readonly subclasses: typeof AbstractControlMode[];
        formerMode: IInteractionMode;
        modes: {
            [mode in InteractionMode]?: {
                type: typeof IInteractionMode;
                shortcut: string;
            };
        };
        protected static registerSubclass(_subClass: typeof AbstractControlMode): number;
    }
}
declare namespace Fudge {
    class EditMode extends AbstractControlMode {
        static readonly iSubclass: number;
        modes: {
            [mode in InteractionMode]?: {
                type: typeof IInteractionMode;
                shortcut: string;
            };
        };
    }
}
declare namespace Fudge {
    class ObjectMode extends AbstractControlMode {
        static readonly iSubclass: number;
        modes: {
            [mode in InteractionMode]?: {
                type: typeof IInteractionMode;
                shortcut: string;
            };
        };
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    abstract class IInteractionMode {
        type: InteractionMode;
        selection: Object;
        viewport: ƒ.Viewport;
        editableNode: ƒ.Node;
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node);
        abstract onmousedown(_event: ƒ.EventPointer): string;
        abstract onmouseup(_event: ƒ.EventPointer): void;
        abstract onmove(_event: ƒ.EventPointer): void;
        abstract initialize(): void;
        abstract cleanup(): void;
        protected getPosRenderFrom(_event: ƒ.EventPointer): ƒ.Vector2;
        protected createNormalArrows(): void;
        protected translateVertices(_event: ƒ.EventPointer, distance: number): ƒ.Vector3;
    }
}
declare namespace Fudge {
    class IdleMode extends IInteractionMode {
        readonly type: InteractionMode;
        selection: Object;
        viewport: ƒ.Viewport;
        editableNode: ƒ.Node;
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node);
        initialize(): void;
        onmousedown(_event: ƒ.EventPointer): string;
        onmouseup(_event: ƒ.EventPointer): void;
        onmove(_event: ƒ.EventPointer): void;
        cleanup(): void;
    }
}
declare namespace Fudge {
    class Extrude extends IInteractionMode {
        readonly type: InteractionMode;
        selection: Array<number>;
        viewport: ƒ.Viewport;
        editableNode: ƒ.Node;
        private isExtruded;
        private distance;
        private copyOfSelectedVertices;
        onmousedown(_event: ƒ.EventPointer): string;
        onmouseup(_event: ƒ.EventPointer): void;
        onmove(_event: ƒ.EventPointer): void;
        initialize(): void;
        cleanup(): void;
    }
}
declare namespace Fudge {
    abstract class AbstractRotation extends IInteractionMode {
        readonly type: InteractionMode;
        viewport: ƒ.Viewport;
        selection: Object;
        editableNode: ƒ.Node;
        protected widget: RotationWidget;
        protected pickedCircle: WidgetCircle;
        protected previousIntersection: ƒ.Vector3;
        protected oldColor: ƒ.Color;
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node);
        initialize(): void;
        onmousedown(_event: ƒ.EventPointer): string;
        onmouseup(_event: ƒ.EventPointer): void;
        protected getRotationVector(_event: ƒ.EventPointer): ƒ.Matrix4x4;
        private getIntersection;
        private getAngle;
        private getOrthogonalVector;
        abstract onmove(_event: ƒ.EventPointer): void;
        cleanup(): void;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class EditRotation extends AbstractRotation {
        selection: Array<number>;
        onmove(_event: ƒ.EventPointer): void;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class ObjectRotation extends AbstractRotation {
        selection: ƒ.Node;
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node);
        onmove(_event: ƒ.EventPointer): void;
    }
}
declare namespace Fudge {
    abstract class AbstractSelection extends IInteractionMode {
        readonly type: InteractionMode;
        viewport: ƒ.Viewport;
        selection: Object;
        editableNode: ƒ.Node;
        abstract onmousedown(_event: ƒ.EventPointer): string;
        abstract onmouseup(_event: ƒ.EventPointer): void;
        abstract onmove(_event: ƒ.EventPointer): void;
        cleanup(): void;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class EditSelection extends AbstractSelection {
        selection: Array<number>;
        initialize(): void;
        onmousedown(_event: ƒ.EventPointer): string;
        onmouseup(_event: ƒ.EventPointer): void;
        onmove(_event: ƒ.EventPointer): void;
        private removeSelectedVertexIfAlreadySelected;
    }
}
declare namespace Fudge {
    abstract class AbstractTranslation extends IInteractionMode {
        readonly type: InteractionMode;
        viewport: ƒ.Viewport;
        selection: Object;
        editableNode: ƒ.Node;
        protected pickedArrow: string;
        protected dragging: boolean;
        protected distance: number;
        protected widget: ƒ.Node;
        abstract onmousedown(_event: ƒ.EventPointer): string;
        onmouseup(_event: ƒ.EventPointer): void;
        abstract onmove(_event: ƒ.EventPointer): void;
        cleanup(): void;
    }
}
declare namespace Fudge {
    class EditTranslation extends AbstractTranslation {
        selection: Array<number>;
        private copyOfSelectedVertices;
        initialize(): void;
        onmousedown(_event: ƒ.EventPointer): string;
        onmove(_event: ƒ.EventPointer): void;
    }
}
declare namespace Fudge {
    class ObjectTranslation extends AbstractTranslation {
        private distanceBetweenWidgetPivotAndPointer;
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node);
        initialize(): void;
        onmousedown(_event: ƒ.EventPointer): string;
        onmove(_event: ƒ.EventPointer): void;
        private isArrow;
        private calculateWidgetDistanceFrom;
    }
}
declare namespace Fudge {
    class ModifiableMesh extends ƒ.Mesh {
        private _uniqueVertices;
        constructor();
        get uniqueVertices(): UniqueVertex[];
        getState(): string;
        retrieveState(state: string): void;
        export(): string;
        updateNormals(): void;
        rotateBy(matrix: ƒ.Matrix4x4, center: ƒ.Vector3, selection?: number[]): void;
        extrude(selectedIndices: number[]): number[];
        private addIndicesToNewVertices;
        private getNewVertices;
        private findEdgesFrom;
        private findCorrectFace;
        updatePositionOfVertices(selectedIndices: number[], diffToOldPosition: ƒ.Vector3, oldVertexPositions: Map<number, ƒ.Vector3>): void;
        protected findOrderOfTrigonFromSelectedVertex(selectedIndices: number[]): Array<number>;
        protected updatePositionOfVertex(vertexIndex: number, newPosition: ƒ.Vector3): void;
        protected createVertices(): Float32Array;
        protected createTextureUVs(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createFaceNormals(trigons?: Array<number>): Float32Array;
        private calculateNormals;
    }
}
declare namespace Fudge {
    class UniqueVertex {
        position: ƒ.Vector3;
        indices: Map<number, number[]>;
        constructor(_position: ƒ.Vector3, _indices: Map<number, number[]>);
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class RotationWidget extends ƒ.Node {
        constructor(_name?: string, _transform?: ƒ.Matrix4x4);
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class WidgetCircle extends ƒ.Node {
        constructor(_name: string, _color: ƒ.Color, _transform: ƒ.Matrix4x4);
    }
}
declare namespace Fudge {
    /**
     * Base class for all [[Panel]]s aggregating [[View]]s
     * Subclasses are presets for common panels. A user might add or delete [[View]]s at runtime
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    abstract class Panel extends View {
        protected goldenLayout: GoldenLayout;
        private views;
        constructor(_container: GoldenLayout.Container, _state: Object);
        /** Send custom copies of the given event to the views */
        broadcastEvent: (_event: Event) => void;
        private addViewComponent;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    /**
    * Shows a graph and offers means for manipulation
    * @authors Monika Galkewitsch, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
    */
    class PanelGraph extends Panel {
        private node;
        constructor(_container: GoldenLayout.Container, _state: Object);
        setGraph(_node: ƒ.Node): void;
        getNode(): ƒ.Node;
        private hndEvent;
        private hndFocusNode;
    }
}
declare namespace Fudge {
    class PanelModeller extends Panel {
        constructor(_container: GoldenLayout.Container, _state: Object);
        protected cleanup(): void;
    }
}
declare namespace Fudge {
    /**
     * Display the project structure and offer functions for creation, deletion and adjustment of resources
     * @authors Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class PanelProject extends Panel {
        constructor(_container: GoldenLayout.Container, _state: Object);
        private hndEvent;
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
        controller: AnimationList;
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
        private expanded;
        constructor(_container: GoldenLayout.Container, _state: Object);
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        protected hndDragOver(_event: DragEvent, _viewSource: View): void;
        protected hndDrop(_event: DragEvent, _viewSource: View): void;
        private fillContent;
        private hndEvent;
        private createComponent;
        private findComponentType;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    /**
     * View the hierarchy of a graph as tree-control
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewHierarchy extends View {
        private graph;
        private tree;
        constructor(_container: GoldenLayout.Container, _state: Object);
        setGraph(_graph: ƒ.Node): void;
        getSelection(): ƒ.Node[];
        getDragDropSources(): ƒ.Node[];
        protected hndDragOver(_event: DragEvent, _viewSource: View): void;
        protected hndDrop(_event: DragEvent, _viewSource: View): Promise<void>;
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        private hndEvent;
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
        createUserInterface(): void;
        setGraph(_node: ƒ.Node): void;
        protected hndDragOver(_event: DragEvent, _viewSource: View): void;
        protected hndDrop(_event: DragEvent, _viewSource: View): void;
        private hndEvent;
        private activeViewport;
        private redraw;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class ViewModellerScene extends View {
        viewport: ƒ.Viewport;
        canvas: HTMLCanvasElement;
        graph: ƒ.Node;
        controller: Controller;
        node: ƒ.Node;
        constructor(_container: GoldenLayout.Container, _state: Object);
        createUserInterface(): void;
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        private animate;
        private onmove;
        private onmouseup;
        private onmousedown;
        private handleKeyboard;
        protected cleanup(): void;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class ViewObjectProperties extends View {
        private currentNode;
        constructor(_container: GoldenLayout.Container, _state: Object);
        protected setObject(_object: ƒ.Node): void;
        private fillContent;
        protected cleanup(): void;
    }
}
declare namespace Fudge {
    /**
     * Preview a resource
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewPreview extends View {
        private static mtrStandard;
        private static meshStandard;
        private resource;
        private viewport;
        constructor(_container: GoldenLayout.Container, _state: Object);
        private static createStandardMaterial;
        private static createStandardMesh;
        private fillContent;
        private createStandardGraph;
        private createFilePreview;
        private createTextPreview;
        private createImagePreview;
        private createAudioPreview;
        private createScriptPreview;
        private hndEvent;
        private redraw;
    }
}
declare namespace Fudge {
    /**
     * View the properties of a resource
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewProperties extends View {
        private resource;
        constructor(_container: GoldenLayout.Container, _state: Object);
        protected hndDragOver(_event: DragEvent, _viewSource: View): void;
        private fillContent;
        private hndEvent;
    }
}
declare namespace Fudge {
    /**
     * List the scripts loaded
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewScript extends View {
        private table;
        constructor(_container: GoldenLayout.Container, _state: Object);
        listScripts(): void;
        getSelection(): ScriptInfo[];
        getDragDropSources(): ScriptInfo[];
        private hndEvent;
    }
}
