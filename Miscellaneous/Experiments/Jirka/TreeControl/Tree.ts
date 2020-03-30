///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  import ƒ = FudgeCore;

  export enum TREE_CLASSES {
    SELECTED = "selected",
    INACTIVE = "inactive"
  }

  export enum EVENT_TREE {
    RENAME = "rename",
    OPEN = "open",
    FOCUS_NEXT = "focusNext",
    FOCUS_PREVIOUS = "focusPrevious",
    FOCUS_IN = "focusin",
    FOCUS_OUT = "focusout",
    DELETE = "delete",
    CHANGE = "change",
    DOUBLE_CLICK = "dblclick",
    KEY_DOWN = "keydown",
    DRAG_START = "dragstart",
    DRAG_OVER = "dragover",
    DROP = "drop",
    POINTER_UP = "pointerup",
    SELECT = "itemselect"
  }

  /**
   * Extension of li-element that represents an object in a [[TreeList]] with a checkbox and a textinput as content.
   * Additionally, it holds an instance of [[TreeList]] to display children of the corresponding object.
   */
  export class Tree<T> extends TreeItem {
    private proxy: TreeProxy<T>;

    constructor(_proxy: TreeProxy<T>, _root: T) {
      super(_root);
      this.proxy = _proxy;
    }
  }

  
  customElements.define("li-tree", Tree, { extends: "li" });
}