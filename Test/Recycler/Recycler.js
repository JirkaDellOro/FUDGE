var Recycler;
(function (Recycler_1) {
    class Recycler {
        static get(_T, ...args) {
            return new _T(...args);
        }
    }
    class Test {
        // constructor(..._args: Parameters<typeof Test.recycle>) {  // if recycle is a class method
        constructor(..._args) {
            console.log("construct", ..._args);
            this.recycle(..._args);
        }
        // public static recycle(_instance: Test, _message: string, _value: number): void {
        recycle(_message, _value) {
            console.log("recycle " + _message);
            this.message = _message;
            this.value = _value;
        }
        check() {
            console.log("Check", this.message, this.value);
        }
    }
    let recycled = Recycler.get(Test, "asdvasdv", 2);
    let instantiated = new Test("Constructed", 1);
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