var Mutable;
(function (Mutable_1) {
    class Mutable {
        getMutatorTypes(_mutator) {
            let types = {};
            for (let attribute in _mutator) {
                types[attribute] = _mutator[attribute].constructor.name;
            }
            return types;
        }
        getMutator() {
            let mutator = {};
            for (let attribute in this) {
                mutator[attribute] = this[attribute];
            }
            return mutator;
        }
        getMutatorForAnimation() {
            return this.getMutator();
        }
        getMutatorForUserInterface() {
            return this.getMutator();
        }
        updateMutator(_mutator) {
            for (let attribute in _mutator)
                _mutator[attribute] = this[attribute];
        }
        mutate(_mutator) {
            for (let attribute in _mutator)
                this[attribute] = _mutator[attribute];
        }
    }
    class Test extends Mutable {
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
        console.log(test.getMutatorTypes(m));
        console.groupEnd();
    }
})(Mutable || (Mutable = {}));
//# sourceMappingURL=Mutable.js.map