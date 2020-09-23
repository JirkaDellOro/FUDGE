namespace Fudge {
  export enum CONTEXTMENU {
    ADD_NODE,
    ADD_COMPONENT
  }

  export enum MENU {
    QUIT = "quit",
    PROJECT_SAVE = "projectSave",
    PROJECT_OPEN = "projectOpen",
    NODE_DELETE = "nodeDelete",
    NODE_UPDATE = "nodeUpdate",
    DEVTOOLS_OPEN = "devtoolsOpen",
    PANEL_GRAPH_OPEN = "panelGraphOpen",
    PANEL_ANIMATION_OPEN = "panelAnimationOpen",
    PANEL_PROJECT_OPEN = "panelProjectOpen"
  }


  export enum EVENT_EDITOR {
    REMOVE = "removeNode",
    HIDE = "hideNode",
    ACTIVATE_VIEWPORT = "activateViewport",
    SET_GRAPH = "setGraph",
    FOCUS_NODE = "focusNode",
    SET_PROJECT = "setProject"
  }

  export enum PANEL {
    GRAPH = "PanelGraph",
    PROJECT = "PanelProject"
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
    PREVIEW = "ViewPreview"
    // PROJECT = ViewProject,
    // SKETCH = ViewSketch,
    // MESH = ViewMesh,
  }
}