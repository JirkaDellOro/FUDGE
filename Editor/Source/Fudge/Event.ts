namespace Fudge {
  export enum EVENT_EDITOR {
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
    /** A transform matrix gets adjusted interactively */,
    TRANSFORM = "EDITOR_TRANSFORM",
    /** An entity recieves focus and can be manipulated using the keyboard */
    FOCUS = "EDITOR_FOCUS"
  }

  export interface EventDetail {
    view?: View;
    sender?: Panel | Page;
    node?: ƒ.Node;
    graph?: ƒ.Graph;
    resource?: ƒ.SerializableResource;
    mutable?: ƒ.Mutable;
    transform?: Object;
    data?: ƒ.General;
    // path?: View[];
  }

  /**
   * Extension of CustomEvent that supports a detail field with the type EventDetail
   */
  export class EditorEvent extends CustomEvent<EventDetail> {
    public static dispatch(_target: EventTarget, _type: EVENT_EDITOR, _init: CustomEventInit<EventDetail>): void {
      _target.dispatchEvent(new EditorEvent(_type, _init));
    }
  }
}