namespace GenericsTest {
    class Base {
        x: number = 10;
        public sayHello(): void {
            console.log("Hi, I'm Base");
        }
    }
    class Sub extends Base {
        t: string = "Hallo";
        public sayHello(): void {
            console.log("Hi, I'm Sub", this.t);
        }
    }
    class Sub2 extends Base {
        t: string = "Hallo again";
        public sayHello(): void {
            console.log("Hi, I'm Sub2", this.t);
        }
    }

    function implicitGeneric<T extends Base>(_type: typeof Base): T[] {
        let result: T[] = <T[]>[new _type(), new _type()];
        return result;
    }

    implicitGeneric(Sub);
    let t: Sub[] = implicitGeneric(Sub);
    console.log(t);
    t[0].sayHello();
    let t2: Sub2[] = implicitGeneric(Sub2);
    console.log(t2);
    t2[0].sayHello();
    // t.forEach((t: Sub): void => { t.sayHello(); });
}