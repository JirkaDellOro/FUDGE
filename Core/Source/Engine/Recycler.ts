namespace FudgeCore {
    /**
     * Keeps a depot of objects that have been marked for reuse, sorted by type.  
     * Using [[Recycler]] reduces load on the carbage collector and thus supports smooth performance
     */
    export abstract class Recycler {
        private static depot: { [type: string]: Object[] } = {};

        /**
         * Returns an object of the requested type from the depot, or a new one, if the depot was empty 
         * @param _T The class identifier of the desired object
         */
        public static get<T>(_T: new () => T): T {
            let key: string = _T.name;
            let instances: Object[] = Recycler.depot[key];
            if (instances && instances.length > 0)
                return <T>instances.pop();
            else
                return new _T();
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