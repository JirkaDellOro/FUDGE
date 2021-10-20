namespace NamespaceTest {
  export class A {
    constructor() {
      console.log("Here is class", this.constructor.name);
    }
    public test(): void {
      console.log("Testing", this.constructor.name);
    }
  }
}
