/// <reference path="../Event/Event.ts"/>
namespace FudgeCore {
    /**
     * Interface describing the datatypes of the attributes a mutator as strings 
     */
    export interface MutatorAttributeTypes {
        [attribute: string]: string | Object;
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
    // export interface MutatorForComponent extends Mutator { readonly forUserComponent: null; }

    /**
     * Base class for all types being mutable using [[Mutator]]-objects, thus providing and using interfaces created at runtime.  
     * Mutables provide a [[Mutator]] that is build by collecting all object-properties that are either of a primitive type or again Mutable.
     * Subclasses can either reduce the standard [[Mutator]] built by this base class by deleting properties or implement an individual getMutator-method.
     * The provided properties of the [[Mutator]] must match public properties or getters/setters of the object.
     * Otherwise, they will be ignored if not handled by an override of the mutate-method in the subclass and throw errors in an automatically generated user-interface for the object.
     */
    export abstract class Mutable extends EventTargetƒ {
        /**
         * Retrieves the type of this mutable subclass as the name of the runtime class
         * @returns The type of the mutable
         */
        public get type(): string {
            return this.constructor.name;
        }
        /**
         * Collect applicable attributes of the instance and copies of their values in a Mutator-object
         */
        public getMutator(): Mutator {
            let mutator: Mutator = {};

            // collect primitive and mutable attributes
            for (let attribute in this) {
                let value: Object = this[attribute];
                if (value instanceof Function)
                    continue;
                if (value instanceof Object && !(value instanceof Mutable))
                    continue;
                mutator[attribute] = this[attribute];
            }

            // mutator can be reduced but not extended!
            Object.preventExtensions(mutator);
            // delete unwanted attributes
            this.reduceMutator(mutator);

            // replace references to mutable objects with references to copies
            for (let attribute in mutator) {
                let value: Object = mutator[attribute];
                if (value instanceof Mutable)
                    mutator[attribute] = value.getMutator();
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
         * Collect the attributes of the instance and their values applicable for indiviualization by the component.
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        // public getMutatorForComponent(): MutatorForComponent {
        //     return <MutatorForComponent>this.getMutator();
        // }
        /**
         * Returns an associative array with the same attributes as the given mutator, but with the corresponding types as string-values
         * Does not recurse into objects!
         * @param _mutator 
         */
        public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
            let types: MutatorAttributeTypes = {};
            for (let attribute in _mutator) {
                let type: string = null;
                let value: number | boolean | string | object = _mutator[attribute];
                if (_mutator[attribute] != undefined)
                    if (typeof (value) == "object")
                        type = (<General>this)[attribute].constructor.name;
                    else
                        type = _mutator[attribute].constructor.name;
                types[attribute] = type;
            }
            return types;
        }
        /**
         * Updates the values of the given mutator according to the current state of the instance
         * @param _mutator 
         */
        public updateMutator(_mutator: Mutator): void {
            for (let attribute in _mutator) {
                let value: Object = _mutator[attribute];
                if (value instanceof Mutable)
                    value = value.getMutator();
                else
                    _mutator[attribute] = (<General>this)[attribute];
            }
        }
        /**
         * Updates the attribute values of the instance according to the state of the mutator. Must be protected...!
         * @param _mutator
         */
        public mutate(_mutator: Mutator): void {
            // TODO: don't assign unknown properties
            for (let attribute in _mutator) {
                let value: Mutator = <Mutator>_mutator[attribute];
                let mutant: Object = (<General>this)[attribute];
                if (mutant instanceof Mutable)
                    mutant.mutate(value);
                else
                    (<General>this)[attribute] = value;
            }
            this.dispatchEvent(new Event(EVENT.MUTATE));
        }
        /**
         * Reduces the attributes of the general mutator according to desired options for mutation. To be implemented in subclasses
         * @param _mutator 
         */
        protected abstract reduceMutator(_mutator: Mutator): void;
    }
}
