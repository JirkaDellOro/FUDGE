namespace FudgeUserInterface {
  /**
   * Subclass this to create a broker between your data and a {@link CustomTree} to display and manipulate it.
   * The {@link CustomTree} doesn't know how your data is structured and how to handle it, the controller implements the methods needed
   */
  export abstract class CustomTreeController<T> {
    /** Stores references to selected objects. Override with a reference in outer scope, if selection should also operate outside of tree */
    public selection: T[] = [];
    /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of tree */
    public dragDrop: { sources: T[]; target: T; at?: number } = { sources: [], target: null };
    /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of tree */
    public copyPaste: { sources: T[]; target: T } = { sources: [], target: null };

    /** Used by the tree to indicate the drop position while dragging */
    public dragDropIndicator: HTMLHRElement = document.createElement("hr");

    /**
     * Override if some objects should not be draggable
     */
    public draggable(_object: T): boolean {
      return true;
    }

    /**
     * Checks if two objects of are equal. Default is _a == _b. Override for more complex comparisons. 
     * Useful when the underlying data is volatile and changes identity while staying the same.
     */
    public equals(_a: T, _b: T): boolean {
      return _a == _b;
    }

    /**
     * Override if some objects should not be addable to others
     */
    public canAddChildren(_sources: T[], _target: T): boolean {
      return true;
    }

    /** Create an HTMLFormElement for the tree item representing the object */
    public abstract createContent(_object: T): HTMLFieldSetElement;

    /** Retrieve a space separated string of attributes to add to the list item representing the object for further styling  */
    public abstract getAttributes(_object: T): string;

    /** Process the proposed new value. The id of the html element on which the change occured is passed */
    public abstract setValue(_object: T, _id: string, _new: string): Promise<boolean>;

    /** Return true if the object has children that must be shown when unfolding the tree item */
    public abstract hasChildren(_object: T): boolean;

    /** Return the object's children to show when unfolding the tree item */
    public abstract getChildren(_object: T): T[];

    /** 
     * Process the list of source objects to be addedAsChildren when dropping or pasting onto the target item/object, 
     * return the list of objects that should visibly become the children of the target item/object 
     * @param _children A list of objects the tree tries to add to the _target
     * @param _target The object referenced by the item the drop occurs on
     */
    public abstract addChildren(_sources: T[], _target: T, _index?: number): T[];

    /** 
     * Remove the objects to be deleted, e.g. the current selection, from the data structure the tree refers to and 
     * return a list of those objects in order for the according {@link CustomTreeItem} to be deleted also   
     * @param _focussed The object currently having focus
     */
    public abstract delete(_focussed: T[]): Promise<T[]>;

    /** 
     * Return a list of copies of the objects given for copy & paste
     * @param _focussed The object currently having focus
     */
    public abstract /* async */ copy(_originals: T[]): Promise<T[]>;
  }
}
