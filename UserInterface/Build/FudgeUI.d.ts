/// <reference path="../../Core/Build/FudgeCore.d.ts" />
declare namespace FudgeUserInterface {
    interface CustomElementAttributes {
        key: string;
        label?: string;
        [name: string]: string;
    }
    abstract class CustomElement extends HTMLElement {
        static tag: string;
        private static mapObjectToCustomElement;
        private static idCounter;
        protected initialized: boolean;
        constructor(_attributes?: CustomElementAttributes);
        get key(): string;
        static get nextId(): string;
        static register(_tag: string, _typeCustomElement: typeof CustomElement, _typeObject?: typeof Object): void;
        static map(_type: typeof Object, _typeCustomElement: typeof CustomElement): void;
        appendLabel(): HTMLLabelElement;
        abstract getMutatorValue(): Object;
        abstract setMutatorValue(_value: Object): void;
    }
}
declare namespace FudgeUserInterface {
    class CustomElementBoolean extends CustomElement {
        private static customElement;
        constructor(_attributes: CustomElementAttributes);
        connectedCallback(): void;
        getMutatorValue(): boolean;
        setMutatorValue(_value: boolean): void;
    }
}
declare namespace FudgeUserInterface {
    /**
     * Represents a single digit number to be used in groups to represent a multidigit value.
     * Is tabbable and in-/decreases previous sibling when flowing over/under.
     */
    class CustomElementDigit extends HTMLElement {
        private static customElement;
        protected initialized: boolean;
        constructor();
        connectedCallback(): void;
        set value(_value: number);
        get value(): number;
        add(_addend: number): void;
    }
}
declare namespace FudgeUserInterface {
    class CustomElementStepper extends CustomElement {
        private static customElement;
        value: number;
        params: string;
        constructor(_attributes?: CustomElementAttributes);
        connectedCallback(): void;
        activateInnerTabs(_on: boolean): void;
        openInput(_open: boolean): void;
        getMutatorValue(): number;
        setMutatorValue(_value: number): void;
        getMantissaAndExponent(): number[];
        toString(): string;
        private display;
        private hndKey;
        private hndWheel;
        private hndInput;
        private hndFocus;
        private changeDigitFocussed;
        private shiftFocus;
    }
}
declare namespace FudgeUserInterface {
    abstract class CustomElementTemplate extends CustomElement {
        private static fragment;
        constructor();
        static register(_tagName: string): void;
        connectedCallback(): void;
    }
}
declare namespace FudgeUserInterface {
    class CustomElementTextInput extends CustomElement {
        private static customElement;
        constructor(_attributes: CustomElementAttributes);
        connectedCallback(): void;
        getMutatorValue(): string;
        setMutatorValue(_value: string): void;
    }
}
declare namespace FudgeUserInterface {
    class FoldableFieldSet extends HTMLFieldSetElement {
        content: HTMLDivElement;
        private checkbox;
        constructor(_legend?: string);
        private open;
        private get isOpen();
        private hndFocus;
        private hndKey;
    }
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
        PASTE = "paste",
        FOCUS_SET = "focusSet"
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
        controller: TreeController<T>;
        constructor(_controller: TreeController<T>, _root: T);
        /**
         * Clear the current selection
         */
        clearSelection(): void;
        /**
         * Return the object in focus
         */
        getFocussed(): T;
        private hndOpen;
        private createBranch;
        private hndRename;
        private hndSelect;
        private hndDrop;
        private addChildren;
        private hndDelete;
        private hndEscape;
        private hndCopyPaste;
        private hndFocus;
    }
}
declare namespace FudgeUserInterface {
    /**
     * Subclass this to create a broker between your data and a [[Tree]] to display and manipulate it.
     * The [[Tree]] doesn't know how your data is structured and how to handle it, the controller implements the methods needed
     */
    abstract class TreeController<T> {
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
        abstract delete(_focussed: T[]): T[];
        /**
         * Return a list of copies of the objects given for copy & paste
         * @param _focussed The object currently having focus
         */
        abstract copy(_originals: T[]): T[];
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
        controller: TreeController<T>;
        private checkbox;
        private label;
        constructor(_controller: TreeController<T>, _data: T);
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
        DROPMENUCOLLAPSE = "dropMenuCollapse",
        CONTEXTMENU = "contextmenu"
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    class Generator {
        /**
         * Creates a userinterface for a [[FudgeCore.Mutable]]
         */
        static createMutable(_mutable: ƒ.Mutable, _name?: string): Mutable;
        static createFieldSetFromMutable(_mutable: ƒ.Mutable, _name?: string, _mutator?: ƒ.Mutator): FoldableFieldSet;
        static createMutatorElement(_key: string, _type: Object, _value: string): HTMLElement;
        static createDropdown(_name: string, _content: Object, _value: string, _parent: HTMLElement, _cssClass?: string): HTMLSelectElement;
        static createFoldableFieldset(_key: string): FoldableFieldSet;
        static createLabelElement(_name: string, _parent: HTMLElement, params?: {
            value?: string;
            cssClass?: string;
        }): HTMLLabelElement;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    class Mutable {
        ui: HTMLElement;
        protected timeUpdate: number;
        /** Refererence to the [[FudgeCore.Mutable]] this ui refers to */
        protected mutable: ƒ.Mutable;
        /** [[FudgeCore.Mutator]] used to convey data to and from the mutable*/
        protected mutator: ƒ.Mutator;
        constructor(_mutable: ƒ.Mutable, _ui: HTMLElement);
        protected mutateOnInput: (_event: Event) => void;
        protected refresh: (_event: Event) => void;
        protected updateMutator(_mutable: ƒ.Mutable, _ui: HTMLElement, _mutator?: ƒ.Mutator, _types?: ƒ.Mutator): ƒ.Mutator;
        protected updateUserInterface(_mutable: ƒ.Mutable, _ui: HTMLElement): void;
    }
}
