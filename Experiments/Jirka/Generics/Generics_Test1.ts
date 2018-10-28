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

var tah: TypedArrayHandler<string> = new TypedArrayHandler<string>();
tah.arr[0] = "123";



var res: string = printType<string>("Hallo");

var gt: GenericsTest<string>;
gt = new GenericsTest<string>();
//gt.t = "Hallo";
console.log(gt.getT());
console.log(typeof (gt));

