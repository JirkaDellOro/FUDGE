namespace Library {
  export class SuperClass implements Interface {
    public prop: string = ENUM.SUPERCLASS;
    public sayHello(): void {
      console.log(getGreet(this.prop));
    }
  }
  
  let sup: SuperClass = new SuperClass();
  sup.sayHello();
}
