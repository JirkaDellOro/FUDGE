declare namespace Fudge {
    enum CONTEXTMENU {
        ADD_NODE = 0,
        ADD_COMPONENT = 1,
        ADD_COMPONENT_SCRIPT = 2,
        DELETE_NODE = 3,
        EDIT = 4,
        CREATE = 5,
        CONTROL_MODE = 6,
        INTERACTION_MODE = 7
    }
    enum MENU {
        QUIT = "quit",
        PROJECT_SAVE = "projectSave",
        PROJECT_LOAD = "projectLoad",
        DEVTOOLS_OPEN = "devtoolsOpen",
        PANEL_GRAPH_OPEN = "panelGraphOpen",
        PANEL_ANIMATION_OPEN = "panelAnimationOpen",
        PANEL_PROJECT_OPEN = "panelProjectOpen",
        FULLSCREEN = "fullscreen",
        PANEL_MODELLER_OPEN = "panelModellerOpen"
    }
    enum EVENT_EDITOR {
        SET_GRAPH = "setGraph",
        FOCUS_NODE = "focusNode",
        SET_PROJECT = "setProject",
        UPDATE = "update",
        DESTROY = "destroy"
    }
    enum PANEL {
        GRAPH = "PanelGraph",
        PROJECT = "PanelProject",
        MODELLER = "PanelModeller"
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
        MODELLER = "ViewModeller",
        OBJECT_PROPERTIES = "ViewObjectProperties"
    }
}
/**
 * Main electron application running node. Starts the browser window to contain Fudge and sets up the main menu.
 * See subfolder Fudge for most of the other functionality
 */
declare namespace Main {
}
