namespace ObjectManagerTest {
    export class ObjectManager {
        private static depot: {} = {};

        public static create<T>(_T: new () => T): T {
            let key: string = _T.name;
            let instances: Object[] = this.depot[key];
            if (instances && instances.length > 0)
                return <T>instances.pop();
            else
                return new _T();
        }
        public static reuse(_instance: Object): void {
            let key: string = _instance.constructor.name;
            //console.log(key);
            let instances: Object[] = this.depot[key] || [];
            instances.push(_instance);
            this.depot[key] = instances;
            //console.log(this.depot);
        }
    }
}