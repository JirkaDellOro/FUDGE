/// <reference path="../../Core/Build/FudgeCore.d.ts" />
declare namespace FudgeUserInterface {
    class FoldableFieldSet extends HTMLFieldSetElement {
        constructor(_legend: string);
        private toggleFoldElement;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    abstract class CollapsableList extends HTMLUListElement {
        header: HTMLLIElement;
        content: HTMLElement;
        constructor();
        collapse(element: HTMLElement): void;
    }
    export class CollapsableNodeList extends CollapsableList {
        node: ƒ.Node;
        constructor(_node: ƒ.Node, _name: string, _unfolded?: boolean);
        selectNode: (_event: MouseEvent) => void;
        collapseEvent: (_event: MouseEvent) => void;
    }
    export class CollapsableAnimationList extends CollapsableList {
        mutator: ƒ.Mutator;
        name: string;
        index: ƒ.Mutator;
        constructor(_mutator: ƒ.Mutator, _name: string, _unfolded?: boolean);
        collapseEvent: (_event: MouseEvent) => void;
        buildContent(_mutator: ƒ.Mutator): void;
        getMutator(): ƒ.Mutator;
        setMutator(_mutator: ƒ.Mutator): void;
        getElementIndex(): ƒ.Mutator;
        private updateMutator;
    }
    export {};
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    class DropMenu extends HTMLDivElement {
        name: string;
        private content;
        private signature;
        constructor(_name: string, _contentList: ƒ.Mutator, params: {
            _parentSignature?: string;
            _text?: string;
        });
        private toggleFoldContent;
        private collapseMenu;
    }
}
declare namespace FudgeUserInterface {
    /**
     * <select><option>Hallo</option></select>
     */
    import ƒ = FudgeCore;
    class MultiLevelMenuManager {
        static buildFromSignature(_signature: string, _mutator?: ƒ.Mutator): ƒ.Mutator;
    }
}
declare namespace FudgeUserInterface {
    class Stepper extends HTMLInputElement {
        constructor(_label: string, params?: {
            min?: number;
            max?: number;
            step?: number;
            value?: number;
        });
    }
}
declare namespace FudgeUserInterface {
    class ToggleButton extends HTMLButtonElement {
        private toggleState;
        constructor(style: string);
        setToggleState(toggleState: boolean): void;
        getToggleState(): boolean;
        toggle(): void;
        private switchToggleState;
    }
}
declare namespace FudgeUserInterface {
    /**
    * Extension of ul-element that keeps a list of [[TreeItem]]s to represent a branch in a tree
    */
    class TreeList<T> extends HTMLUListElement {
        constructor(_items?: TreeItem<T>[]);
        /**
         * Opens the tree along the given path to show the objects the path includes
         * @param _path An array of objects starting with one being contained in this treelist and following the correct hierarchy of successors
         * @param _focus If true (default) the last object found in the tree gets the focus
         */
        show(_path: T[], _focus?: boolean): void;
        /**
         * Restructures the list to sync with the given list.
         * [[TreeItem]]s referencing the same object remain in the list, new items get added in the order of appearance, obsolete ones are deleted.
         * @param _tree A list to sync this with
         */
        restructure(_tree: TreeList<T>): void;
        /**
         * Returns the [[TreeItem]] of this list referencing the given object or null, if not found
         */
        findItem(_data: T): TreeItem<T>;
        /**
         * Adds the given [[TreeItem]]s at the end of this list
         */
        addItems(_items: TreeItem<T>[]): void;
        /**
         * Returns the content of this list as array of [[TreeItem]]s
         */
        getItems(): TreeItem<T>[];
        displaySelection(_data: T[]): void;
        selectInterval(_dataStart: T, _dataEnd: T): void;
        delete(_data: T[]): TreeItem<T>[];
        findOpen(_data: T): TreeItem<T>;
    }
}
declare namespace FudgeUserInterface {
    enum TREE_CLASS {
        SELECTED = "selected",
        INACTIVE = "inactive"
    }
    enum EVENT_TREE {
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
        SELECT = "itemselect",
        UPDATE = "update",
        ESCAPE = "escape",
        COPY = "copy",
        CUT = "cut",
        PASTE = "paste"
    }
    /**
     * Extension of [[TreeList]] that represents the root of a tree control
     * ```plaintext
     * tree <ul>
     * ├ treeItem <li>
     * ├ treeItem <li>
     * │ └ treeList <ul>
     * │   ├ treeItem <li>
     * │   └ treeItem <li>
     * └ treeItem <li>
     * ```
     */
    class Tree<T> extends TreeList<T> {
        broker: TreeBroker<T>;
        constructor(_broker: TreeBroker<T>, _root: T);
        /**
         * Clear the current selection
         */
        clearSelection(): void;
        private hndOpen;
        private createBranch;
        private hndRename;
        private hndSelect;
        private hndDrop;
        private addChildren;
        private hndDelete;
        private hndEscape;
        private hndCopyPaste;
    }
}
declare namespace FudgeUserInterface {
    /**
     * Subclass this to create a broker between your data and a [[Tree]] to display and manipulate it.
     * The [[Tree]] doesn't know how your data is structured and how to handle it, the broker implements the methods needed
     * // TODO: check if this could be achieved more elegantly using decorators
     */
    abstract class TreeBroker<T> {
        /** Stores references to selected objects. Override with a reference in outer scope, if selection should also operate outside of tree */
        selection: T[];
        /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of tree */
        dragDrop: {
            sources: T[];
            target: T;
        };
        /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of tree */
        copyPaste: {
            sources: T[];
            target: T;
        };
        /** Retrieve a string to create a label for the tree item representing the object  */
        abstract getLabel(_object: T): string;
        /** Return false to disallow renaming the item/object, or processes the proposed new label */
        abstract rename(_object: T, _new: string): boolean;
        /** Return true if the object has children that must be shown when unfolding the tree item */
        abstract hasChildren(_object: T): boolean;
        /** Return the object's children to show when unfolding the tree item */
        abstract getChildren(_object: T): T[];
        /**
         * Process the list of source objects to be addedAsChildren when dropping or pasting onto the target item/object,
         * return the list of objects that should visibly become the children of the target item/object
         * @param _children A list of objects the tree tries to add to the _target
         * @param _target The object referenced by the item the drop occurs on
         */
        abstract addChildren(_sources: T[], _target: T): T[];
        /**
         * Remove the objects to be deleted, e.g. the current selection, from the data structure the tree refers to and
         * return a list of those objects in order for the according [[TreeItems]] to be deleted also
         * @param _focussed The object currently having focus
         */
        abstract delete(_focussed: T): T[];
    }
}
declare namespace FudgeUserInterface {
    /**
     * Extension of li-element that represents an object in a [[TreeList]] with a checkbox and a textinput as content.
     * Additionally, may hold an instance of [[TreeList]] as branch to display children of the corresponding object.
     */
    class TreeItem<T> extends HTMLLIElement {
        display: string;
        classes: TREE_CLASS[];
        data: T;
        broker: TreeBroker<T>;
        private checkbox;
        private label;
        constructor(_broker: TreeBroker<T>, _data: T);
        /**
         * Returns true, when this item has a visible checkbox in front to open the subsequent branch
         */
        get hasChildren(): boolean;
        /**
         * Shows or hides the checkbox for opening the subsequent branch
         */
        set hasChildren(_has: boolean);
        /**
         * Set the label text to show
         */
        setLabel(_text: string): void;
        /**
         * Get the label text shown
         */
        getLabel(): string;
        /**
         * Tries to open the [[TreeList]] of children, by dispatching [[EVENT_TREE.OPEN]].
         * The user of the tree needs to add an event listener to the tree
         * in order to create that [[TreeList]] and add it as branch to this item
         * @param _open If false, the item will be closed
         */
        open(_open: boolean): void;
        /**
         * Returns a list of all data referenced by the items succeeding this
         */
        getOpenData(): T[];
        /**
         * Sets the branch of children of this item. The branch must be a previously compiled [[TreeList]]
         */
        setBranch(_branch: TreeList<T>): void;
        /**
         * Returns the branch of children of this item.
         */
        getBranch(): TreeList<T>;
        /**
         * Returns attaches or detaches the [[TREE_CLASS.SELECTED]] to this item
         */
        set selected(_on: boolean);
        /**
         * Returns true if the [[TREE_CLASSES.SELECTED]] is attached to this item
         */
        get selected(): boolean;
        /**
         * Dispatches the [[EVENT_TREE.SELECT]] event
         * @param _additive For multiple selection (+Ctrl)
         * @param _interval For selection over interval (+Shift)
         */
        select(_additive: boolean, _interval?: boolean): void;
        /**
         * Removes the branch of children from this item
         */
        private removeBranch;
        private create;
        private hndFocus;
        private hndKey;
        private startTypingLabel;
        private hndDblClick;
        private hndChange;
        private hndDragStart;
        private hndDragOver;
        private hndPointerUp;
        private hndUpdate;
    }
}
declare namespace FudgeUserInterface {
    const enum EVENT_USERINTERFACE {
        SELECT = "select",
        COLLAPSE = "collapse",
        UPDATE = "update",
        DROPMENUCLICK = "dropMenuClick",
        DROPMENUCOLLAPSE = "dropMenuCollapse"
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    class Generator {
        static createFromMutable(_mutable: ƒ.Mutable, _element: HTMLElement, _name?: string, _mutator?: ƒ.Mutator): void;
        static createFromMutator(_mutator: ƒ.Mutator, _mutatorTypes: ƒ.MutatorAttributeTypes, _parent: HTMLElement, _mutable: ƒ.Mutable): void;
        static createDropdown(_id: string, _content: Object, _value: string, _parent: HTMLElement, _cssClass?: string): HTMLSelectElement;
        static createFieldset(_legend: string, _parent: HTMLElement, _cssClass?: string): HTMLFieldSetElement;
        static createFoldableFieldset(_legend: string, _parent: HTMLElement): HTMLFieldSetElement;
        static createLabelElement(_id: string, _parent: HTMLElement, params?: {
            _value?: string;
            _cssClass?: string;
        }): HTMLElement;
        static createTextElement(_id: string, _parent: HTMLElement, params?: {
            _value?: string;
            _cssClass?: string;
        }): HTMLInputElement;
        static createCheckboxElement(_id: string, _value: boolean, _parent: HTMLElement, _cssClass?: string): HTMLInputElement;
        static createStepperElement(_id: string, _parent: HTMLElement, params?: {
            _value?: number;
            _min?: number;
            _max?: number;
            _cssClass?: string;
        }): HTMLSpanElement;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    abstract class Mutable {
        protected timeUpdate: number;
        protected root: HTMLElement;
        protected mutable: ƒ.Mutable;
        protected mutator: ƒ.Mutator;
        constructor(mutable: ƒ.Mutable);
        protected mutateOnInput: (_e: Event) => void;
        protected refresh: (_e: Event) => void;
        protected updateMutator(_mutable: ƒ.Mutable, _root: HTMLElement, _mutator?: ƒ.Mutator, _types?: ƒ.Mutator): ƒ.Mutator;
        protected update(_mutable: ƒ.Mutable, _root: HTMLElement): void;
    }
}
