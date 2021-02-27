namespace Fudge {




  export enum CONTEXTMENU {
    // SKETCH = ViewSketch,
    ADD_NODE,
    ADD_COMPONENT,
    ADD_COMPONENT_SCRIPT,
    DELETE_NODE,
    EDIT,
    CREATE,
    CREATE_MESH,
    CREATE_MATERIAL,
    CREATE_GRAPH
  }

  export enum MENU {
    QUIT = "quit",
    PROJECT_SAVE = "projectSave",
    PROJECT_LOAD = "projectLoad",
    DEVTOOLS_OPEN = "devtoolsOpen",
    PANEL_GRAPH_OPEN = "panelGraphOpen",
    PANEL_ANIMATION_OPEN = "panelAnimationOpen",
    PANEL_PROJECT_OPEN = "panelProjectOpen",
    FULLSCREEN = "fullscreen",
    PANEL_MODELLER_OPEN = "panelModellerOpen"

        /* obsolete ?
    NODE_DELETE = "nodeDelete",
    NODE_UPDATE = "nodeUpdate", 
    */
  }


  export enum EVENT_EDITOR {
    SET_GRAPH = "setGraph",
    FOCUS_NODE = "focusNode",
    SET_PROJECT = "setProject",
    UPDATE = "update",
    DESTROY = "destroy"

    /* obsolete ?
    REMOVE = "removeNode",
    HIDE = "hideNode",
    ACTIVATE_VIEWPORT = "activateViewport",
    */
  }

  export enum PANEL {
    GRAPH = "PanelGraph",
    PROJECT = "PanelProject",
    MODELLER = "PanelModeller"
  }


  export enum VIEW {
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
    // PROJECT = ViewProject,
    SCRIPT = "ViewScript"
    
    // SKETCH = ViewSketch,
    // MESH = ViewMesh,
  }


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
    SELECTION_UPDATE = "selectionupdate",
    HEADER_UPDATE = "headerupdate"
  }

  export enum MODELLER_MENU {
    DISPLAY_NORMALS,
    INVERT_FACE,
    REMOVE_FACE,
    TOGGLE_BACKFACE_CULLING
  }

  export enum ELECTRON_KEYS {
    CTRL = "CommandOrControl",
    SHIFT = "Shift",
    ALT = "Alt",
    ALTGR = "AltGr",
    SUPER = "Super"
  }
}