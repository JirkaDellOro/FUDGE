/// <reference path="../../Core/build/Fudge.d.ts" />
declare namespace Fudge {
    namespace UserInterface {
        class FoldableFieldSet extends HTMLFieldSetElement {
            constructor(_legend: string);
            private toggleFoldElement;
        }
        class Stepper extends HTMLInputElement {
            constructor(_label: string, params?: {
                min?: number;
                max?: number;
                step?: number;
                value?: number;
            });
        }
    }
}
declare namespace Fudge {
    namespace UserInterface {
        import ƒ = Fudge;
        class UIGenerator {
            static createFromMutator(_mutable: ƒ.Mutable, element: HTMLFormElement): FormData;
            static createDropdown(_id: string, _content: Object, _value: string, _parent: HTMLElement, _cssClass?: string): HTMLSelectElement;
            static createFieldset(_legend: string, _parent: HTMLElement, _cssClass?: string): HTMLFieldSetElement;
            static createFoldableFieldset(_legend: string, _parent: HTMLElement): void;
            static createLabelElement(_id: string, _parent: HTMLElement, params?: {
                _value?: string;
                _cssClass?: string;
            }): HTMLElement;
            static createTextElement(_id: string, _parent: HTMLElement, params?: {
                _value?: string;
                _cssClass?: string;
            }): HTMLInputElement;
            static createCheckboxElement(_id: string, _value: boolean, _parent: HTMLElement, _cssClass?: string): HTMLInputElement;
            static createStepperElement(_id: string, _parent: HTMLElement, params?: {
                _value?: number;
                _min?: number;
                _max?: number;
                _cssClass?: string;
                _mutable?: ƒ.Mutable;
            }): HTMLSpanElement;
        }
    }
}
declare namespace Fudge {
    namespace UserInterface {
        import ƒ = Fudge;
        abstract class MutableUI {
            protected timeUpdate: number;
            protected root: HTMLFormElement;
            protected mutable: ƒ.Mutable;
            protected mutator: ƒ.Mutator;
            constructor(_mutable: ƒ.Mutable);
            protected updateUI: (_e: Event) => void;
            protected updateMutator: (_e: Event) => void;
            protected fillById(_mutator: ƒ.Mutator, _root: HTMLElement): void;
        }
    }
}
