namespace GoldenLayoutTest {
    import ƒ = FudgeCore;
    export class SimpleComponent{
        public constructor(container: any, state: any) {
            let element: HTMLSpanElement = document.createElement("div");
            let mutator: ƒ.Mutator = { people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] };
            UIGenerator.createFromMutator(mutator, element);
            container.getElement().html(element);
        }
    }

}