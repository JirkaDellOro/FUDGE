/// <reference path="../../Core/Build/FudgeCore.d.ts" />
declare namespace FudgeUserInterface {
    /**
     * <select><option>Hallo</option></select>
     */
    import ƒ = FudgeCore;
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
    class DropDown extends HTMLDivElement {
        constructor(_contentList: ƒ.Mutator);
    }
}
declare namespace FudgeUserInterface {
    const enum UIEVENT {
        SELECTION = "nodeSelectionEvent",
        COLLAPSE = "listCollapseEvent",
        REMOVE = "nodeRemoveEvent",
        HIDE = "nodeHideEvent",
        UPDATE = "mutatorUpdateEvent"
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    class UIGenerator {
        static createFromMutable(_mutable: ƒ.Mutable, _element: HTMLElement, _name?: string, _mutator?: ƒ.Mutator): void;
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
        }): HTMLSpanElement;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    class UIAnimationList {
        listRoot: HTMLElement;
        private mutator;
        private index;
        constructor(_mutator: ƒ.Mutator, _listContainer: HTMLElement);
        getMutator(): ƒ.Mutator;
        setMutator(_mutator: ƒ.Mutator): void;
        collectMutator: () => ƒ.Mutator;
        getElementIndex(): ƒ.Mutator;
        updateMutator(_update: ƒ.Mutator): void;
        private updateEntry;
        private updateMutatorEntry;
        private buildFromMutator;
        private toggleCollapse;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    abstract class UIListController {
        abstract listRoot: HTMLElement;
        protected abstract toggleCollapse(_event: MouseEvent): void;
    }
    abstract class CollapsableListElement extends HTMLUListElement {
        header: HTMLLIElement;
        content: HTMLElement;
        constructor();
        collapse(element: HTMLElement): void;
    }
    class CollapsableNodeListElement extends CollapsableListElement {
        node: ƒ.Node;
        constructor(_node: ƒ.Node, _name: string, _unfolded?: boolean);
        selectNode: (_event: MouseEvent) => void;
        collapseEvent: (_event: MouseEvent) => void;
    }
    class CollapsableAnimationListElement extends CollapsableListElement {
        mutator: ƒ.Mutator;
        name: string;
        index: ƒ.Mutator;
        constructor(_mutator: ƒ.Mutator, _name: string, _unfolded?: boolean);
        collapseEvent: (_event: MouseEvent) => void;
        buildContent(_mutator: ƒ.Mutator): void;
        getMutator(): ƒ.Mutator;
        setMutator(_mutator: ƒ.Mutator): void;
        getElementIndex(): ƒ.Mutator;
        private updateMutator;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    class UINodeList {
        listRoot: HTMLElement;
        selectedEntry: HTMLElement;
        private nodeRoot;
        constructor(_node: ƒ.Node, _listContainer: HTMLElement);
        getNodeRoot(): ƒ.Node;
        setSelection(_node: ƒ.Node): void;
        getSelection(): ƒ.Node;
        setNodeRoot(_node: ƒ.Node): void;
        toggleCollapse: (_event: MouseEvent) => void;
        private BuildListFromNode;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    abstract class UIMutable {
        protected timeUpdate: number;
        protected root: HTMLElement;
        protected mutable: ƒ.Mutable;
        protected mutator: ƒ.Mutator;
        constructor(mutable: ƒ.Mutable);
        protected mutateOnInput: (_e: Event) => void;
        protected refreshUI: (_e: Event) => void;
        protected updateMutator(_mutable: ƒ.Mutable, _root: HTMLElement, _mutator?: ƒ.Mutator, _types?: ƒ.Mutator): ƒ.Mutator;
        protected updateUI(_mutable: ƒ.Mutable, _root: HTMLElement): void;
    }
}
declare namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    class UINodeData extends UIMutable {
        constructor(_mutable: ƒ.Mutable, _container: HTMLElement);
    }
}
