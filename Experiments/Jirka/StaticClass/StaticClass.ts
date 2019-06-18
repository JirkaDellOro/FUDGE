namespace StaticClass {

    class Base {
        get type(): string {
            return this.constructor.name;
        }
        static classRegister: typeof Base[] = [];

        static addClass(_class: typeof Base): number {
            return Base.classRegister.push(_class);
        }
    }

    export class Sub1 extends Base {
        public static iRegister: number = Base.addClass(Sub1);

        constructor() {
            super();
            console.log("Hi, I'm an instance of Sub1");
        }
    }
    export class Sub2 extends Base {
        public static iRegister: number = Base.addClass(Sub2);

        constructor() {
            super();
            console.log("Hi, I'm an instance of Sub2");
        }
    }

    for (let type of Base.classRegister)
        console.log(type);

    for (let i: number = 0; i < 10; i++) {
        let choice: number = Math.round(Math.random());
        let typeChosen: typeof Base = Base.classRegister[choice];
        // console.log(typeChosen);
        let instance: Base = new typeChosen();
        console.log(instance.type);
    }
}   