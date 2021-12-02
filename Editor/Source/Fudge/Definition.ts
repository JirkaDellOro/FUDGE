namespace Fudge {
  export enum CONTEXTMENU {
    // SKETCH = ViewSketch,
    ADD_NODE,
    ADD_COMPONENT,
    ADD_COMPONENT_SCRIPT,
    EDIT,
    CREATE_MESH,
    CREATE_MATERIAL,
    CREATE_GRAPH,
    REMOVE_COMPONENT,
    ADD_JOINT,
    TRANSLATE,
    ROTATE,
    SCALE
  }


  export enum MENU {
    QUIT = "quit",
    PROJECT_NEW = "projectNew",
    PROJECT_SAVE = "projectSave",
    PROJECT_LOAD = "projectLoad",
    DEVTOOLS_OPEN = "devtoolsOpen",
    PANEL_GRAPH_OPEN = "panelGraphOpen",
    PANEL_ANIMATION_OPEN = "panelAnimationOpen",
    PANEL_PROJECT_OPEN = "panelProjectOpen",
    PANEL_HELP_OPEN = "panelHelpOpen",
    FULLSCREEN = "fullscreen"
  }


  export enum EVENT_EDITOR {
    SET_GRAPH = "setGraph",
    FOCUS_NODE = "focusNode",
    SET_PROJECT = "setProject",
    UPDATE = "update",
    REFRESH = "refresh",
    DESTROY = "destroy",
    CLEAR_PROJECT = "clearProject",
    TRANSFORM = "transform"
  }


  export enum PANEL {
    GRAPH = "PanelGraph",
    PROJECT = "PanelProject",
    HELP = "PanelHelp"
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
    SCRIPT = "ViewScript"
    
    // SKETCH = ViewSketch,
    // MESH = ViewMesh,
  }

  export enum TRANSFORM {
    TRANSLATE = "translate",
    ROTATE = "rotate",
    SCALE = "scale"
  }
}