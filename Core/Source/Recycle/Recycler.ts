namespace FudgeCore {
  export interface Recycable {
    recycle(): void;
  }
  /**
   * Keeps a depot of objects that have been marked for reuse, sorted by type.  
   * Using {@link Recycler} reduces load on the carbage collector and thus supports smooth performance.
   * @author Jirka Dell'Oro-Friedl, HFU, 2021
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Recycler
   */
  export abstract class Recycler {
    private static depot: { [type: string]: Object[] } = {};

    /**
     * Fetches an object of the requested type from the depot, calls its recycle-method and returns it.
     * If the depot for that type is empty it returns a new object of the requested type
     * @param _T The class identifier of the desired object
     */
    public static get<T extends Recycable | RecycableArray<T>>(_T: new () => T): T {
      let key: string = _T.name;
      let instances: Object[] = Recycler.depot[key];
      if (instances && instances.length > 0) {
        let instance: T = <T>instances.pop();
        instance.recycle();
        return instance;
      }
      else
        return new _T();
    }

    /**
     * Returns a reference to an object of the requested type in the depot, but does not remove it there. 
     * If no object of the requested type was in the depot, one is created, stored and borrowed.
     * For short term usage of objects in a local scope, when there will be no other call to Recycler.get or .borrow!
     * @param _T The class identifier of the desired object
     */
    public static borrow<T extends Recycable>(_T: new () => T): T {
      let t: T;
      let key: string = _T.name;
      let instances: Object[] = Recycler.depot[key];
      if (!instances || instances.length == 0) {
        t = new _T();
        Recycler.store(t);
        return t;
      }
      let instance: T = <T>instances[0];
      instance.recycle();
      return instance;
    }

    /**
     * Stores the object in the depot for later recycling. Users are responsible for throwing in objects that are about to loose scope and are not referenced by any other
     * @param _instance
     */
    public static store(_instance: Object): void {
      let key: string = _instance.constructor.name;
      //Debug.log(key);
      let instances: Object[] = Recycler.depot[key] || [];
      instances.push(_instance);
      Recycler.depot[key] = instances;
      // Debug.log(`ObjectManager.depot[${key}]: ${ObjectManager.depot[key].length}`);
      //Debug.log(this.depot);
    }

    /**
     * Emptys the depot of a given type, leaving the objects for the garbage collector. May result in a short stall when many objects were in
     * @param _T
     */
    public static dump<T>(_T: new () => T): void {
      let key: string = _T.name;
      Recycler.depot[key] = [];
    }

    /**
     * Emptys all depots, leaving all objects to the garbage collector. May result in a short stall when many objects were in
     */
    public static dumpAll(): void {
      Recycler.depot = {};
    }
  }
}