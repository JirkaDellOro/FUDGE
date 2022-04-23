declare namespace Fudge {
    enum CONTEXTMENU {
        ADD_NODE = 0,
        ACTIVATE_NODE = 1,
        DELETE_NODE = 2,
        ADD_COMPONENT = 3,
        DELETE_COMPONENT = 4,
        ADD_COMPONENT_SCRIPT = 5,
        EDIT = 6,
        CREATE_MESH = 7,
        CREATE_MATERIAL = 8,
        CREATE_GRAPH = 9,
        SYNC_INSTANCES = 10,
        REMOVE_COMPONENT = 11,
        ADD_JOINT = 12,
        DELETE_RESOURCE = 13,
        ILLUMINATE = 14
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
