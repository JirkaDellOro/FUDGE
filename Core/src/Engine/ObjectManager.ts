namespace Fudge {
    /**
     * Keeps a depot of objects that have been marked for reuse, sorted by type.  
     * Using [[ObjectManager]] reduces load on the carbage collector and thus supports smooth performance
     */
    export abstract class ObjectManager {
        private static depot: { [type: string]: Object[] } = {};

        /**
         * Returns an object of the requested type for recycling or a new one, if the depot was empty 
         * @param _T The class identifier of the desired object
         */
        public static create<T>(_T: new () => T): T {
            let key: string = _T.name;
            let instances: Object[] = ObjectManager.depot[key];
            if (instances && instances.length > 0)
                return <T>instances.pop();
            else
                return new _T();
        }
        
        /**
         * Stores the object in the depot for later recycling. Users are responsible for throwing in objects that are about to loose scope.
         * @param _instance
         */
        public static reuse(_instance: Object): void {
            let key: string = _instance.constructor.name;
            //Debug.log(key);
            let instances: Object[] = ObjectManager.depot[key] || [];
            instances.push(_instance);
            ObjectManager.depot[key] = instances;
            // Debug.log(`ObjectManager.depot[${key}]: ${ObjectManager.depot[key].length}`);
            //Debug.log(this.depot);
        }
    }
}