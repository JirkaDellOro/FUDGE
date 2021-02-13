namespace Fudge {
  export enum ControlMode {
    OBJECT_MODE = "Object-Mode",
    EDIT_MODE = "Edit-Mode"
  }

  export enum InteractionModes {
    SELECT = "Box-Select",
    TRANSLATE = "Translate",
    ROTATE = "Rotate",
    SCALE = "Scale",
    EXTRUDE = "Extrude",
    IDLE = "Idle"
  }

  export enum Axis {
    X = "X",
    Y = "Y",
    Z = "Z"
  }

  export enum ModellerEvents {
    HEADER_APPEND = "headerappend",
    SELECTION_UPDATE = "selectionupdate"
  }

  export enum ModellerMenu {
    DISPLAY_NORMALS,
    INVERT_FACE,
    TOGGLE_BACKFACE_CULLING
  }

}
