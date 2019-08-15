/// <reference path="../../Core/build/Fudge.d.ts" />
declare namespace FudgeUserInterface {
    /**
     * <select><option>Hallo</option></select>
     */
    class ToggleButton extends HTMLButtonElement {
        private toggleState;
        constructor(style: string);
        setToggleState(toggleState: boolean): void;
        getToggleState(): boolean;
        toggle(): void;
        private switchToggleState;
    }
    class Stepper extends HTMLInputElement {
        constructor(_label: string, params?: {
            min?: number;
            max?: number;
            step?: number;
            value?: number;
        });
    }
    class FoldableFieldSet extends HTMLFieldSetElement {
        constructor(_legend: string);
        private toggleFoldElement;
    }
    class CollapsableList extends HTMLUListElement {
        constructor();
        private toggleFoldElement;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = Fudge;
    class UIGenerator {
        static createFromMutable(_mutable: ƒ.Mutable, _element: HTMLElement, _name?: string): void;
        static createFromMutator(_mutator: ƒ.Mutator, _mutatorTypes: ƒ.MutatorAttributeTypes, _parent: HTMLElement, _mutable: ƒ.Mutable): void;
        static createDropdown(_id: string, _content: Object, _value: string, _parent: HTMLElement, _cssClass?: string): HTMLSelectElement;
        static createFieldset(_legend: string, _parent: HTMLElement, _cssClass?: string): HTMLFieldSetElement;
        static createFoldableFieldset(_legend: string, _parent: HTMLElement): HTMLFieldSetElement;
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
declare namespace FudgeUserInterface {
    import ƒ = Fudge;
    abstract class UIMutable {
        protected timeUpdate: number;
        protected root: HTMLElement;
        protected mutable: ƒ.Mutable;
        protected mutator: ƒ.Mutator;
        constructor(mutable: ƒ.Mutable);
        protected mutateOnInput: (_e: Event) => void;
        protected refreshUI: (_e: Event) => void;
        protected updateMutator(_mutable: ƒ.Mutable, _root: HTMLElement): ƒ.Mutator;
        protected updateUI(_mutable: ƒ.Mutable, _root: HTMLElement): void;
    }
}
