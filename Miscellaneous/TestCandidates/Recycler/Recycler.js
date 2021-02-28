var Recycler;
(function (Recycler_1) {
    class Recycler {
        static store(_instance) {
            let key = _instance.constructor;
            let instances = Recycler.depot.get(key) || [];
            instances.push(_instance);
            Recycler.depot.set(key, instances);
        }
        static for(_constructor) {
            let recycler = Recycler.recyclers.get(_constructor);
            if (!recycler) {
                //tslint:disable-next-line: no-use-before-declare
                recycler = new RecyclerSpecific(_constructor);
                Recycler.recyclers.set(_constructor, recycler);
            }
            return recycler;
        }
    }
    Recycler.depot = new Map();
    Recycler.recyclers = new Map();
    class RecyclerSpecific extends Recycler {
        constructor(_constructor) {
            super();
            this.creator = _constructor;
        }
        get(..._args) {
            let instances = Recycler.depot.get(this.creator) || [];
            if (instances && instances.length > 0) {
                let instance = instances.pop();
                //@ts-ignore
                instance.recycle(..._args);
                return instance;
            }
            else
                return new this.creator(..._args);
        }
    }
    class Test {
        constructor(..._args) {
            console.log("construct", ..._args);
            this.recycle(..._args);
        }
        recycle(_message, _value) {
            console.log("recycle " + _message);
            this.message = _message;
            this.value = _value;
        }
        check() {
            console.log("Check", this.message, this.value);
        }
    }
    class Test2 extends Test {
        constructor(..._args) {
            super(_args[0], 999);
            console.log("construct", ..._args);
            this.recycle(..._args);
        }
        // @ts-ignore
        recycle(_message, _test) {
            console.log("recycle " + _message);
            this.message = _message;
            this.test = _test;
        }
        check() {
            console.log("Check", this.message, this.test);
        }
    }
    {
        console.group("Instantiate");
        let instantiated = new Test("Instantiated", 1);
        instantiated.check();
        console.groupEnd();
    }
    {
        console.group("Recycle fail");
        let recycled = Recycler.for(Test).get("Recycled", 2);
        recycled.check();
        console.groupEnd();
        Recycler.store(recycled);
    }
    {
        console.group("Recycle success");
        let recycled = Recycler.for(Test).get("Recycled again", 3);
        recycled.check();
        console.groupEnd();
        Recycler.store(recycled);
    }
    {
        console.group("Instantiate2");
        let instantiated = new Test2("Instantiated", new Test("Hallo", 1));
        instantiated.check();
        console.groupEnd();
    }
    {
        console.group("Recycle fail");
        let recycled = Recycler.for(Test2).get("Recycled", new Test("Hallo2", 2));
        recycled.check();
        console.groupEnd();
        Recycler.store(recycled);
    }
    {
        console.group("Recycle success");
        let recycled = Recycler.for(Test2).get("Recycled again", new Test("Hallo3", 3));
        recycled.check();
        console.groupEnd();
        Recycler.store(recycled);
    }
})(Recycler || (Recycler = {}));
//# sourceMappingURL=Recycler.js.map