namespace FudgeUserInterface {
  /**
   * Subclass this to create a broker between your data and a [[Tree]] to display and manipulate it.
   * The [[Tree]] doesn't know how your data is structured and how to handle it, the controller implements the methods needed
   */
  export abstract class TreeController<T> {
    /** Stores references to selected objects. Override with a reference in outer scope, if selection should also operate outside of tree */
    public selection: T[] = [];
    /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of tree */
    public dragDrop: { sources: T[], target: T } = { sources: [], target: null };
    /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of tree */
    public copyPaste: { sources: T[], target: T } = { sources: [], target: null };

    /** Retrieve a string to create a label for the tree item representing the object  */
    public abstract getLabel(_object: T): string;

    /** Retrieve a space separated string of attributes to add to the list item representing the object for further styling  */
    public abstract getAttributes(_object: T): string;

    /** Return false to disallow renaming the item/object, or processes the proposed new label */
    public abstract rename(_object: T, _new: string): boolean;

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
    public abstract addChildren(_sources: T[], _target: T): T[];

    /** 
     * Remove the objects to be deleted, e.g. the current selection, from the data structure the tree refers to and 
     * return a list of those objects in order for the according [[TreeItems]] to be deleted also   
     * @param _focussed The object currently having focus
     */
    public abstract delete(_focussed: T[]): T[];

    /** 
     * Return a list of copies of the objects given for copy & paste
     * @param _focussed The object currently having focus
     */
    public abstract /* async */ copy(_originals: T[]): Promise<T[]>;

    // public abstract hndDragOver = (_event: DragEvent): void => {
    //   _event.stopPropagation();
    //   _event.preventDefault();
    //   this.dragDrop.target = (<TreeItem<T>>_event.currentTarget).data;
    //   console.log(_event.currentTarget);
    //   _event.dataTransfer.dropEffect = "move";
    // }
  }
}
