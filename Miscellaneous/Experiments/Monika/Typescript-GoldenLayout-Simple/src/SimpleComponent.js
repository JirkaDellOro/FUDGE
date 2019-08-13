var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    class SimpleComponent {
        constructor(container, state) {
            let element = document.createElement("div");
            let mutator = { people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] };
            GoldenLayoutTest.UIGenerator.createFromMutator(mutator, element);
            container.getElement().html(element);
        }
    }
    GoldenLayoutTest.SimpleComponent = SimpleComponent;
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=SimpleComponent.js.map