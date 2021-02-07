namespace Recycler {
  interface Recycable {
    //tslint:disable-next-line: no-any
    recycle(...args: any): any; 
  }

  abstract class Recycler {
    protected static depot: Map<Function, Recycable[]> = new Map(); 
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
  
  class Test2 extends Test {
    public message: string;
    public test: Test;

    constructor(..._args: Parameters<Test2["recycle"]>) {
      super(_args[0], 999);
      console.log("construct", ..._args);
      this.recycle(..._args);
    }

    // @ts-ignore
    public recycle(_message: string, _test: Test): void {
      console.log("recycle " + _message);
      this.message = _message;
      this.test = _test;
    }

    public check(): void {
      console.log("Check", this.message, this.test);
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
    let recycled: Test = Recycler.for(Test).get("Recycled", 2);
    recycled.check();
    console.groupEnd();

    Recycler.store(recycled);
  }
  {
    console.group("Recycle success");
    let recycled: Test = Recycler.for(Test).get("Recycled again", 3);
    recycled.check();
    console.groupEnd();

    Recycler.store(recycled);
  }
  {
    console.group("Instantiate2");
    let instantiated: Test2 = new Test2("Instantiated", new Test("Hallo", 1));
    instantiated.check();
    console.groupEnd();
  }
  {
    console.group("Recycle fail");
    let recycled: Test2 = Recycler.for(Test2).get("Recycled", new Test("Hallo2", 2));
    recycled.check();
    console.groupEnd();

    Recycler.store(recycled);
  }
  {
    console.group("Recycle success");
    let recycled: Test2 = Recycler.for(Test2).get("Recycled again", new Test("Hallo3", 3));
    recycled.check();
    console.groupEnd();

    Recycler.store(recycled);
  }
}
