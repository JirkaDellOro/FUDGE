///<reference types="./Build/Library"/>

namespace Test {
  import lib = Library;
  export class TestClass {
    public sub: lib.SubClass = new lib.SubClass();
  }
}