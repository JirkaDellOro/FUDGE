namespace Recycler {
  interface Recycable {
    //tslint:disable-next-line: no-any
    /* public*/ recycle(...args: any): any; // { /* */ }
  }

  abstract class Recycler {
    protected static depot: Map<Function, Recycable[]> = new Map(); //{ [type: string]: Object[] } = {};
    protected static recyclers: Map<Function, Recycler> = new Map();

    public static store(_instance: Recycable): void {
      let key: Function = _instance.constructor;
      let instances: Recycable[] = Recycler.depot.get(key) || [];
      instances.push(_instance);
      Recycler.depot.set(key, instances);
    }

    public static for<Class extends Recycable>(_constructor: new (..._args: Parameters<Class["recycle"]>) => Class): RecyclerSpecific<Class> {
      let recycler: Recycler = Recycler.recyclers.get(_constructor);
      if (!recycler) {
        //tslint:disable-next-line: no-use-before-declare
        recycler = new RecyclerSpecific(_constructor);
        Recycler.recyclers.set(_constructor, recycler);
      }

      return recycler as RecyclerSpecific<Class>;
    }

    public abstract get(): Recycable;

  }

  class RecyclerSpecific<Class extends Recycable> extends Recycler {
    public creator: new (..._args: Parameters<Class["recycle"]>) => Class;

    constructor(_constructor: new (..._args: Parameters<Class["recycle"]>) => Class) {
      super();
      this.creator = _constructor;
    }

    public get(..._args: Parameters<Class["recycle"]>): Class {
      let instances: Recycable[] = Recycler.depot.get(this.creator) || [];
      if (instances && instances.length > 0) {
        let instance: Class = instances.pop() as Class;
        //@ts-ignore
        instance.recycle(..._args);
        return instance;
      } 
      else
        return new this.creator(..._args);
    }
  }

  class Test implements Recycable {
    public message: string;
    public value: number;

    constructor(..._args: Parameters<Test["recycle"]>) {
      console.log("construct", ..._args);
      this.recycle(..._args);
    }

    public recycle(_message: string, _value: number): void {
      console.log("recycle " + _message);
      this.message = _message;
      this.value = _value;
    }

    public check(): void {
      console.log("Check", this.message, this.value);
    }
  }

  {
    console.group("Instantiate");
    let instantiated: Test = new Test("Instantiated", 1);
    instantiated.check();
    console.groupEnd();
  }
  {
    console.group("Recycle fail");
    // let recycler: RecyclerSpecific<Test> = new RecyclerSpecific(Test);
    let recycled: Test = Recycler.for(Test).get("Recycled", 2);
    recycled.check();
    console.groupEnd();

    Recycler.store(recycled);
  }
  {
    console.group("Recycle success");
    // let recycler: RecyclerSpecific<Test> = new RecyclerSpecific(Test);
    let recycled: Test = Recycler.for(Test).get("Recycled again", 3);
    recycled.check();
    console.groupEnd();

    Recycler.store(recycled);
  }
}



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