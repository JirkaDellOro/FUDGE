namespace Fudge {
  export enum EVENT_EDITOR {
    CREATE = "EDITOR_CREATE",
    SELECT = "EDITOR_SELECT",
    MODIFY = "EDITOR_MODIFY",
    DELETE = "EDITOR_DELETE",
    CLOSE = "EDITOR_CLOSE",
    TRANSFORM = "EDITOR_TRANSFORM",
    FOCUS = "EDITOR_FOCUS"
    // SET_GRAPH = "setGraph",
    // FOCUS_NODE = "focusNode",
    // SET_PROJECT = "setProject",
    // UPDATE = "update",
    // REFRESH = "refresh",
    // DESTROY = "destroy",
    // CLEAR_PROJECT = "clearProject",
    // TRANSFORM = "transform",
    // SELECT_NODE = "selectNode"
  }

  export interface EventDetail {
    node?: ƒ.Node;
    graph?: ƒ.Graph;
    view?: View;
    resource?: ƒ.SerializableResource;
    transform?: Object;
  }

  export class FudgeEvent extends CustomEvent<EventDetail> {
  }
}