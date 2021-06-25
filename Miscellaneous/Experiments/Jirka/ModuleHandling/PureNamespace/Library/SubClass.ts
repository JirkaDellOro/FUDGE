///<reference path="SuperClass.ts"/>

namespace Library {
  export class SubClass extends SuperClass {
    constructor() {
      super();
      this.prop = ENUM.SUBCLASS;
    }
  }

  let sub: SubClass = new SubClass();
  sub.sayHello();
  console.groupEnd();
}
