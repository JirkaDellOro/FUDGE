namespace Reflection {
  export class Test {
    public static readonly registration: typeof Test[] = [];
    public static readonly id: number = Test.register();

    protected static register(): number {
      return this.registration.push(this) - 1;
    }
  }

  export class Sub extends Test {
    public static readonly id: number = Sub.register();
  }

  console.dir(Test.registration);
} 