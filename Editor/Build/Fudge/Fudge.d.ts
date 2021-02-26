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
        CREATE_MESH = 6,
        CREATE_MATERIAL = 7,
        CREATE_GRAPH = 8
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
    import ƒui = FudgeUserInterface;
    class ControllerVertices extends ƒui.Controller {
        node: ƒ.Node;
        constructor(_mutable: ƒ.Mutable, _domElement: HTMLElement);
        private handleInput;
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
        private currentState;
        private dom;
        private controlModesMap;
        constructor(_viewport: ƒ.Viewport, _editableNode: ƒ.Node, _dom: HTMLElement);
        get controlMode(): IControlMode;
        get controlModes(): Map<CONTROL_MODE, {
            type: IControlMode;
            shortcut: string;
        }>;
        onmouseup(_event: ƒ.EventPointer): void;
        onmousedown(_event: ƒ.EventPointer): void;
        onmove(_event: ƒ.EventPointer): void;
        onkeydown(_event: ƒ.EventKeyboard): void;
        onkeyup(_event: ƒ.EventKeyboard): void;
        getSelection(): number[];
        getInteractionModeType(): INTERACTION_MODE;
        switchMode(_event: ƒ.EventKeyboard): void;
        setControlMode(mode: CONTROL_MODE): void;
        setInteractionMode(mode: INTERACTION_MODE): void;
        drawSelection(): void;
        getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
        contextMenuCallback: (_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event) => void;
        private loadState;
        private saveState;
    }
}
declare namespace Fudge {
    enum CONTROL_MODE {
        OBJECT_MODE = "Object-Mode",
        EDIT_MODE = "Edit-Mode"
    }
    enum INTERACTION_MODE {
        SELECT = "Box-Select",
        TRANSLATE = "Translate",
        ROTATE = "Rotate",
        SCALE = "Scale",
        EXTRUDE = "Extrude",
        IDLE = "Idle"
    }
    enum AXIS {
        X = "X",
        Y = "Y",
        Z = "Z"
    }
    enum MODELLER_EVENTS {
        HEADER_APPEND = "headerappend",
        SELECTION_UPDATE = "selectionupdate"
    }
    enum MODELLER_MENU {
        DISPLAY_NORMALS = 0,
        INVERT_FACE = 1,
        TOGGLE_BACKFACE_CULLING = 2
    }
}
declare namespace Fudge {
    class EditMode implements IControlMode {
        formerMode: IInteractionMode;
        type: CONTROL_MODE;
        modes: {
            [mode in INTERACTION_MODE]?: {
                type: typeof InteractionMode;
                shortcut: string;
            };
        };
    }
}
declare namespace Fudge {
    interface IControlMode {
        type: CONTROL_MODE;
        formerMode: IInteractionMode;
        modes: {
            [mode in INTERACTION_MODE]?: {
                type: typeof InteractionMode;
                shortcut: string;
            };
        };
    }
}
declare namespace Fudge {
    class ObjectMode implements IControlMode {
        formerMode: IInteractionMode;
        type: CONTROL_MODE;
        modes: {
            [mode in INTERACTION_MODE]?: {
                type: typeof InteractionMode;
                shortcut: string;
            };
        };
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    interface IInteractionMode {
        readonly type: INTERACTION_MODE;
        selection: Array<number>;
        viewport: ƒ.Viewport;
        editableNode: ƒ.Node;
        onmousedown(_event: ƒ.EventPointer): void;
        onmouseup(_event: ƒ.EventPointer): string;
        onmove(_event: ƒ.EventPointer): void;
        onkeydown(_pressedKey: string): void;
        onkeyup(_pressedKey: string): string;
        update(): void;
        getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
        contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        initialize(): void;
        cleanup(): void;
        animate(): void;
        updateAfterUndo(): void;
    }
}
declare namespace Fudge {
    abstract class InteractionMode implements IInteractionMode {
        protected static normalsAreDisplayed: boolean;
        readonly type: INTERACTION_MODE;
        selection: Array<number>;
        viewport: ƒ.Viewport;
        editableNode: ƒ.Node;
        protected selector: Selector;
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection?: Array<number>);
        abstract onmousedown(_event: ƒ.EventPointer): void;
        abstract onmouseup(_event: ƒ.EventPointer): string;
        abstract onmove(_event: ƒ.EventPointer): void;
        abstract onkeydown(_pressedKey: string): void;
        abstract onkeyup(_pressedKey: string): string;
        abstract update(): void;
        abstract getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
        abstract contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        abstract initialize(): void;
        abstract cleanup(): void;
        animate: () => void;
        updateAfterUndo(): void;
        protected getPosRenderFrom(_event: ƒ.EventPointer): ƒ.Vector2;
        protected createNormalArrows(): void;
        protected removeNormalArrows(): void;
        protected toggleNormals(): void;
        protected copyVertices(): Map<number, ƒ.Vector3>;
        protected getPointerPosition(_event: ƒ.EventPointer, distance: number): ƒ.Vector3;
        protected getDistanceFromRayToCenterOfNode(_event: ƒ.EventPointer, distance: number): ƒ.Vector3;
        protected getDistanceFromCameraToCentroid(_centroid: ƒ.Vector3): number;
        private drawCircleAtVertex;
        private drawCircleAtSelection;
    }
}
declare namespace Fudge {
    class Extrude extends InteractionMode {
        private static selectionRadius;
        readonly type: INTERACTION_MODE;
        selection: Array<number>;
        viewport: ƒ.Viewport;
        editableNode: ƒ.Node;
        private isExtruded;
        private distanceCameraToCentroid;
        private oldPosition;
        private axesSelectionHandler;
        private vertexSelected;
        private orientation;
        private clientCentroid;
        private loopIsRunning;
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>);
        onmousedown(_event: ƒ.EventPointer): void;
        onmouseup(_event: ƒ.EventPointer): string;
        onmove(_event: ƒ.EventPointer): void;
        onkeydown(pressedKey: string): void;
        onkeyup(pressedKey: string): string;
        getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
        contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        update(): void;
        initialize(): void;
        cleanup(): void;
        private startLoop;
        private drawSelectionCircle;
    }
}
declare namespace Fudge {
    class IdleMode extends InteractionMode {
        readonly type: INTERACTION_MODE;
        initialize(): void;
        onmousedown(_event: ƒ.EventPointer): void;
        onmouseup(_event: ƒ.EventPointer): string;
        onmove(_event: ƒ.EventPointer): void;
        onkeydown(_pressedKey: string): void;
        onkeyup(_pressedKey: string): string;
        getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
        contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        update(): void;
        cleanup(): void;
    }
}
declare namespace Fudge {
    abstract class AbstractRotation extends InteractionMode {
        readonly type: INTERACTION_MODE;
        viewport: ƒ.Viewport;
        selection: Array<number>;
        editableNode: ƒ.Node;
        protected axesSelectionHandler: AxesSelectionHandler;
        private previousMousePos;
        initialize(): void;
        onmousedown(_event: ƒ.EventPointer): void;
        onmouseup(_event: ƒ.EventPointer): string;
        onmove(_event: ƒ.EventPointer): void;
        onkeydown(_pressedKey: string): void;
        onkeyup(_pressedKey: string): string;
        contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
        update(): void;
        cleanup(): void;
        private getRotationMatrix;
        private getAngle;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class EditRotation extends AbstractRotation {
        private vertexSelected;
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>);
        onmousedown(_event: ƒ.EventPointer): void;
        onmove(_event: ƒ.EventPointer): void;
        onmouseup(_event: ƒ.EventPointer): string;
        getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
        contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class ObjectRotation extends AbstractRotation {
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>);
    }
}
declare namespace Fudge {
    class AbstractScalation extends InteractionMode {
        readonly type: INTERACTION_MODE;
        protected oldPosition: ƒ.Vector3;
        protected distanceCameraToCentroid: number;
        protected distancePointerToCentroid: ƒ.Vector3;
        protected copyOfSelectedVertices: Map<number, ƒ.Vector3>;
        protected axesSelectionHandler: AxesSelectionHandler;
        private centroid;
        initialize(): void;
        onmousedown(_event: ƒ.EventPointer): void;
        onmouseup(_event: ƒ.EventPointer): string;
        onmove(_event: ƒ.EventPointer): void;
        onkeydown(_pressedKey: string): void;
        onkeyup(_pressedKey: string): string;
        getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
        contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        update(): void;
        cleanup(): void;
        private setValues;
    }
}
declare namespace Fudge {
    class EditScalation extends AbstractScalation {
        private vertexSelected;
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>);
        onmousedown(_event: ƒ.EventPointer): void;
        onmove(_event: ƒ.EventPointer): void;
        onmouseup(_event: ƒ.EventPointer): string;
        getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
        contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
    }
}
declare namespace Fudge {
    class ObjectScalation extends AbstractScalation {
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>);
    }
}
declare namespace Fudge {
    abstract class AbstractSelection extends InteractionMode {
        readonly type: INTERACTION_MODE;
        viewport: ƒ.Viewport;
        editableNode: ƒ.Node;
        cleanup(): void;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class EditSelection extends AbstractSelection {
        selection: Array<number>;
        private boxStart;
        private clientPos;
        private vertexSelected;
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>);
        initialize(): void;
        onmousedown(_event: ƒ.EventPointer): void;
        onmouseup(_event: ƒ.EventPointer): string;
        onmove(_event: ƒ.EventPointer): void;
        onkeydown(_pressedKey: string): void;
        onkeyup(_pressedKey: string): string;
        update(): void;
        getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
        contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        private drawBox;
    }
}
declare namespace Fudge {
    abstract class AbstractTranslation extends InteractionMode {
        readonly type: INTERACTION_MODE;
        viewport: ƒ.Viewport;
        selection: Array<number>;
        editableNode: ƒ.Node;
        protected dragging: boolean;
        protected distanceCameraToCentroid: number;
        protected oldPosition: ƒ.Vector3;
        protected axesSelectionHandler: AxesSelectionHandler;
        initialize(): void;
        onmousedown(_event: ƒ.EventPointer): void;
        onmouseup(_event: ƒ.EventPointer): string;
        onmove(_event: ƒ.EventPointer): void;
        onkeydown(_pressedKey: string): void;
        onkeyup(_pressedKey: string): string;
        getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
        contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        update(): void;
        cleanup(): void;
    }
}
declare namespace Fudge {
    class EditTranslation extends AbstractTranslation {
        private vertexSelected;
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>);
        onmousedown(_event: ƒ.EventPointer): void;
        onmove(_event: ƒ.EventPointer): void;
        onmouseup(_event: ƒ.EventPointer): string;
        getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
        contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
    }
}
declare namespace Fudge {
    class ObjectTranslation extends AbstractTranslation {
        constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node);
    }
}
declare namespace Fudge {
    class MeshExtrude {
        private numberOfFaces;
        private vertexCount;
        private uniqueVertices;
        private newTriangles;
        private numberOfIndices;
        private newVertexToOriginalVertexMap;
        private originalVertexToNewVertexMap;
        private vertexToUniqueVertexMap;
        private vertices;
        private originalVertexToNewUniqueVertexMap;
        constructor(_numberOfFaces: number, _vertices: Float32Array, _uniqueVertices: UniqueVertex[], _numberOfIndices: number);
        extrude(selection: number[]): number[];
        private findEdgesFromData;
        private extrudeEdge;
        private addNewTriangles;
        private fillVertexMap;
        private getInnerEdges;
        private findEdgesToRemove;
        private removeInteriorEdges;
        private removeDuplicateEdges;
        private addFrontFaces;
        private areEdgesDuplicate;
    }
}
declare namespace Fudge {
    class ModifiableMesh extends ƒ.Mesh {
        #private;
        static readonly vertexSize: number;
        constructor();
        get uniqueVertices(): UniqueVertex[];
        getState(): string;
        retrieveState(state: string): void;
        export(): string;
        updateMesh(): void;
        getCentroid(selection?: number[]): ƒ.Vector3;
        removeFace(selection: number[]): void;
        updateNormals(): void;
        invertFace(selection: number[]): void;
        scaleBy(scaleMatrix: ƒ.Matrix4x4, oldVertices: Map<number, ƒ.Vector3>, selection?: number[]): void;
        translateVertices(difference: ƒ.Vector3, selection: number[]): void;
        rotateBy(matrix: ƒ.Matrix4x4, center: ƒ.Vector3, selection?: number[]): void;
        extrude(selectedVertices: number[]): ƒ.Vector3;
        updatePositionOfVertices(selectedIndices: number[], oldVertexPositions: Map<number, ƒ.Vector3>, diffToOldPosition: ƒ.Vector3, offset: ƒ.Vector3): void;
        private rearrangeIndicesAfterRemove;
        private countNumberOfFaces;
        private findCorrectFace;
        protected updatePositionOfVertex(vertexIndex: number, newPosition: ƒ.Vector3): void;
        protected findOrderOfTrigonFromSelectedVertex(selectedIndices: number[]): Array<number>;
        protected createVertices(): Float32Array;
        protected createTextureUVs(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createFaceNormals(trigons?: Array<number>): Float32Array;
        private calculateNormals;
    }
}
declare namespace Fudge {
    class UniqueVertex extends ƒ.Mutable {
        position: ƒ.Vector3;
        vertexToData: Map<number, {
            indices: number[];
            face?: number;
            edges?: number[];
        }>;
        constructor(_position: ƒ.Vector3, _vertexToData: Map<number, {
            indices: number[];
            face?: number;
            edges?: number[];
        }>);
        protected reduceMutator(_mutator: ƒ.Mutator): void;
    }
}
declare namespace Fudge {
    class AxesSelectionHandler {
        isSelectedViaKeyboard: boolean;
        private _widget;
        private selectedAxes;
        private pickedAxis;
        private axisIsPicked;
        constructor(widget?: BaseWidget);
        get widget(): ƒ.Node;
        get wasPicked(): boolean;
        releaseComponent(): void;
        pickWidget(_hits: ƒ.RayHit[]): ƒ.Node[];
        isValidSelection(): boolean;
        getSelectedAxes(): AXIS[];
        addAxisOf(_key: string): boolean;
        removeAxisOf(_key: string): void;
        isAxisSelectedViaKeyboard(): boolean;
        private getSelectedAxisBy;
    }
}
declare namespace Fudge {
    class DropdownHandler {
        private controller;
        constructor(_controller: Controller);
        getControlDropdown(): HTMLDivElement;
        getInteractionDropdown(): HTMLDivElement;
        private openDropdownControl;
        private openDropdownInteraction;
        private setInteractionMode;
        private setControlMode;
        private updateButtontext;
        private closeMenu;
    }
}
declare namespace Fudge {
    class MenuItemsCreator {
        static getNormalDisplayItem(_callback: ContextMenuCallback, normalsAreDisplayed: boolean): Electron.MenuItem;
        static getInvertFaceItem(_callback: ContextMenuCallback): Electron.MenuItem;
        static getBackfaceCullItem(_callback: ContextMenuCallback): Electron.MenuItem;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class Selector {
        private node;
        private cameraPivot;
        constructor(_node: ƒ.Node, _cameraPivot: ƒ.Vector3);
        selectVertices(_ray: ƒ.Ray, selection: number[]): boolean;
    }
}
declare namespace Fudge {
    abstract class BaseWidget extends ƒ.Node {
        protected abstract componentToAxisMap: Map<ƒ.Node, AXIS>;
        protected componentToOriginalColorMap: Map<ƒ.Node, ƒ.Color>;
        protected pickedComponent: ƒ.Node;
        getAxisFromWidgetComponent(_component: ƒ.Node): AXIS;
        abstract isHitWidgetComponent(_hits: ƒ.RayHit[]): {
            axis: AXIS;
            additionalNodes: ƒ.Node[];
        };
        releaseComponent(pickedComponent?: ƒ.Node): void;
        getComponentFromAxis(_axis: AXIS): ƒ.Node;
        updateWidget(_axis: AXIS): void;
        abstract changeColorOfComponent(component: ƒ.Node): void;
        removeUnselectedAxis(_axis: AXIS): void;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class RotationWidget extends BaseWidget {
        protected componentToAxisMap: Map<ƒ.Node, AXIS>;
        constructor(_name?: string, _transform?: ƒ.Matrix4x4);
        isHitWidgetComponent(_hits: ƒ.RayHit[]): {
            axis: AXIS;
            additionalNodes: ƒ.Node[];
        };
        changeColorOfComponent(component: ƒ.Node): void;
        private fillColorDict;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class ScalationWidget extends BaseWidget {
        protected componentToAxisMap: Map<ƒ.Node, AXIS>;
        constructor(_name?: string, _transform?: ƒ.Matrix4x4);
        isHitWidgetComponent(_hits: ƒ.RayHit[]): {
            axis: AXIS;
            additionalNodes: ƒ.Node[];
        };
        changeColorOfComponent(component: ƒ.Node): void;
        releaseComponent(pickedComponent?: ƒ.Node): void;
        private fillColorDict;
    }
}
declare namespace Fudge {
    class TranslationWidget extends BaseWidget {
        protected componentToAxisMap: Map<ƒ.Node, AXIS>;
        constructor(_name?: string, _transform?: ƒ.Matrix4x4);
        isHitWidgetComponent(_hits: ƒ.RayHit[]): {
            axis: AXIS;
            additionalNodes: ƒ.Node[];
        };
        releaseComponent(pickedComponent?: ƒ.Node): void;
        changeColorOfComponent(component: ƒ.Node): void;
        private fillColorDict;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class WidgetCircle extends ƒ.Node {
        constructor(_name: string, _color: ƒ.Color, _transform: ƒ.Matrix4x4);
    }
}
declare namespace Fudge {
    import ƒAid = FudgeAid;
    class WidgetPillar extends ƒAid.Node {
        constructor(_name: string, _color: ƒ.Color);
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
        static isBackfaceCullingEnabled: boolean;
        viewport: ƒ.Viewport;
        canvas: HTMLCanvasElement;
        graph: ƒ.Node;
        controller: Controller;
        node: ƒ.Node;
        content: HTMLDivElement;
        private orbitCamera;
        constructor(_container: GoldenLayout.Container, _state: Object);
        addEventListeners(): void;
        createUserInterface(): void;
        toggleBackfaceCulling(): void;
        protected getContextMenu: (_callback: ContextMenuCallback) => Electron.Menu;
        protected updateContextMenu: () => void;
        protected contextMenuCallback: (_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event) => void;
        private animate;
        private onmove;
        private onmouseup;
        private onmousedown;
        private handleKeyboard;
        private onkeydown;
        private onkeyup;
        private changeHeader;
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
        protected cleanup: () => void;
        private hndEvent;
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
