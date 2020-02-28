var RecyclerStatic;
(function (RecyclerStatic) {
    class Recycable {
        //tslint:disable-next-line: no-any
        recycle(...args) { }
    }
    class Recycler {
        get(_T, ...args) {
            return new _T(...args);
        }
    }
    class Test {
        constructor(..._args) {
            // constructor(..._args: Parameters<Test["recycle"]>) {  // if recycle is an object method
            console.log("construct", ..._args);
            // recycle is class method
            _args[0] = this;
            Test.recycle(..._args);
            // recycle is object method
            // this.recycle(..._args);
        }
        static recycle(_instance, _message, _value) {
            // public recycle(_message: string, _value: number): void {
            console.log("recycle " + _message);
            // recycle is class method
            _instance.message = _message;
            _instance.value = _value;
            // recycle is object method
            // this.message = _message;
            // this.value = _value;
        }
        check() {
            console.log("Check", this.message, this.value);
        }
    }
    // let recycled: Test = Recycler.get(Test, "asdvasdv", 2);
    let recycler = new Recycler();
    recycler.get(Test, null, "ajn", 444);
    let instantiated = new Test(null, "Constructed", 1);
})(RecyclerStatic || (RecyclerStatic = {}));
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
//# sourceMappingURL=RecyclerStatic.js.map