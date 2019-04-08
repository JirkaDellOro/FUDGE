namespace Fudge {
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
    export class Mutable extends EventTarget {
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
         * Collect the attributes of the instance and their values applicable for animation.
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        public getMutatorForAnimation(): MutatorForAnimation {
            return <MutatorForAnimation>this.getMutator();
        }
        /**
         * Collect the attributes of the instance and their values applicable for the user interface.
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
}
