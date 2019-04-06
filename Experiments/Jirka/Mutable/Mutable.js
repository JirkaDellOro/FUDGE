"use strict";
var Mutable;
(function (Mutable_1) {
    /**
     * Base class implementing mutability of instances of subclasses using [[Mutator]]-objects
     * thus providing and using interfaces created at runtime
     */
    class Mutable {
        /**
         * Collect all attributes of the instance and their values in a Mutator-object
         */
        getMutator() {
            let mutator = {};
            for (let attribute in this) {
                mutator[attribute] = this[attribute];
            }
            return mutator;
        }
        /**
         * Collect the attributes of the instance and their values applicable for animation
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        getMutatorForAnimation() {
            return this.getMutator();
        }
        /**
         * Collect the attributes of the instance and their values applicable for the user interface
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        getMutatorForUserInterface() {
            return this.getMutator();
        }
        /**
         * Returns an associative array with the same attributes as the given mutator, but with the corresponding types as string-values
         * @param _mutator
         */
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            for (let attribute in _mutator) {
                types[attribute] = _mutator[attribute].constructor.name;
            }
            return types;
        }
        /**
         * Updates the values of the given mutator according to the current state of the instance
         * @param _mutator
         */
        updateMutator(_mutator) {
            for (let attribute in _mutator)
                _mutator[attribute] = this[attribute];
        }
        /**
         * Updates the attribute values of the instance according to the state of the mutator. Must be protected...!
         * @param _mutator
         */
        mutate(_mutator) {
            for (let attribute in _mutator)
                this[attribute] = _mutator[attribute];
        }
    }
    Mutable_1.Mutable = Mutable;
    class TestSuper extends Mutable {
        constructor() {
            super(...arguments);
            this.ssuper = "Hello from the superclass";
        }
    }
    Mutable_1.TestSuper = TestSuper;
    class Test extends TestSuper {
        constructor() {
            super(...arguments);
            this.test = null;
            this.b = true;
            this.s = "Hallo";
            this.n = 42;
        }
        getMutatorForAnimation() {
            let mutator = super.getMutatorForAnimation();
            delete mutator["test"];
            Object.seal(mutator);
            return mutator;
        }
        getMutatorForUserInterface() {
            let mutator = super.getMutatorForUserInterface();
            delete mutator["s"];
            Object.seal(mutator);
            return mutator;
        }
        animate(_mutation) {
            this.mutate(_mutation);
        }
        mutate(_mutator) {
            super.mutate(_mutator);
        }
    }
    Mutable_1.Test = Test;
    //#endregion
    let test = new Test();
    test.test = new Test();
    printMutatorTypes();
    console.group("Mutator for animation");
    console.log(test.getMutatorForAnimation());
    console.groupEnd();
    animate();
    function animate() {
        console.group("Animate");
        let m = test.getMutatorForAnimation();
        m["s"] = "I've been animated!";
        m["xyz"] = "I shouldn't be here...";
        test.animate(m);
        test.updateMutator(m);
        console.log(m);
        console.groupEnd();
    }
    function printMutatorTypes() {
        console.group("Mutators");
        let m = test.getMutator();
        console.log(m);
        console.log(test.getMutatorForAnimation());
        console.log(test.getMutatorForUserInterface());
        console.log(test.getMutatorAttributeTypes(m));
        console.groupEnd();
    }
})(Mutable || (Mutable = {}));
//# sourceMappingURL=Mutable.js.map