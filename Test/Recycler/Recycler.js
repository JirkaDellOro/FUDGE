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
    Recycler.depot = new Map(); //{ [type: string]: Object[] } = {};
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
    {
        console.group("Instantiate");
        let instantiated = new Test("Instantiated", 1);
        instantiated.check();
        console.groupEnd();
    }
    {
        console.group("Recycle fail");
        // let recycler: RecyclerSpecific<Test> = new RecyclerSpecific(Test);
        let recycled = Recycler.for(Test).get("Recycled", 2);
        recycled.check();
        console.groupEnd();
        Recycler.store(recycled);
    }
    {
        console.group("Recycle success");
        // let recycler: RecyclerSpecific<Test> = new RecyclerSpecific(Test);
        let recycled = Recycler.for(Test).get("Recycled again", 3);
        recycled.check();
        console.groupEnd();
        Recycler.store(recycled);
    }
})(Recycler || (Recycler = {}));
/*
    //Scope1
    {
      let test: Test = ƒ.Recycler.get(Test);
      if (typeof (test.prop) != "string")
        test.prop = "I've been newly created, the recycler had non of my kind";
      test.check();
    }
    //Scope2
    {
      let test: Test = ƒ.Recycler.get(Test, "I received this message from the recycler on construction");
      if (typeof (test.prop) != "string")
        test.prop = "Something went wrong, I should have received a message";
      test.check();
      ƒ.Recycler.store(test);
    }
    //Scope3
    {
      let test: Test = ƒ.Recycler.get(Test);
      if (typeof (test.prop) != "string")
        test.prop = "Something went wrong, i should be a reycled object";
      else
        test.prop = "I'm a reycled object";
      test.check();
      ƒ.Recycler.store(test);
    }
    //Scope4
    {
      let test: Test = ƒ.Recycler.get(Test, "I received this message from the recycler on construction");
      Object.call((<Function>test.constructor)("jnn"));
      test.check();
      ƒ.Recycler.store(test);
    }
  */ 
//# sourceMappingURL=Recycler.js.map