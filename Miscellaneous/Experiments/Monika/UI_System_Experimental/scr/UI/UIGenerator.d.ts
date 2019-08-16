/// <reference path="../../../../Core/build/Fudge.d.ts" />
declare namespace GoldenLayoutTest {
    import ƒ = FudgeCore;
    class UIGenerator {
        static createFromMutator(mutator: ƒ.Mutator, element: HTMLElement): void;
        private static generateUI;
        static createFieldset(_legend: string, _parent: HTMLElement, _class?: string): HTMLElement;
        static createLabelElement(_id: string, _value: string, _parent: HTMLElement, _class?: string): HTMLElement;
        static createTextElement(_id: string, _value: string, _parent: HTMLElement, _class?: string): HTMLElement;
        static createCheckboxElement(_id: string, _value: boolean, _parent: HTMLElement, _class?: string): HTMLElement;
        private static toggleListObj;
    }
}
