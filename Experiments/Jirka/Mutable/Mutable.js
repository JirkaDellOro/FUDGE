var Mutable;
(function (Mutable_1) {
    class Mutable {
        getMutator() {
            let mutation = {};
            for (let attribute in this) {
                mutation[attribute] = this[attribute].constructor.name;
            }
            return mutation;
        }
        getMutatorForAnimation() {
            return this.getMutator();
        }
        getMutatorForUserInterface() {
            return this.getMutator();
        }
        getMutation(_mutation) {
            for (let attribute in _mutation)
                _mutation[attribute] = this[attribute];
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
    }
    Mutable_1.Test = Test;
    let test = new Test();
    test.test = new Test();
    printMutators();
    printMutation();
    animate();
    printMutation();
    function animate() {
        console.group("Animate");
        let mutation = test.getMutatorForAnimation();
        mutation["s"] = "I'v been animated!";
        test.animate(mutation);
    }
    function printMutation() {
        console.group("Mutation");
        let mutation = test.getMutatorForAnimation();
        test.getMutation(mutation);
        console.log(mutation);
        console.groupEnd();
    }
    function printMutators() {
        console.group("Mutators");
        let m = test.getMutator();
        console.log(m);
        let mfa = test.getMutatorForAnimation();
        console.log(mfa);
        let mfui = test.getMutatorForUserInterface();
        console.log(mfui);
        console.groupEnd();
    }
})(Mutable || (Mutable = {}));
//# sourceMappingURL=Mutable.js.map