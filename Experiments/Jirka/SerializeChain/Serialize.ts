namespace SerializeChain {

    class A extends Object {
        get type(): string {
            return this.constructor.name;
        }

        getSuperType(_o: A): string {
            return Reflect.getPrototypeOf(Reflect.getPrototypeOf(_o)).constructor.name;
        }

        printInfo(): void {
            console.log("--A");
            console.log(this.type);
            console.log(this.constructor.name);
        }
    }

    class B extends A {
        printInfo(): void {
            console.log("--B");
            console.log(this.type);
            console.log(super.constructor.name);
            console.log(this.getSuperType(this));
            super.printInfo();
        }
    }
    class C extends B {
        printInfo(): void {
            console.log("--C");
            console.log(this.type);
            console.log(super.constructor.name);
            console.log(this.getSuperType(this));
            super.printInfo();
        }
    }

    let c: C = new C();
    c.printInfo();
}   