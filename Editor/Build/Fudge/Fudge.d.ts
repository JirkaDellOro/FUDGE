/// <reference types="../../../node_modules/electron/electron" />
/// <reference types="../../core/build/fudgecore" />
/// <reference types="../../GoldenLayout/golden-layout" />
/// <reference types="../../../userinterface/build/fudgeuserinterface" />
declare namespace Fudge {
    export type ContextMenuCallback = (menuItem: Electron.MenuItem, browserWindow: Electron.BrowserWindow, event: Electron.KeyboardEvent) => void;
    type Subclass<T> = {
        subclasses: T[];
        name: string;
    };
    export class ContextMenu {
        static appendCopyPaste(_menu: Electron.Menu): void;
        static getSubclassMenu<T extends Subclass<T>>(_id: CONTEXTMENU, _class: T, _callback: ContextMenuCallback): Electron.Menu;
    }
    export {};
}
declare namespace Fudge {
    enum CONTEXTMENU {
        ADD_NODE = 0,
        ACTIVATE_NODE = 1,
        DELETE_NODE = 2,
        ADD_COMPONENT = 3,
        DELETE_COMPONENT = 4,
        ADD_COMPONENT_SCRIPT = 5,
        EDIT = 6,
        CREATE_FOLDER = 7,
        CREATE_MESH = 8,
        CREATE_MATERIAL = 9,
        CREATE_GRAPH = 10,
        CREATE_ANIMATION = 11,
        CREATE_PARTICLE_EFFECT = 12,
        SYNC_INSTANCES = 13,
        REMOVE_COMPONENT = 14,
        ADD_JOINT = 15,
        DELETE_RESOURCE = 16,
        ORTHGRAPHIC_CAMERA = 17,
        RENDER_CONTINUOUSLY = 18,
        ADD_PROPERTY = 19,
        DELETE_PROPERTY = 20,
        CONVERT_ANIMATION = 21,
        ADD_PARTICLE_PROPERTY = 22,
        ADD_PARTICLE_FUNCTION = 23,
        ADD_PARTICLE_CONSTANT = 24,
        ADD_PARTICLE_CODE = 25,
        ADD_PARTICLE_TRANSFORMATION = 26,
        DELETE_PARTICLE_DATA = 27
    }
    enum MENU {
        QUIT = "quit",
        PROJECT_NEW = "projectNew",
        PROJECT_SAVE = "projectSave",
        PROJECT_LOAD = "projectLoad",
        DEVTOOLS_OPEN = "devtoolsOpen",
        PANEL_GRAPH_OPEN = "panelGraphOpen",
        PANEL_ANIMATION_OPEN = "panelAnimationOpen",
        PANEL_PROJECT_OPEN = "panelProjectOpen",
        PANEL_HELP_OPEN = "panelHelpOpen",
        PANEL_PARTICLE_SYSTEM_OPEN = "panelParticleSystemOpen",
        FULLSCREEN = "fullscreen"
    }
    enum PANEL {
        GRAPH = "PanelGraph",
        PROJECT = "PanelProject",
        HELP = "PanelHelp",
        ANIMATION = "PanelAnimation",
        PARTICLE_SYSTEM = "PanelParticleSystem"
    }
    enum VIEW {
        HIERARCHY = "ViewHierarchy",
        ANIMATION = "ViewAnimation",
        ANIMATION_SHEET = "ViewAnimationSheet",
        RENDER = "ViewRender",
        COMPONENTS = "ViewComponents",
        CAMERA = "ViewCamera",
        INTERNAL_TABLE = "ViewInternalTable",
        INTERNAL_FOLDER = "ViewInternalFolder",
        EXTERNAL = "ViewExternal",
        PROPERTIES = "ViewProperties",
        PREVIEW = "ViewPreview",
        SCRIPT = "ViewScript",
        PARTICLE_SYSTEM = "ViewParticleSystem"
    }
    enum TRANSFORM {
        TRANSLATE = "translate",
        ROTATE = "rotate",
        SCALE = "scale"
    }
    enum GIZMOS {
        TRANSFORM = "Transform",
        WIRE_MESH = "WireMesh"
    }
}
declare namespace Fudge {
    export enum MIME {
        TEXT = "text",
        AUDIO = "audio",
        IMAGE = "image",
        MESH = "mesh",
        GLTF = "gltf",
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
    enum EVENT_EDITOR {
        /** An entity gets created, is not dispatched so far */
        CREATE = "EDITOR_CREATE",
        /** An entity gets selected and it is necessary to switch contents in the views */
        SELECT = "EDITOR_SELECT",
        /** An entity gets modified structurally and it is necessary to update views */
        MODIFY = "EDITOR_MODIFY",
        /** Values of an entity change and it is necessary to update views */
        UPDATE = "EDITOR_UPDATE",
        /** An entity gets deleted */
        DELETE = "EDITOR_DELETE",
        /** A view or panel closes */
        CLOSE = "EDITOR_CLOSE",
        /** A view or panel opens */
        OPEN = "EDITOR_OPEN"
        /** A transform matrix gets adjusted interactively */ ,
        TRANSFORM = "EDITOR_TRANSFORM",
        /** An entity recieves focus and can be manipulated using the keyboard */
        FOCUS = "EDITOR_FOCUS"
    }
    interface EventDetail {
        view?: View;
        sender?: Panel | Page;
        node?: ƒ.Node;
        graph?: ƒ.Graph;
        resource?: ƒ.SerializableResource;
        mutable?: ƒ.Mutable;
        transform?: Object;
        data?: ƒ.General;
    }
    /**
     * Extension of CustomEvent that supports a detail field with the type EventDetail
     */
    class EditorEvent extends CustomEvent<EventDetail> {
        static dispatch(_target: EventTarget, _type: EVENT_EDITOR, _init: CustomEventInit<EventDetail>): void;
    }
}
declare namespace Fudge {
    let watcher: ƒ.General;
    function newProject(): Promise<void>;
    function saveProject(_new?: boolean): Promise<boolean>;
    function promptLoadProject(): Promise<URL>;
    function loadProject(_url: URL): Promise<void>;
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    const ipcRenderer: Electron.IpcRenderer;
    const remote: Electron.RemoteMainInterface;
    let project: Project;
    /**
     * The uppermost container for all panels controlling data flow between.
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class Page {
        static goldenLayoutModule: ƒ.General;
        static modeTransform: TRANSFORM;
        private static goldenLayout;
        private static panels;
        private static physics;
        static setDefaultProject(): void;
        static getLayout(): ResolvedLayoutConfig;
        static loadLayout(_layout: LayoutConfig): void;
        static setTransform(_mode: TRANSFORM): void;
        static getPhysics(_graph: ƒ.Graph): ƒ.Physics;
        private static start;
        private static setupGoldenLayout;
        private static add;
        private static find;
        private static generateID;
        private static setupPageListeners;
        /** Send custom copies of the given event to the panels */
        private static broadcast;
        private static hndKey;
        private static hndEvent;
        private static hndPanelCreated;
        private static loadProject;
        private static setupMainListeners;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    class Project extends ƒ.Mutable {
        #private;
        base: URL;
        name: string;
        fileIndex: string;
        fileInternal: string;
        fileInternalFolder: string;
        fileScript: string;
        fileSettings: string;
        fileStyles: string;
        private graphAutoView;
        constructor(_base: URL);
        get resourceFolder(): ResourceFolder;
        openDialog(): Promise<boolean>;
        hndChange: (_event: Event) => void;
        load(_htmlContent: string): Promise<void>;
        getProjectJSON(): string;
        getResourceFolderJSON(): string;
        getSettingsJSON(): string;
        getProjectCSS(): string;
        getProjectHTML(_title: string): string;
        getMutatorAttributeTypes(_mutator: ƒ.Mutator): ƒ.MutatorAttributeTypes;
        protected reduceMutator(_mutator: ƒ.Mutator): void;
        private getGraphs;
        private createProjectHTML;
        private settingsStringify;
        private stringifyHTML;
        private loadFonts;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    class ControllerAnimation {
        private static readonly PROPERTY_COLORS;
        private animation;
        private dom;
        private view;
        private sequences;
        constructor(_animation: ƒ.Animation, _dom: HTMLElement, _view: ViewAnimation);
        update(_mutator: ƒ.Mutator, _time?: number): void;
        updateSequence(_time: number, _element: ƒui.CustomElement, _add?: boolean): void;
        nextKey(_time: number, _direction: "forward" | "backward"): number;
        addProperty(_path: string[], _node: ƒ.Node, _time: number): void;
        deleteProperty(_element: HTMLElement): void;
        private getSelectedSequences;
        private deletePath;
        private hndEvent;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    /**
     * The view's state. During reconstruction, views receive a merged state object that combines the states of both their panel and the view itself.
     * Ensure unique property names to avoid conflicts.
     */
    type ViewState = ƒ.Serialization;
    /**
     * Base class for all [[View]]s to support generic functionality
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    abstract class View {
        #private;
        private static views;
        private static idCount;
        dom: HTMLElement;
        protected contextMenu: Electron.Menu;
        constructor(_container: ComponentContainer, _state: ViewState);
        static getViewSource(_event: DragEvent): View;
        private static registerViewForDragDrop;
        protected get id(): string;
        setTitle(_title: string): void;
        getDragDropSources(): Object[];
        dispatch(_type: EVENT_EDITOR, _init: CustomEventInit<EventDetail>): void;
        dispatchToParent(_type: EVENT_EDITOR, _init: CustomEventInit<EventDetail>): void;
        protected openContextMenu: (_event: Event) => void;
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        protected getState(): ViewState;
        protected hndDropCapture(_event: DragEvent, _source: View): void;
        protected hndDrop(_event: DragEvent, _source: View): void;
        protected hndDragOverCapture(_event: DragEvent, _source: View): void;
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
        constructor(_container: ComponentContainer, _state: ViewState);
        setProject(): void;
        getSelection(): DirectoryEntry[];
        getDragDropSources(): DirectoryEntry[];
        private hndEvent;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    abstract class ViewInternal extends View {
        static readonly gltfImportSettings: Record<string, boolean>;
    }
    /**
     * Displays the internal resources as a folder tree.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2020 | Jonas Plotzky, HFU, 2024
     */
    class ViewInternalFolder extends ViewInternal {
        private tree;
        constructor(_container: ComponentContainer, _state: ViewState);
        get controller(): ControllerTreeResource;
        get resourceFolder(): ResourceFolder;
        getSelection(): ƒ.SerializableResource[];
        getDragDropSources(): ƒ.SerializableResource[];
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): Promise<void>;
        protected openContextMenu: (_event: Event) => void;
        protected hndDragOver(_event: DragEvent, _viewSource: View): void;
        protected hndDrop(_event: DragEvent, _viewSource: View): Promise<void>;
        private hndKeyboardEvent;
        private hndOpen;
        private hndCreate;
        private hndDelete;
        private hndUpdate;
        private hndEvent;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    import ƒUi = FudgeUserInterface;
    class ControllerDetail extends ƒUi.Controller {
        constructor(_mutable: ƒ.Mutable, _domElement: HTMLElement);
        protected mutateOnInput: (_event: Event) => Promise<void>;
        private hndInsert;
        private hndKey;
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
        rename(_object: ƒ.SerializableResource, _new: string): Promise<boolean>;
        copy(_originals: ƒ.SerializableResource[]): Promise<ƒ.SerializableResource[]>;
        delete(_focussed: ƒ.SerializableResource[]): Promise<ƒ.SerializableResource[]>;
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
        rename(_object: ScriptInfo, _new: string): Promise<boolean>;
        delete(_focussed: ScriptInfo[]): Promise<ScriptInfo[]>;
        copy(_originals: ScriptInfo[]): Promise<ScriptInfo[]>;
        sort(_data: ScriptInfo[], _key: string, _direction: number): void;
    }
}
declare namespace Fudge {
    import ƒUi = FudgeUserInterface;
    class ControllerTreeDirectory extends ƒUi.TreeController<DirectoryEntry> {
        getLabel(_entry: DirectoryEntry): string;
        getAttributes(_object: DirectoryEntry): string;
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
    class ControllerTreeHierarchy extends ƒUi.CustomTreeController<ƒ.Node> {
        createContent(_object: ƒ.Node): HTMLFieldSetElement;
        getAttributes(_node: ƒ.Node): string;
        setValue(_node: ƒ.Node, _id: string, _new: string): Promise<boolean>;
        hasChildren(_node: ƒ.Node): boolean;
        getChildren(_node: ƒ.Node): ƒ.Node[];
        delete(_focussed: ƒ.Node[]): Promise<ƒ.Node[]>;
        addChildren(_children: ƒ.Node[], _target: ƒ.Node, _index?: number): ƒ.Node[];
        copy(_originals: ƒ.Node[]): Promise<ƒ.Node[]>;
        canDrop(_sources: ƒ.Node[], _target: ƒ.Node): boolean;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    class ControllerTreeParticleSystem extends ƒui.CustomTreeController<ƒ.ParticleData.Recursive> {
        childToParent: Map<ƒ.ParticleData.Recursive, ƒ.ParticleData.Recursive>;
        private data;
        private view;
        constructor(_data: ƒ.ParticleData.System, _view: ViewParticleSystem);
        createContent(_data: ƒ.ParticleData.Recursive): HTMLFieldSetElement;
        getAttributes(_data: ƒ.ParticleData.Recursive): string;
        setValue(_data: ƒ.ParticleData.Recursive, _id: string, _new: string): Promise<boolean>;
        hasChildren(_data: ƒ.ParticleData.Recursive): boolean;
        getChildren(_data: ƒ.ParticleData.Recursive): ƒ.ParticleData.Recursive[];
        delete(_focused: (ƒ.ParticleData.Recursive)[]): Promise<ƒ.ParticleData.Recursive[]>;
        addChildren(_children: ƒ.ParticleData.Recursive[], _target: ƒ.ParticleData.Recursive, _at?: number): ƒ.ParticleData.Recursive[];
        copy(_originals: ƒ.ParticleData.Recursive[]): Promise<ƒ.ParticleData.Recursive[]>;
        draggable(_target: ƒ.ParticleData.Recursive): boolean;
        generateNewVariableName(): string;
        private getKey;
        private deleteData;
        private renameVariable;
    }
}
declare namespace Fudge {
    import ƒui = FudgeUserInterface;
    type ResourceNode = ResourceFile | ResourceFolder;
    interface ResourceFile extends ƒ.SerializableResource {
        resourceParent?: ResourceFolder;
    }
    class ResourceFolder implements ƒ.Serializable {
        name: string;
        resourceParent: ResourceFolder;
        children: ResourceNode[];
        constructor(_name?: string);
        /**
         * Returns true if this or any of its descendants contain the given resource.
         */
        contains(_resource: ƒ.SerializableResource): boolean;
        serialize(): ƒ.Serialization;
        deserialize(_serialization: ƒ.Serialization): Promise<ƒ.Serializable>;
        [Symbol.iterator](): IterableIterator<ResourceNode>;
    }
    class ControllerTreeResource extends ƒui.CustomTreeController<ResourceNode> {
        createContent(_object: ResourceNode): HTMLFieldSetElement;
        getAttributes(_object: ResourceNode): string;
        setValue(_node: ResourceNode, _id: string, _new: string): Promise<boolean>;
        hasChildren(_object: ResourceNode): boolean;
        getChildren(_object: ResourceNode): ResourceNode[];
        addChildren(_sources: ResourceNode[], _target: ResourceNode, _index?: number): ResourceNode[];
        delete(_focussed: ResourceNode[]): Promise<ResourceNode[]>;
        copy(_originals: ResourceNode[]): Promise<ResourceNode[]>;
        getPath(_resource: ResourceNode): ResourceNode[];
        remove(_resource: ResourceNode): void;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    /**
     * Base class for all [[Panel]]s aggregating [[View]]s
     * Subclasses are presets for common panels. A user might add or delete [[View]]s at runtime
     * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020 | Jonas Plotzky, HFU, 2024
     */
    abstract class Panel extends View {
        protected goldenLayout: GoldenLayout;
        protected views: View[];
        constructor(_container: ComponentContainer, _panelState: ViewState, _viewConstructors?: {
            [name: string]: new (...args: ƒ.General) => View;
        }, _rootItemConfig?: RowOrColumnItemConfig);
        /** Send custom copies of the given event to the views */
        broadcast: (_event: EditorEvent) => void;
        protected getState(): ViewState;
        private addViewComponent;
    }
}
declare namespace Fudge {
    /**
     * TODO: add
     * @authors Jonas Plotzky, HFU, 2022
     */
    class PanelAnimation extends Panel {
        constructor(_container: ComponentContainer, _state: ViewState);
        private hndEvent;
    }
}
declare namespace Fudge {
    /**
    * Shows a graph and offers means for manipulation
    * @authors Monika Galkewitsch, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
    */
    class PanelGraph extends Panel {
        #private;
        constructor(_container: ComponentContainer, _state: ViewState);
        protected getState(): ViewState;
        protected hndDrop(_event: DragEvent, _viewSource: View): void;
        private hndEvent;
        private storeNode;
        private restoreNode;
        private storeGraph;
        private restoreGraph;
    }
}
declare namespace Fudge {
    /**
    * Shows a help and documentation
    * @authors Jirka Dell'Oro-Friedl, HFU, 2021
    */
    class PanelHelp extends Panel {
        constructor(_container: ComponentContainer, _state: ViewState);
    }
}
declare namespace Fudge {
    /**
     * TODO: add
     * @authors Jonas Plotzky, HFU, 2022
     */
    class PanelParticleSystem extends Panel {
        constructor(_container: ComponentContainer, _state: ViewState);
        private hndEvent;
    }
}
declare namespace Fudge {
    /**
     * Display the project structure and offer functions for creation, deletion and adjustment of resources
     * @authors Jirka Dell'Oro-Friedl, HFU, 2020- 2023
     */
    class PanelProject extends Panel {
        constructor(_container: ComponentContainer, _state: ViewState);
        private hndEvent;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    /**
     * View and edit a particle system attached to a node.
     * @authors Jonas Plotzky, HFU, 2022
     */
    class ViewParticleSystem extends View {
        static readonly PROPERTY_KEYS: (keyof ƒ.ParticleData.System)[];
        private cmpParticleSystem;
        private particleSystem;
        private data;
        private toolbar;
        private toolbarIntervalId;
        private timeScalePlay;
        private tree;
        private controller;
        private errors;
        private variables;
        constructor(_container: ComponentContainer, _state: ViewState);
        protected openContextMenu: (_event: Event) => void;
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): Promise<void>;
        protected hndDragOver(_event: DragEvent, _viewSource: View): void;
        protected hndDrop(_event: DragEvent, _viewSource: View): void;
        private hndEvent;
        private createToolbar;
        private setTime;
        private setTimeScale;
        private setParticleSystem;
        private validateData;
        private enableSave;
        private refreshVariables;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    /**
     * View and edit the animatable properties of a node with an attached component animation.
     * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022 | Jirka Dell'Oro-Friedl, HFU, 2023
     */
    class ViewAnimation extends View {
        keySelected: ƒ.AnimationKey;
        private node;
        private cmpAnimator;
        private animation;
        private playbackTime;
        private propertyList;
        private controller;
        private toolbar;
        private frameInput;
        private time;
        private idInterval;
        constructor(_container: ComponentContainer, _state: ViewState);
        protected hndDragOver(_event: DragEvent, _viewSource: View): void;
        protected hndDrop(_event: DragEvent, _viewSource: View): void;
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        private getNodeSubmenu;
        private getMutatorSubmenu;
        private createToolbar;
        private hndEvent;
        private setAnimation;
        private createPropertyList;
        private animate;
        private hndToolbarClick;
        private pause;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    interface ViewAnimationSequence {
        data: ƒ.AnimationSequence;
        color: string;
    }
    /**
     * View and edit animation sequences, animation keys and curves connecting them.
     * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
     */
    class ViewAnimationSheet extends View {
        #private;
        private static readonly KEY_SIZE;
        private static readonly TIMELINE_HEIGHT;
        private static readonly EVENTS_HEIGHT;
        private static readonly SCALE_WIDTH;
        private static readonly PIXEL_PER_MILLISECOND;
        private static readonly PIXEL_PER_VALUE;
        private static readonly MINIMUM_PIXEL_PER_STEP;
        private static readonly STANDARD_ANIMATION_LENGTH;
        private animation;
        private playbackTime;
        private canvas;
        private crc2;
        private eventInput;
        private scrollContainer;
        private scrollBody;
        private mtxWorldToScreen;
        private selectedKey;
        private selectedEvent;
        private keys;
        private sequences;
        private events;
        private slopeHooks;
        private documentStyle;
        private posPanStart;
        private posRightClick;
        constructor(_container: ComponentContainer, _state: ViewState);
        private get mode();
        private set mode(value);
        protected openContextMenuSheet: (_event: Event) => void;
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        private draw;
        private generateKeys;
        private generateKey;
        private drawTimeline;
        private drawEvents;
        private drawScale;
        private drawCurves;
        private drawKeys;
        private drawCursor;
        private drawHighlight;
        private hndEvent;
        private hndPointerDown;
        private hndPointerMoveTimeline;
        private hndPointerMoveSlope;
        private hndPointerMovePan;
        private hndPointerMoveDragKey;
        private hndPointerMoveDragEvent;
        private hndPointerUp;
        private hndWheel;
        private hndScroll;
        private animate;
        private resetView;
        private screenToWorldPoint;
        private worldToScreenPoint;
        private screenToTime;
        private timeToScreen;
        private round;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    /**
     * View all components attached to a node
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewComponents extends View {
        private node;
        private expanded;
        private selected;
        private drag;
        constructor(_container: ComponentContainer, _state: ViewState);
        getDragDropSources(): ƒ.ComponentCamera[];
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        protected hndDragOver(_event: DragEvent, _viewSource: View): void;
        protected hndDrop(_event: DragEvent, _viewSource: View): void;
        private protectGraphInstance;
        private fillContent;
        private hndEvent;
        private hndTransform;
        private transform3;
        private transform2;
        private select;
        private getSelected;
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
        private selectionPrevious;
        constructor(_container: ComponentContainer, _state: ViewState);
        private get selection();
        setGraph(_graph: ƒ.Graph): void;
        getDragDropSources(): ƒ.Node[];
        protected hndDragOverCapture(_event: DragEvent, _viewSource: View): void;
        protected hndDropCapture(_event: DragEvent, _viewSource: View): Promise<void>;
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        protected getState(): ViewState;
        private hndTreeEvent;
        private hndEvent;
        private storeExpanded;
        private restoreExpanded;
        private getExpanded;
        private expand;
    }
}
declare namespace Fudge {
    /**
     * View the rendering of a graph in a viewport with an independent camera
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewRender extends View {
        #private;
        private cmrOrbit;
        private viewport;
        private canvas;
        private graph;
        private node;
        private nodeLight;
        private redrawId;
        constructor(_container: ComponentContainer, _state: ViewState);
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        protected openContextMenu: (_event: Event) => void;
        protected hndDragOver(_event: DragEvent, _viewSource: View): void;
        protected hndDrop(_event: DragEvent, _viewSource: View): void;
        private createUserInterface;
        private setGraph;
        private setCameraOrthographic;
        private hndPrepare;
        private hndEvent;
        private hndPick;
        private hndPointer;
        private activeViewport;
        private redraw;
        private setRenderContinously;
        private drawTranslation;
        private drawMesh;
    }
}
declare namespace Fudge {
    import ƒ = FudgeCore;
    let typesOfResources: ƒ.General[];
    /**
     * List the internal resources
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewInternalTable extends ViewInternal {
        private table;
        constructor(_container: ComponentContainer, _state: ViewState);
        listResources(): void;
        getSelection(): ƒ.SerializableResource[];
        getDragDropSources(): ƒ.SerializableResource[];
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): Promise<void>;
        protected hndDragOver(_event: DragEvent, _viewSource: View): void;
        protected hndDrop(_event: DragEvent, _viewSource: View): Promise<void>;
        private hndKeyboardEvent;
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
        private cmrOrbit;
        private previewNode;
        private mtxImage;
        private timeoutDefer;
        constructor(_container: ComponentContainer, _state: ViewState);
        private static createStandardMaterial;
        private static createStandardMesh;
        protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu;
        protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void;
        private hndMouse;
        private setTransform;
        private fillContent;
        private createStandardGraph;
        private setViewObject;
        private illuminate;
        private createFilePreview;
        private createTextPreview;
        private createImagePreview;
        private createAudioPreview;
        private createScriptPreview;
        private hndEvent;
        private resetCamera;
        private redraw;
        private defer;
    }
}
declare namespace Fudge {
    /**
     * View the properties of a resource
     * @author Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class ViewProperties extends View {
        private resource;
        constructor(_container: ComponentContainer, _state: ViewState);
        private fillContent;
        private hndEvent;
    }
}
declare namespace Fudge {
    /**
     * List the scripts loaded
     * @author Jirka Dell'Oro-Friedl, HFU, 2020-23
     */
    class ViewScript extends View {
        private table;
        constructor(_container: ComponentContainer, _state: ViewState);
        listScripts(): void;
        getSelection(): ScriptInfo[];
        getDragDropSources(): ScriptInfo[];
        private hndEvent;
    }
}
