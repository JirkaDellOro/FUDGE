declare namespace Fudge {
    enum CONTEXTMENU {
        ADD_NODE = 0,
        ACTIVATE_NODE = 1,
        ADD_COMPONENT = 2,
        ADD_COMPONENT_SCRIPT = 3,
        EDIT = 4,
        CREATE_MESH = 5,
        CREATE_MATERIAL = 6,
        CREATE_GRAPH = 7,
        REMOVE_COMPONENT = 8,
        ADD_JOINT = 9,
        TRANSLATE = 10,
        ROTATE = 11,
        SCALE = 12
    }
    enum MENU {
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
    enum EVENT_EDITOR {
        SET_GRAPH = "setGraph",
        FOCUS_NODE = "focusNode",
        SET_PROJECT = "setProject",
        UPDATE = "update",
        REFRESH = "refresh",
        DESTROY = "destroy",
        CLEAR_PROJECT = "clearProject",
        TRANSFORM = "transform"
    }
    enum PANEL {
        GRAPH = "PanelGraph",
        PROJECT = "PanelProject",
        HELP = "PanelHelp"
    }
    enum VIEW {
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
    }
    enum TRANSFORM {
        TRANSLATE = "translate",
        ROTATE = "rotate",
        SCALE = "scale"
    }
}
/**
 * Main electron application running node. Starts the browser window to contain Fudge and sets up the main menu.
 * See subfolder Fudge for most of the other functionality
 */
declare namespace Main {
}
