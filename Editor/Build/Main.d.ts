declare namespace Fudge {
    enum CONTEXTMENU {
        ADD_NODE = 0,
        ADD_COMPONENT = 1,
        ADD_COMPONENT_SCRIPT = 2,
        DELETE_NODE = 3,
        EDIT = 4,
        CREATE = 5,
        CREATE_MESH = 6,
        CREATE_MATERIAL = 7,
        CREATE_GRAPH = 8
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
        OBJECT_PROPERTIES = "ViewObjectProperties",
        SCRIPT = "ViewScript"
    }
    enum CONTROL_MODE {
        OBJECT_MODE = "Object-Mode",
        EDIT_MODE = "Edit-Mode"
    }
    enum INTERACTION_MODE {
        SELECT = "Box-Select",
        TRANSLATE = "Translate",
        ROTATE = "Rotate",
        SCALE = "Scale",
        EXTRUDE = "Extrude",
        IDLE = "Idle"
    }
    enum AXIS {
        X = "X",
        Y = "Y",
        Z = "Z"
    }
    enum MODELLER_EVENTS {
        HEADER_APPEND = "headerappend",
        SELECTION_UPDATE = "selectionupdate"
    }
    enum MODELLER_MENU {
        DISPLAY_NORMALS = 0,
        INVERT_FACE = 1,
        TOGGLE_BACKFACE_CULLING = 2
    }
}
/**
 * Main electron application running node. Starts the browser window to contain Fudge and sets up the main menu.
 * See subfolder Fudge for most of the other functionality
 */
declare namespace Main {
}
