namespace GenericsTest {
    function printType<T>(_p: T): T {
        var p: T;
        console.log(typeof (p) == typeof (_p));
        return p;
    }

    class GenericsTest<T> {
        t: T;
        constructor() {
            //
        }
        getT(): T {
            return this.t;
        }
    }

    class TypedArrayHandler<T> {
        arr: T[] = new Array(10);
    }

    class Base {
        public sayHello(): void {
            console.log("Hi, I'm Base");
        }
    }
    class Sub extends Base {
        public sayHello(): void {
            console.log("Hi, I'm Sub");
        }
    }

    function implicitGeneric<T extends Base>(_type: typeof Base): Base[] {
        let result: Base[] = <T[]>[new _type(), new _type()];
        return result;
    }

    var tah: TypedArrayHandler<string> = new TypedArrayHandler<string>();
    tah.arr[0] = "123";

    var res: string = printType<string>("Hallo");

    var gt: GenericsTest<string>;
    gt = new GenericsTest<string>();
    //gt.t = "Hallo";
    console.log(gt.getT());
    console.log(typeof (gt));

    let t: Base[] = implicitGeneric(Sub);
    console.log(t);
    t.forEach((t: Sub): void => { t.sayHello(); });
}