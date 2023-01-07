namespace Fudge {
  export enum EVENT_EDITOR {
    CREATE = "EDITOR_CREATE",
    SELECT = "EDITOR_SELECT",
    MODIFY = "EDITOR_MODIFY",
    DELETE = "EDITOR_DELETE",
    CLOSE = "EDITOR_CLOSE",
    TRANSFORM = "EDITOR_TRANSFORM",
    FOCUS = "EDITOR_FOCUS",
    ANIMATE = "EDITOR_ANIMATE"
  }

  export interface EventDetail {
    node?: ƒ.Node;
    graph?: ƒ.Graph;
    resource?: ƒ.SerializableResource;
    mutable?: ƒ.Mutable;
    transform?: Object;
    view?: View;
    data?: ƒ.General;
  }

  /**
   * Extension of CustomEvent that supports a detail field with the type EventDetail
   */
  export class EditorEvent extends CustomEvent<EventDetail> {
  }
}