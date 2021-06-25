namespace FudgeCore {
  export interface MapEventTypeToListener {
    [eventType: string]: EventListenerƒ[];
  }

  /**
   * Types of events specific to Fudge, in addition to the standard DOM/Browser-Types and custom strings
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
    /** dispatched to a child {@link Node} and its ancestors after it was appended to a parent */
    CHILD_APPEND = "childAppend",
    /** dispatched to a child {@link Node} and its ancestors just before its being removed from its parent */
    CHILD_REMOVE = "childRemove",
    /** dispatched to a {@link Mutable} when its being mutated */
    MUTATE = "mutate",
    /** dispatched to {@link Viewport} when it gets the focus to receive keyboard input */
    FOCUS_IN = "focusin",
    /** dispatched to {@link Viewport} when it loses the focus to receive keyboard input */
    FOCUS_OUT = "focusout",
    /** dispatched to {@link Node} when it's done serializing */
    NODE_SERIALIZED = "nodeSerialized",
    /** dispatched to {@link Node} when it's done deserializing, so all components, children and attributes are available */
    NODE_DESERIALIZED = "nodeDeserialized",
    /** dispatched to {@link GraphInstance} when it's content is set according to a serialization of a {@link Graph}  */
    GRAPH_INSTANTIATED = "graphInstantiated",
    /** dispatched to {@link Time} when it's scaling changed  */
    TIME_SCALED = "timeScaled",
    /** dispatched to {@link FileIoBrowserLocal} when a list of files has been loaded  */
    FILE_LOADED = "fileLoaded",
    /** dispatched to {@link FileIoBrowserLocal} when a list of files has been saved */
    FILE_SAVED = "fileSaved",
    /** dispatched to {@link Node} when recalculating transforms for render */
    RENDER_PREPARE = "renderPrepare",
    RENDER_PREPARE_START = "renderPrepareStart",
    RENDER_PREPARE_END = "renderPrepareEnd"
  }


  // export type Eventƒ = EventPointer | EventDragDrop | EventWheel | EventKeyboard | Event | EventPhysics;

  export type EventListenerƒ =
    ((_event: EventPointer) => void) |
    ((_event: EventDragDrop) => void) |
    ((_event: EventWheel) => void) |
    ((_event: EventKeyboard) => void) |
    ((_event: Eventƒ) => void) |
    ((_event: EventPhysics) => void) |
    ((_event: CustomEvent) => void) |
    EventListenerOrEventListenerObject;

  export type Eventƒ = EventPointer | EventDragDrop | EventWheel | EventKeyboard | Event | EventPhysics | CustomEvent;
  // export type EventListenerƒ = ((_event: Eventƒ) => void) | EventListener | EventListenerObject;

  export class EventTargetƒ extends EventTarget {
    addEventListener(_type: string, _handler: EventListenerƒ, _options?: boolean | AddEventListenerOptions): void {
      super.addEventListener(_type, <EventListenerOrEventListenerObject>_handler, _options);
    }
    removeEventListener(_type: string, _handler: EventListenerƒ, _options?: boolean | AddEventListenerOptions): void {
      super.removeEventListener(_type, <EventListenerOrEventListenerObject>_handler, _options);
    }

    dispatchEvent(_event: Eventƒ): boolean {
      return super.dispatchEvent(_event);
    }
  }

  /**
   * Base class for EventTarget singletons, which are fixed entities in the structure of Fudge, such as the core loop 
   */
  export class EventTargetStatic extends EventTargetƒ {
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