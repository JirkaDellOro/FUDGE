namespace Fudge {
    export class ObjectManager {
        private static depot: { [type: string]: Object[] } = {};

        public static create<T>(_T: new () => T): T {
            let key: string = _T.name;
            let instances: Object[] = ObjectManager.depot[key];
            if (instances && instances.length > 0)
                return <T>instances.pop();
            else
                return new _T();
                
        }
        public static reuse(_instance: Object): void {
            let key: string = _instance.constructor.name;
            //console.log(key);
            let instances: Object[] = ObjectManager.depot[key] || [];
            instances.push(_instance);
            ObjectManager.depot[key] = instances;
            // Debug.log(`ObjectManager.depot[${key}]: ${ObjectManager.depot[key].length}`);
            //console.log(this.depot);
        }
    }
}