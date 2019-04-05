
namespace Mutable {
    //#region class Mutator 
    export interface MutatorTypes {
        [attribute: string]: string;
    }
    export interface Mutator {
        [attribute: string]: Object;
    }
    export interface MutatorForAnimation extends Mutator { forAnimation: null; }
    export interface MutatorForUserInterface extends Mutator { forUserInterface: null; }

    class Mutable {
        public getMutatorTypes(_mutator: Mutator): MutatorTypes {
            let types: MutatorTypes = {};
            for (let attribute in _mutator) {
                types[attribute] = _mutator[attribute].constructor.name;
            }
            return types;
        }
        public getMutator(): Mutator {
            let mutator: Mutator = {};
            for (let attribute in this) {
                mutator[attribute] = this[attribute];
            }
            return mutator;
        }
        public getMutatorForAnimation(): MutatorForAnimation {
            return <MutatorForAnimation>this.getMutator();
        }
        public getMutatorForUserInterface(): MutatorForUserInterface {
            return <MutatorForUserInterface>this.getMutator();
        }
        public updateMutator(_mutator: Mutator): void {
            for (let attribute in _mutator)
                _mutator[attribute] = this[attribute];
        }
        protected mutate(_mutator: Mutator): void {
            for (let attribute in _mutator)
                this[attribute] = _mutator[attribute];
        }
    }

    export class Test extends Mutable {
        public test: Test = null;
        public b: boolean = true;
        protected s: string = "Hallo";
        private n: number = 42;

        public getMutatorForAnimation(): MutatorForAnimation {
            let mutator: MutatorForAnimation = super.getMutatorForAnimation();
            delete mutator["test"];
            Object.seal(mutator);
            return mutator;
        }
        public getMutatorForUserInterface(): MutatorForUserInterface {
            let mutator: MutatorForUserInterface = super.getMutatorForUserInterface();
            delete mutator["s"];
            Object.seal(mutator);
            return mutator;
        }
        public animate(_mutation: MutatorForAnimation): void {
            this.mutate(_mutation);
        }

        public mutate(_mutator: Mutator): void {
            super.mutate(_mutator);
        }
    }
    //#endregion

    let test: Test = new Test();
    test.test = new Test();
    printMutatorTypes();
    console.group("Mutator for animation");
    console.log(test.getMutatorForAnimation());
    console.groupEnd();
    animate();


    function animate(): void {
        console.group("Animate");
        let m: MutatorForAnimation = test.getMutatorForAnimation();
        m["s"] = "I've been animated!";
        test.animate(m);
        test.updateMutator(m);
        console.log(m);
        console.groupEnd();
    }

    function printMutatorTypes(): void {
        console.group("Mutators");
        let m: Mutator = test.getMutator();
        console.log(m);
        console.log(test.getMutatorForAnimation());
        console.log(test.getMutatorForUserInterface());
        console.log(test.getMutatorTypes(m));
        console.groupEnd();
    }
}
