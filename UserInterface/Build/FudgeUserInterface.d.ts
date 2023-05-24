/// <reference path="../../Core/Build/FudgeCore.d.ts" />
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    /**
     * Connects a [[Mutable]] to a DOM-Element and synchronizes that mutable with the mutator stored within.
     * Updates the mutable on interaction with the element and the element in time intervals.
     */
    class Controller {
        domElement: HTMLElement;
        protected timeUpdate: number;
        /** Refererence to the [[FudgeCore.Mutable]] this ui refers to */
        protected mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>;
        /** [[FudgeCore.Mutator]] used to convey data to and from the mutable*/
        protected mutator: ƒ.Mutator;
        /** [[FudgeCore.Mutator]] used to store the data types of the mutator attributes*/
        protected mutatorTypes: ƒ.Mutator;
        private idInterval;
        constructor(_mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>, _domElement: HTMLElement);
        /**
         * Recursive method taking an existing [[ƒ.Mutator]] as a template
         * and updating its values with those found in the given UI-domElement.
         */
        static updateMutator(_domElement: HTMLElement, _mutator: ƒ.Mutator): ƒ.Mutator;
        /**
         * Recursive method taking the a [[ƒ.Mutable]] as a template to create a [[ƒ.Mutator]] or update the given [[ƒ.Mutator]]
         * with the values in the given UI-domElement
         */
        static getMutator(_mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>, _domElement: HTMLElement, _mutator?: ƒ.Mutator, _types?: ƒ.Mutator): ƒ.Mutator;
        /**
         * Recursive method taking the [[ƒ.Mutator]] of a [[ƒ.Mutable]] and updating the UI-domElement accordingly.
         * If an additional [[ƒ.Mutator]] is passed, its values are used instead of those of the [[ƒ.Mutable]].
         */
        static updateUserInterface(_mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>, _domElement: HTMLElement, _mutator?: ƒ.Mutator): void;
        static findChildElementByKey(_domElement: HTMLElement, key: string): HTMLElement;
        getMutator(_mutator?: ƒ.Mutator, _types?: ƒ.Mutator): ƒ.Mutator;
        updateUserInterface(): void;
        setMutable(_mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>): void;
        getMutable(): ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>;
        startRefresh(): void;
        protected mutateOnInput: (_event: Event) => Promise<void>;
        protected rearrangeArray: (_event: Event) => Promise<void>;
        protected refresh: (_event: Event) => void;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    /**
     * Static class generating UI-domElements from the information found in [[ƒ.Mutable]]s and [[ƒ.Mutator]]s
     */
    class Generator {
        /**
         * Creates a [[Controller]] from a [[FudgeCore.Mutable]] with expandable details or a list
         */
        static createController(_mutable: ƒ.Mutable, _name?: string): Controller;
        /**
         * Create extendable details for the [[FudgeCore.Mutator]] or the [[FudgeCore.Mutable]]
         */
        static createDetailsFromMutable(_mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>, _name?: string, _mutator?: ƒ.Mutator): Details | DetailsArray;
        /**
         * Create a div-Elements containing the interface for the [[FudgeCore.Mutator]] or the [[FudgeCore.Mutable]]
         */
        static createInterfaceFromMutable(_mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>, _mutator?: ƒ.Mutator): HTMLDivElement;
        /**
         * Create a div-Element containing the interface for the [[FudgeCore.Mutator]]
         * Does not support nested mutators!
         */
        static createInterfaceFromMutator(_mutator: ƒ.Mutator | Object): HTMLDivElement;
        /**
         * Create a specific CustomElement for the given data, using _key as identification
         */
        static createMutatorElement(_key: string, _type: Object | string, _value: Object): HTMLElement;
        /**
         * TODO: refactor for enums
         */
        static createDropdown(_name: string, _content: Object, _value: string, _parent: HTMLElement, _cssClass?: string): HTMLSelectElement;
    }
}
declare namespace FudgeUserInterface {
    /**
     * Structure for the attributes to set in a CustomElement.
     * key (maybe rename to `name`) is mandatory and must match the key of a mutator if used in conjunction
     * label is recommended for labelled elements, key is used if not given.
     */
    interface CustomElementAttributes {
        key: string;
        label?: string;
        [name: string]: string;
    }
    /**
     * Handles the mapping of CustomElements to their HTML-Tags via customElement.define
     * and to the data types and [[FudgeCore.Mutable]]s they render an interface for.
     */
    abstract class CustomElement extends HTMLElement {
        static tag: string;
        private static mapObjectToCustomElement;
        private static idCounter;
        protected initialized: boolean;
        constructor(_attributes?: CustomElementAttributes);
        /**
         * Retrieve an id to use for children of this element, needed e.g. for standard interaction with the label
         */
        protected static get nextId(): string;
        /**
         * Register map the given element type to the given tag and the given type of data
         */
        static register(_tag: string, _typeCustomElement: typeof CustomElement, _typeObject?: typeof Object): void;
        /**
         * Retrieve the element representing the given data type (if registered)
         */
        static get(_type: string): typeof CustomElement;
        private static map;
        /**
         * Return the key (name) of the attribute this element represents
         */
        get key(): string;
        /**
         * Add a label-element as child to this element
         */
        appendLabel(): HTMLLabelElement;
        setLabel(_label: string): void;
        /**
         * Get the value of this element in a format compatible with [[FudgeCore.Mutator]]
         */
        abstract getMutatorValue(): Object;
        /**
         * Set the value of this element using a format compatible with [[FudgeCore.Mutator]]
         */
        setMutatorValue(_value: Object): void;
        /** Workaround reconnection of clone */
        cloneNode(_deep: boolean): Node;
    }
}
declare namespace FudgeUserInterface {
    /**
     * A standard checkbox with a label to it
     */
    class CustomElementBoolean extends CustomElement {
        private static customElement;
        constructor(_attributes: CustomElementAttributes);
        /**
         * Creates the content of the element when connected the first time
         */
        connectedCallback(): void;
        /**
         * Retrieves the status of the checkbox as boolean value
         */
        getMutatorValue(): boolean;
        /**
         * Sets the status of the checkbox
         */
        setMutatorValue(_value: boolean): void;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    /**
     * A color picker with a label to it and a slider for opacity
     */
    class CustomElementColor extends CustomElement {
        private static customElement;
        color: ƒ.Color;
        constructor(_attributes: CustomElementAttributes);
        /**
         * Creates the content of the element when connected the first time
         */
        connectedCallback(): void;
        /**
         * Retrieves the values of picker and slider as ƒ.Mutator
         */
        getMutatorValue(): ƒ.Mutator;
        /**
         * Sets the values of color picker and slider
         */
        setMutatorValue(_value: ƒ.Mutator): void;
        private hndKey;
        private hndWheel;
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
        set value(_value: number);
        get value(): number;
        connectedCallback(): void;
        add(_addend: number): void;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    /**
     * Creates a CustomElement from an HTML-Template-Tag
     */
    abstract class CustomElementTemplate extends CustomElement {
        private static fragment;
        constructor(_attributes?: CustomElementAttributes);
        /**
         * Browses through the templates in the current document and registers the one defining the given tagname.
         * To be called from a script tag implemented with the template in HTML.
         */
        static register(_tagName: string): void;
        /**
         * Get the value of this element in a format compatible with [[FudgeCore.Mutator]]
         */
        getMutatorValue(): ƒ.Mutator;
        setMutatorValue(_mutator: ƒ.Mutator): void;
        /**
         * When connected the first time, the element gets constructed as a deep clone of the template.
         */
        protected connectedCallback(): void;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    class CustomElementMatrix3x3 extends CustomElementTemplate {
        getMutatorValue(): ƒ.Mutator;
        setMutatorValue(_mutator: ƒ.Mutator): void;
        protected connectedCallback(): void;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    class CustomElementMatrix4x4 extends CustomElementTemplate {
        getMutatorValue(): Object;
        setMutatorValue(_mutator: ƒ.Mutator): void;
        protected connectedCallback(): void;
    }
}
declare namespace FudgeUserInterface {
    /**
     * A dropdown menu to display enums
     */
    class CustomElementSelect extends CustomElement {
        private static customElement;
        content: Object;
        constructor(_attributes: CustomElementAttributes, _content?: Object);
        /**
         * Creates the content of the element when connected the first time
         */
        connectedCallback(): void;
        /**
         * Retrieves the status of the checkbox as boolean value
         */
        getMutatorValue(): string | number;
        /**
         * Sets the status of the checkbox
         */
        setMutatorValue(_value: string): void;
    }
}
declare namespace FudgeUserInterface {
    /**
     * An interactive number stepper with exponential display and complex handling using keyboard and mouse
     */
    class CustomElementStepper extends CustomElement {
        private static customElement;
        value: number;
        constructor(_attributes?: CustomElementAttributes);
        /**
         * Creates the content of the element when connected the first time
         */
        connectedCallback(): void;
        /**
         * De-/Activates tabbing for the inner digits
         */
        activateInnerTabs(_on: boolean): void;
        /**
         * Opens/Closes a standard number input for typing the value at once
         */
        openInput(_open: boolean): void;
        /**
         * Retrieve the value of this
         */
        getMutatorValue(): number;
        /**
         * Sets its value and displays it
         */
        setMutatorValue(_value: number): void;
        /**
         * Retrieve mantissa and exponent separately as an array of two members
         */
        getMantissaAndExponent(): number[];
        /**
         * Retrieves this value as a string
         */
        toString(): string;
        /**
         * Displays this value by setting the contents of the digits and the exponent
         */
        private display;
        /**
         * Handle keyboard input on this element and its digits
         */
        private hndKey;
        private hndWheel;
        private hndInput;
        private hndFocus;
        private changeDigitFocussed;
        private shiftFocus;
    }
}
declare namespace FudgeUserInterface {
    /**
     * A standard text input field with a label to it.
     */
    class CustomElementTextInput extends CustomElement {
        private static customElement;
        constructor(_attributes: CustomElementAttributes);
        /**
         * Creates the content of the element when connected the first time
         */
        connectedCallback(): void;
        /**
         * Retrieves the content of the input element
         */
        getMutatorValue(): string;
        /**
         * Sets the content of the input element
         */
        setMutatorValue(_value: string): void;
    }
}
declare namespace FudgeUserInterface {
    class Details extends HTMLDetailsElement {
        content: HTMLDivElement;
        constructor(_legend: string, _type: string);
        get isExpanded(): boolean;
        setContent(_content: HTMLDivElement): void;
        expand(_expand: boolean): void;
        private hndToggle;
        private hndFocus;
        private hndKey;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    class DetailsArray extends Details {
        constructor(_legend: string);
        setContent(_content: HTMLDivElement): void;
        getMutator(): ƒ.Mutator;
        private addEventListeners;
        private rearrange;
        private setFocus;
        private hndDragStart;
        private hndDragOver;
        private hndDrop;
        private hndInsert;
        private hndKeySpecial;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    /**
     * Static class to display a modal or non-modal dialog with an interface for the given mutator.
     */
    class Dialog {
        static dom: HTMLDialogElement;
        /**
         * Prompt the dialog to the user with the given headline, call to action and labels for the cancel- and ok-button
         * Use `await` on call, to continue after the user has pressed one of the buttons.
         */
        static prompt(_data: ƒ.Mutable | ƒ.Mutator | Object, _modal?: boolean, _head?: string, _callToAction?: string, _ok?: string, _cancel?: string): Promise<boolean>;
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
    /**
     * Static class to display a modal warning.
     */
    class Warning {
        /**
         * Display a warning to the user with the given headline, warning text and ok butten text.
         */
        static display(_errors?: string[], _headline?: string, _warning?: string, _ok?: string): void;
    }
}
declare namespace FudgeUserInterface {
    /**
     * Extension of ul-element that keeps a list of {@link CustomTreeItem}s to represent a branch in a tree
     */
    class CustomTreeList<T> extends HTMLUListElement {
        controller: CustomTreeController<T>;
        constructor(_controller: CustomTreeController<T>, _items?: CustomTreeItem<T>[]);
        /**
         * Expands the tree along the given path to show the objects the path includes
         * @param _path An array of objects starting with one being contained in this treelist and following the correct hierarchy of successors
         * @param _focus If true (default) the last object found in the tree gets the focus
         */
        show(_path: T[], _focus?: boolean): void;
        /**
         * Restructures the list to sync with the given list.
         * {@link CustomTreeItem}s referencing the same object remain in the list, new items get added in the order of appearance, obsolete ones are deleted.
         * @param _tree A list to sync this with
         */
        restructure(_tree: CustomTreeList<T>): void;
        /**
         * Returns the {@link CustomTreeItem} of this list referencing the given object or null, if not found
         */
        findItem(_data: T): CustomTreeItem<T>;
        /**
         * Adds the given {@link CustomTreeItem}s at the end of this list
         */
        addItems(_items: CustomTreeItem<T>[]): void;
        /**
         * Returns the content of this list as array of {@link CustomTreeItem}s
         */
        getItems(): CustomTreeItem<T>[];
        displaySelection(_data: T[]): void;
        selectInterval(_dataStart: T, _dataEnd: T): void;
        delete(_data: T[]): CustomTreeItem<T>[];
        findVisible(_data: T): CustomTreeItem<T>;
        private hndDragOver;
    }
}
declare namespace FudgeUserInterface {
    /**
     * Extension of {@link CustomTreeList} that represents the root of a tree control
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
    class CustomTree<T> extends CustomTreeList<T> {
        constructor(_controller: CustomTreeController<T>, _root: T);
        /**
         * Clear the current selection
         */
        clearSelection(): void;
        /**
         * Return the object in focus
         */
        getFocussed(): T;
        private hndExpand;
        private createBranch;
        private hndRename;
        private hndSelect;
        private hndDrop;
        private hndDragLeave;
        private addChildren;
        private hndDelete;
        private hndEscape;
        private hndCopyPaste;
        private hndFocus;
    }
}
declare namespace FudgeUserInterface {
    /**
     * Subclass this to create a broker between your data and a {@link CustomTree} to display and manipulate it.
     * The {@link CustomTree} doesn't know how your data is structured and how to handle it, the controller implements the methods needed
     */
    abstract class CustomTreeController<T> {
        /** Stores references to selected objects. Override with a reference in outer scope, if selection should also operate outside of tree */
        selection: T[];
        /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of tree */
        dragDrop: {
            sources: T[];
            target: T;
            at?: number;
        };
        /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of tree */
        copyPaste: {
            sources: T[];
            target: T;
        };
        /** Used by the tree to indicate the drop position while dragging */
        dragDropDivider: HTMLHRElement;
        /** Create an HTMLFormElement for the tree item representing the object */
        abstract createContent(_object: T): HTMLFormElement;
        /** Retrieve a space separated string of attributes to add to the list item representing the object for further styling  */
        abstract getAttributes(_object: T): string;
        /** Process the proposed new name */
        abstract rename(_object: T, _id: string, _new: string): boolean;
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
        abstract addChildren(_sources: T[], _target: T, _at?: number): T[];
        /**
         * Remove the objects to be deleted, e.g. the current selection, from the data structure the tree refers to and
         * return a list of those objects in order for the according {@link CustomTreeItem} to be deleted also
         * @param _focussed The object currently having focus
         */
        abstract delete(_focussed: T[]): T[];
        /**
         * Return a list of copies of the objects given for copy & paste
         * @param _focussed The object currently having focus
         */
        abstract copy(_originals: T[]): Promise<T[]>;
        /**
         * Override if some objects should not be draggable
         */
        draggable(_object: T): boolean;
    }
}
declare namespace FudgeUserInterface {
    /**
     * Extension of li-element that represents an object in a {@link CustomTreeList} with a checkbox and an HTMLElement as content.
     * Additionally, may hold an instance of {@link CustomTreeList} as branch to display children of the corresponding object.
     */
    class CustomTreeItem<T> extends HTMLLIElement {
        #private;
        classes: CSS_CLASS[];
        data: T;
        controller: CustomTreeController<T>;
        private checkbox;
        constructor(_controller: CustomTreeController<T>, _data: T);
        /**
         * Returns true, when this item has a visible checkbox in front to expand the subsequent branch
         */
        get hasChildren(): boolean;
        /**
         * Shows or hides the checkbox for expanding the subsequent branch
         */
        set hasChildren(_has: boolean);
        /**
         * Returns true if the {@link CSS_CLASS.SELECTED} is attached to this item
         */
        get selected(): boolean;
        /**
         * Attaches or detaches the {@link CSS_CLASS.SELECTED} to this item
         */
        set selected(_on: boolean);
        /**
         * Returns the content representing the attached {@link data}
         */
        get content(): HTMLFormElement;
        /**
         * Set the content representing the attached {@link data}
         */
        set content(_content: HTMLFormElement);
        refreshAttributes(): void;
        refreshContent(): void;
        /**
         * Tries to expanding the {@link CustomTreeList} of children, by dispatching {@link EVENT.EXPAND}.
         * The user of the tree needs to add an event listener to the tree
         * in order to create that {@link CustomTreeList} and add it as branch to this item
         */
        expand(_expand: boolean): void;
        /**
         * Returns a list of all data referenced by the items succeeding this
         */
        getVisibleData(): T[];
        /**
         * Sets the branch of children of this item. The branch must be a previously compiled {@link CustomTreeList}
         */
        setBranch(_branch: CustomTreeList<T>): void;
        /**
         * Returns the branch of children of this item.
         */
        getBranch(): CustomTreeList<T>;
        /**
         * Dispatches the {@link EVENT.SELECT} event
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
        private startTypingInput;
        private hndDblClick;
        private hndChange;
        private hndDragStart;
        private hndDragEnter;
        private hndDragOver;
        private hndPointerUp;
        private hndRemove;
    }
}
declare namespace FudgeUserInterface {
    interface TABLE {
        label: string;
        key: string;
        editable: boolean;
        sortable: boolean;
    }
    /**
     * Manages a sortable table of data given as simple array of flat objects
     * ```plaintext
     * Key0  Key1 Key2
     * ```
     */
    class Table<T extends Object> extends HTMLTableElement {
        controller: TableController<T>;
        data: T[];
        icon: string;
        constructor(_controller: TableController<T>, _data: T[], _icon?: string);
        /**
         * Create the table
         */
        create(): void;
        /**
         * Clear the current selection
         */
        clearSelection(): void;
        /**
         * Return the object in focus
         */
        getFocussed(): T;
        selectInterval(_dataStart: T, _dataEnd: T): void;
        displaySelection(_data: T[]): void;
        private createHead;
        private getSortButtons;
        private hndSort;
        private hndSelect;
        private hndDelete;
        private hndEscape;
        private hndFocus;
    }
}
declare namespace FudgeUserInterface {
    /**
     * Subclass this to create a broker between your data and a [[Table]] to display and manipulate it.
     * The [[Table]] doesn't know how your data is structured and how to handle it, the controller implements the methods needed
     */
    abstract class TableController<T> {
        /** Stores references to selected objects. Override with a reference in outer scope, if selection should also operate outside of table */
        selection: T[];
        /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of table */
        dragDrop: {
            sources: T[];
            target: T;
        };
        /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of table */
        copyPaste: {
            sources: T[];
            target: T;
        };
        /** Retrieve a string to create a label for the table item representing the object (appears not to be called yet)  */
        abstract getLabel(_object: T): string;
        /** Return false to disallow renaming the item/object, or processes the proposed new label (appears not to be called yet) */
        abstract rename(_object: T, _new: string): boolean;
        delete(_focussed: T[]): Promise<T[]>;
        /**
         * Return a list of copies of the objects given for copy & paste
         * @param _focussed The object currently having focus
         */
        abstract copy(_originals: T[]): Promise<T[]>;
        /**
         * Return a list of TABLE-objects describing the head-titles and according properties
         */
        abstract getHead(): TABLE[];
        /**
         * Sort data by given key and direction
         */
        abstract sort(_data: T[], _key: string, _direction: number): void;
    }
}
declare namespace FudgeUserInterface {
    /**
     * Extension of tr-element that represents an object in a [[Table]]
     */
    class TableItem<T extends Object> extends HTMLTableRowElement {
        data: T;
        controller: TableController<T>;
        constructor(_controller: TableController<T>, _data: T);
        /**
         * Returns attaches or detaches the [[CSS_CLASS.SELECTED]] to this item
         */
        set selected(_on: boolean);
        /**
         * Returns true if the [[TREE_CLASSES.SELECTED]] is attached to this item
         */
        get selected(): boolean;
        /**
         * Dispatches the [[EVENT.SELECT]] event
         * @param _additive For multiple selection (+Ctrl)
         * @param _interval For selection over interval (+Shift)
         */
        select(_additive: boolean, _interval?: boolean): void;
        private create;
        private hndInputEvent;
        private hndChange;
        private hndKey;
        private hndDragStart;
        private hndDragOver;
        private hndPointerUp;
    }
}
declare namespace FudgeUserInterface {
    /**
    * Extension of ul-element that keeps a list of [[TreeItem]]s to represent a branch in a tree
    */
    class TreeList<T> extends HTMLUListElement {
        constructor(_items?: TreeItem<T>[]);
        /**
         * Expands the tree along the given path to show the objects the path includes
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
        findVisible(_data: T): TreeItem<T>;
    }
}
declare namespace FudgeUserInterface {
    enum CSS_CLASS {
        SELECTED = "selected",
        INACTIVE = "inactive"
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
        private hndExpand;
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
        /** Retrieve a space separated string of attributes to add to the list item representing the object for further styling  */
        abstract getAttributes(_object: T): string;
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
        abstract copy(_originals: T[]): Promise<T[]>;
    }
}
declare namespace FudgeUserInterface {
    /**
     * Extension of li-element that represents an object in a [[TreeList]] with a checkbox and a textinput as content.
     * Additionally, may hold an instance of [[TreeList]] as branch to display children of the corresponding object.
     */
    class TreeItem<T> extends HTMLLIElement {
        display: string;
        classes: CSS_CLASS[];
        data: T;
        controller: TreeController<T>;
        private checkbox;
        private label;
        constructor(_controller: TreeController<T>, _data: T);
        /**
         * Returns true, when this item has a visible checkbox in front to expand the subsequent branch
         */
        get hasChildren(): boolean;
        /**
         * Shows or hides the checkbox for expanding the subsequent branch
         */
        set hasChildren(_has: boolean);
        /**
         * Returns attaches or detaches the [[TREE_CLASS.SELECTED]] to this item
         */
        set selected(_on: boolean);
        /**
         * Returns true if the [[TREE_CLASSES.SELECTED]] is attached to this item
         */
        get selected(): boolean;
        /**
         * Set the label text to show
         */
        setLabel(_text: string): void;
        /**
         * Get the label text shown
         */
        getLabel(): string;
        /**
         * Get the label text shown
         */
        refreshAttributes(): void;
        /**
         * Tries to expanding the [[TreeList]] of children, by dispatching [[EVENT.EXPAND]].
         * The user of the tree needs to add an event listener to the tree
         * in order to create that [[TreeList]] and add it as branch to this item
         */
        expand(_expand: boolean): void;
        /**
         * Returns a list of all data referenced by the items succeeding this
         */
        getVisibleData(): T[];
        /**
         * Sets the branch of children of this item. The branch must be a previously compiled [[TreeList]]
         */
        setBranch(_branch: TreeList<T>): void;
        /**
         * Returns the branch of children of this item.
         */
        getBranch(): TreeList<T>;
        /**
         * Dispatches the [[EVENT.SELECT]] event
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
        private hndRemove;
    }
}
declare namespace FudgeUserInterface {
    const enum EVENT {
        CLICK = "click",
        DOUBLE_CLICK = "dblclick",
        KEY_DOWN = "keydown",
        DRAG_START = "dragstart",
        DRAG_ENTER = "dragenter",
        DRAG_OVER = "dragover",
        DRAG_LEAVE = "dragleave",
        DROP = "drop",
        POINTER_UP = "pointerup",
        WHEEL = "wheel",
        FOCUS_NEXT = "focusNext",
        FOCUS_PREVIOUS = "focusPrevious",
        FOCUS_IN = "focusin",
        FOCUS_OUT = "focusout",
        FOCUS_SET = "focusSet",
        BLUR = "blur",
        CHANGE = "change",
        DELETE = "delete",
        RENAME = "rename",
        SELECT = "itemselect",
        ESCAPE = "escape",
        COPY = "copy",
        CUT = "cut",
        PASTE = "paste",
        SORT = "sort",
        CONTEXTMENU = "contextmenu",
        MUTATE = "mutate",
        REMOVE_CHILD = "removeChild",
        COLLAPSE = "collapse",
        EXPAND = "expand",
        INPUT = "input",
        REARRANGE_ARRAY = "rearrangeArray",
        TOGGLE = "toggle",
        POINTER_MOVE = "pointermove",
        INSERT = "insert"
    }
}
