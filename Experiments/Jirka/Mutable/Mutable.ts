
namespace Mutable {
    export interface Mutator {
        [attribute: string]: string;
    }
    export interface Mutation {
        [attribute: string]: object;
    }
    export interface MutatorForAnimation extends Mutator { }
    export interface MutatorForUserInterface extends Mutator { }

    class Mutable {
        public getMutator(): Mutator {
            let mutation: Mutator = {};
            for (let attribute in this) {
                mutation[attribute] = this[attribute].constructor.name;
            }
            return mutation;
        }
        public getMutatorForAnimation(): MutatorForAnimation {
            return <MutatorForAnimation>this.getMutator();
        }
        public getMutatorForUserInterface(): MutatorForUserInterface {
            return <MutatorForUserInterface>this.getMutator();
        }
        public getMutation(_mutation: Mutation): void {
            for (let attribute in _mutation)
                _mutation[attribute] = this[attribute];
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
    }

    let test: Test = new Test();
    test.test = new Test();
    printMutators();
    printMutation();
    animate();
    printMutation();

    function animate(): void {
        console.group("Animate");
        let mutation: Mutation = <Mutation><Object>test.getMutatorForAnimation();
        mutation["s"] = "I'v been animated!";
        test.animate(mutation);
    }

    function printMutation(): void {
        console.group("Mutation");
        let mutation: Mutation = test.getMutatorForAnimation();
        test.getMutation(mutation);
        console.log(mutation);
        console.groupEnd();
    }

    function printMutators(): void {
        console.group("Mutators");
        let m: Mutator = test.getMutator();
        console.log(m);
        let mfa: Mutator = test.getMutatorForAnimation();
        console.log(mfa);
        let mfui: Mutator = test.getMutatorForUserInterface();
        console.log(mfui);
        console.groupEnd();
    }
}
