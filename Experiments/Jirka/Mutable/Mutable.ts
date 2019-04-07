
namespace Mutable {
    // tslint:disable-next-line: no-any
    type General = any;
    //#region class Mutator 
    /**
     * Interface describing the datatypes of the attributes a mutator as strings 
     */
    export interface MutatorAttributeTypes {
        [attribute: string]: string;
    }
    /**
     * Interface describing a mutator, which is an associative array with names of attributes and their corresponding values
     */
    export interface Mutator {
        [attribute: string]: Object;
    }

    /*
     * Interfaces dedicated for each purpose. Extra attribute necessary for compiletime type checking, not existent at runtime
     */
    export interface MutatorForAnimation extends Mutator { readonly forAnimation: null; }
    export interface MutatorForUserInterface extends Mutator { readonly forUserInterface: null; }

    /**
     * Base class implementing mutability of instances of subclasses using [[Mutator]]-objects
     * thus providing and using interfaces created at runtime
     */
    export class Mutable {
        /**
         * Collect all attributes of the instance and their values in a Mutator-object
         */
        public getMutator(): Mutator {
            let mutator: Mutator = {};
            for (let attribute in this) {
                mutator[attribute] = this[attribute];
            }
            return mutator;
        }
        /**
         * Collect the attributes of the instance and their values applicable for animation
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        public getMutatorForAnimation(): MutatorForAnimation {
            return <MutatorForAnimation>this.getMutator();
        }
        /**
         * Collect the attributes of the instance and their values applicable for the user interface
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        public getMutatorForUserInterface(): MutatorForUserInterface {
            return <MutatorForUserInterface>this.getMutator();
        }
        /**
         * Returns an associative array with the same attributes as the given mutator, but with the corresponding types as string-values
         * @param _mutator 
         */
        public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
            let types: MutatorAttributeTypes = {};
            for (let attribute in _mutator) {
                types[attribute] = _mutator[attribute].constructor.name;
            }
            return types;
        }
        /**
         * Updates the values of the given mutator according to the current state of the instance
         * @param _mutator 
         */
        public updateMutator(_mutator: Mutator): void {
            for (let attribute in _mutator)
                _mutator[attribute] = (<General>this)[attribute];
        }
        /**
         * Updates the attribute values of the instance according to the state of the mutator. Must be protected...!
         * @param _mutator
         */
        protected mutate(_mutator: Mutator): void {
            for (let attribute in _mutator)
                (<General>this)[attribute] = _mutator[attribute];
        }
    }

    export class TestSuper extends Mutable {
        ssuper: string = "Hello from the superclass";
    }

    export class Test extends TestSuper {
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
        m["xyz"] = "I shouldn't be here...";
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
        console.log(test.getMutatorAttributeTypes(m));
        console.groupEnd();
    }
}
