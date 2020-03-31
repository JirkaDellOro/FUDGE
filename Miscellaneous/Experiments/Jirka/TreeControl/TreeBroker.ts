namespace TreeControl {
  /**
   * Subclass this to create a broker between your data and a [[Tree]] to display and manipulate it.
   * The [[Tree]] doesn't know how your data is structured and how to handle it, the broker implements the methods needed
   * // TODO: check if this could be achieved more elegantly using decorators
   */
  export abstract class TreeBroker<T> {
    public selection: Object[] = [];
    public dragDrop: {source: Object[], target: Object} = {source: [], target: null};
    
    public abstract getLabel(_object: T): string;
    public abstract hasChildren(_object: T): boolean;
    public abstract getChildren(_object: T): T[];
    public abstract rename(_object: T, _new: string): boolean;
    public abstract drop(_source: T[], _target: T): boolean;
  }
}