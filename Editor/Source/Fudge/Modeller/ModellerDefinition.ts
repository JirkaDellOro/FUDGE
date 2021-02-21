namespace Fudge {
  export enum CONTROL_MODE {
    OBJECT_MODE = "Object-Mode",
    EDIT_MODE = "Edit-Mode"
  }

  export enum INTERACTION_MODE {
    SELECT = "Box-Select",
    TRANSLATE = "Translate",
    ROTATE = "Rotate",
    SCALE = "Scale",
    EXTRUDE = "Extrude",
    IDLE = "Idle"
  }

  export enum AXIS {
    X = "X",
    Y = "Y",
    Z = "Z"
  }

  export enum MODELLER_EVENTS {
    HEADER_APPEND = "headerappend",
    SELECTION_UPDATE = "selectionupdate"
  }

  export enum MODELLER_MENU {
    DISPLAY_NORMALS,
    INVERT_FACE,
    TOGGLE_BACKFACE_CULLING
  }

}
