namespace FudgeUserInterface {
  // export const enum EVENT_USERINTERFACE {
  //   SELECT = "select",
  //   UPDATE = "update",
  //   DROPMENUCLICK = "dropMenuClick",
  //   DROPMENUCOLLAPSE = "dropMenuCollapse",
  // }

  export const enum EVENT {
    CLICK = "click",
    DOUBLE_CLICK = "dblclick",
    KEY_DOWN = "keydown",
    DRAG_START = "dragstart",
    DRAG_OVER = "dragover",
    DROP = "drop",
    POINTER_UP = "pointerup",
    FOCUS_NEXT = "focusNext",
    FOCUS_PREVIOUS = "focusPrevious",
    FOCUS_IN = "focusin",
    FOCUS_OUT = "focusout",
    FOCUS_SET = "focusSet",
    CHANGE = "change",
    DELETE = "delete",
    RENAME = "rename",
    OPEN = "open",
    SELECT = "itemselect",
    UPDATE = "update",
    ESCAPE = "escape",
    COPY = "copy",
    CUT = "cut",
    PASTE = "paste",
    SORT = "sort",
    COLLAPSE = "collapse",
    CONTEXTMENU = "contextmenu"
  }
}