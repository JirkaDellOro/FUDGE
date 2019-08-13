var ObjectManagerTest;
(function (ObjectManagerTest) {
    class ObjectManager {
        static create(_T) {
            let key = _T.name;
            let instances = this.depot[key];
            if (instances && instances.length > 0)
                return instances.pop();
            else
                return new _T();
        }
        static reuse(_instance) {
            let key = _instance.constructor.name;
            //console.log(key);
            let instances = this.depot[key] || [];
            instances.push(_instance);
            this.depot[key] = instances;
            //console.log(this.depot);
        }
    }
    ObjectManager.depot = {};
    ObjectManagerTest.ObjectManager = ObjectManager;
})(ObjectManagerTest || (ObjectManagerTest = {}));
//# sourceMappingURL=ObjectManager.js.map