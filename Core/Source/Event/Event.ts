namespace FudgeCore {
  export interface MapEventTypeToListener {
    [eventType: string]: EventListenerUnified[];
  }

  /**
   * Types of events specific to FUDGE, in addition to the standard DOM/Browser-Types and custom strings
   */
  export const enum EVENT {
    /** dispatched to targets registered at {@link Loop}, when requested animation frame starts */
    LOOP_FRAME = "loopFrame",
    /** dispatched to a {@link Component} when its being added to a {@link Node} */
    COMPONENT_ADD = "componentAdd",
    /** dispatched to a {@link Component} when its being removed from a {@link Node} */
    COMPONENT_REMOVE = "componentRemove",
    /** dispatched to a {@link Component} when its being activated */
    COMPONENT_ACTIVATE = "componentActivate",
    /** dispatched to a {@link Component} when its being deactivated */
    COMPONENT_DEACTIVATE = "componentDeactivate",
    /** dispatched to a {@link Node}, it's successors and ancestors when its being activated */
    NODE_ACTIVATE = "nodeActivate",
    /** dispatched to a {@link Node}, it's successors and ancestors when its being deactivated */
    NODE_DEACTIVATE = "nodeDeactivate",
    /** dispatched to a child {@link Node} and its ancestors after it was appended to a parent */
    CHILD_APPEND = "childAppend",
    /** dispatched to a child {@link Node} and its ancestors just before its being removed from its parent */
    CHILD_REMOVE = "childRemove",
    /** dispatched to a {@link Mutable} when it mutates */
    MUTATE = "mutate",
    /** dispatched by a {@link Graph} when it mutates, {@link GraphInstance}s connected to the graph listen */
    MUTATE_GRAPH = "mutateGraph",
    /** dispatched by a {@link GraphInstance} when it reflected the mutation of the {@link Graph} it's connected to */
    MUTATE_INSTANCE = "mutateGraphDone",
    /** dispatched to {@link Viewport} when it gets the focus to receive keyboard input */
    FOCUS_IN = "focusin",
    /** dispatched to {@link Viewport} when it loses the focus to receive keyboard input */
    FOCUS_OUT = "focusout",
    /** dispatched to {@link Node} when it's done serializing */
    NODE_SERIALIZED = "nodeSerialized",
    /** dispatched to {@link Node} and all its {@link Component}s when it's done deserializing, so all components, children and attributes are available */
    NODE_DESERIALIZED = "nodeDeserialized",
    /** dispatched to {@link GraphInstance} when it's content is set according to a serialization of a {@link Graph}  */
    GRAPH_INSTANTIATED = "graphInstantiated",
    /** dispatched to a {@link Graph} when it's finished deserializing  */
    GRAPH_DESERIALIZED = "graphDeserialized",
    /** dispatched to {@link Time} when it's scaling changed  */
    TIME_SCALED = "timeScaled",
    /** dispatched to {@link FileIoBrowserLocal} when a list of files has been loaded  */
    FILE_LOADED = "fileLoaded",
    /** dispatched to {@link FileIoBrowserLocal} when a list of files has been saved */
    FILE_SAVED = "fileSaved",
    /** dispatched to {@link Node} when recalculating transforms for render */
    RENDER_PREPARE = "renderPrepare",
    /** dispatched to {@link Viewport} and {@link Node} when recalculation of the branch to render starts. */
    RENDER_PREPARE_START = "renderPrepareStart",
    /** dispatched to {@link Viewport} and {@link Node} when recalculation of the branch to render ends. The branch dispatches before the lights are transmitted to the shaders  */
    RENDER_PREPARE_END = "renderPrepareEnd",
    /** dispatched to {@link Joint}-Components in order to disconnect */
    DISCONNECT_JOINT = "disconnectJoint",
    /** dispatched to {@link Node} when it gets attached to a viewport for rendering */
    ATTACH_BRANCH = "attachBranch",
    /** dispatched to {@link Project} when it's done loading resources from a url */
    RESOURCES_LOADED = "resourcesLoaded"
  }

  /** Union type of other event types serving as annotation for listeners and handlers */
  export type EventUnified = Event | CustomEvent | EventPhysics;

  /** Unified listener type extending EventListener and EventListenerObject for CustomEvent and others */
  export type EventListenerUnified =
    ((_event: Event) => void) |
    ((_event: CustomEvent) => void) |
    ((_event: EventPhysics) => void) |
    ((_event: EventTimer) => void) |
    EventListener |
    EventListenerOrEventListenerObject;

  /** Extends EventTarget to work with {@link EventListenerUnified} and {@link EventUnified} */
  export class EventTargetUnified extends EventTarget {
    addEventListener(_type: string, _handler: EventListenerUnified, _options?: boolean | AddEventListenerOptions): void {
      super.addEventListener(_type, <EventListenerOrEventListenerObject>_handler, _options);
    }
    removeEventListener(_type: string, _handler: EventListenerUnified, _options?: boolean | AddEventListenerOptions): void {
      super.removeEventListener(_type, <EventListenerOrEventListenerObject>_handler, _options);
    }

    dispatchEvent(_event: EventUnified): boolean {
      return super.dispatchEvent(_event);
    }
  }

  /**
   * Base class for EventTarget singletons, which are fixed entities in the structure of FUDGE, such as the core loop 
   */
  export class EventTargetStatic extends EventTargetUnified {
    protected static targetStatic: EventTargetStatic = new EventTargetStatic();

    protected constructor() {
      super();
    }

    public static addEventListener(_type: string, _handler: EventListener): void {
      EventTargetStatic.targetStatic.addEventListener(_type, _handler);
    }
    public static removeEventListener(_type: string, _handler: EventListener): void {
      EventTargetStatic.targetStatic.removeEventListener(_type, _handler);
    }
    public static dispatchEvent(_event: Event): boolean {
      EventTargetStatic.targetStatic.dispatchEvent(_event);
      return true;
    }
  }
}