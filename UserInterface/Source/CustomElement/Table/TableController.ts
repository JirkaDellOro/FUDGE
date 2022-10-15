namespace FudgeUserInterface {
  /**
   * Subclass this to create a broker between your data and a [[Table]] to display and manipulate it.
   * The [[Table]] doesn't know how your data is structured and how to handle it, the controller implements the methods needed
   */
  export abstract class TableController<T> {
    /** Stores references to selected objects. Override with a reference in outer scope, if selection should also operate outside of table */
    public selection: T[] = [];
    /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of table */
    public dragDrop: { sources: T[], target: T } = { sources: [], target: null };
    /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of table */
    public copyPaste: { sources: T[], target: T } = { sources: [], target: null };

    /** Retrieve a string to create a label for the table item representing the object (appears not to be called yet)  */
    public abstract getLabel(_object: T): string;

    /** Return false to disallow renaming the item/object, or processes the proposed new label (appears not to be called yet) */
    public abstract rename(_object: T, _new: string): boolean;

    public async delete(_focussed: T[]): Promise<T[]> { return _focussed; }

    /** 
     * Return a list of copies of the objects given for copy & paste
     * @param _focussed The object currently having focus
     */
    public abstract /* async */ copy(_originals: T[]): Promise<T[]>;

    /** 
     * Return a list of TABLE-objects describing the head-titles and according properties
     */
    public abstract getHead(): TABLE[];

    /**
     * Sort data by given key and direction
     */
    public abstract sort(_data: T[], _key: string, _direction: number): void;
  }
}
