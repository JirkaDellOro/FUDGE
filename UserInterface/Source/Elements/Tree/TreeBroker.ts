namespace FudgeUserInterface {
  /**
   * Subclass this to create a broker between your data and a [[Tree]] to display and manipulate it.
   * The [[Tree]] doesn't know how your data is structured and how to handle it, the broker implements the methods needed
   * // TODO: check if this could be achieved more elegantly using decorators
   */
  export abstract class TreeBroker<T> {
    /** Stores references to selected objects. Override with a reference in outer scope, if selection should also operate outside of tree */
    public selection: Object[] = [];
    /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of tree */
    public dragDrop: {sources: Object[], target: Object} = {sources: [], target: null};
    
    /** Retrieve a string to create a label for the tree item representing the object  */
    public abstract getLabel(_object: T): string;
    /** Return true if the object has children that must be shown when unfolding the tree item */
    public abstract hasChildren(_object: T): boolean;
    /** Return the object's children to show when unfolding the tree item */
    public abstract getChildren(_object: T): T[];
    /** Return false to disallow renaming the item/object, or processes the proposed new label */
    public abstract rename(_object: T, _new: string): boolean;
    /** Return false to disallow dropping drag-source-objects on the item/object, or processes these objects with the target object*/
    public abstract drop(_sources: T[], _target: T): boolean;
  }
}