namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    export class UIAnimationList {
        listRoot: HTMLElement;
        private mutator: ƒ.Mutator;
        constructor(_mutator: ƒ.Mutator, _listContainer: HTMLElement) {
            //TODO: Implementation
            this.mutator = _mutator;
            this.listRoot = document.createElement("ul");
            this.listRoot = this.BuildFromMutator(this.mutator);
            _listContainer.append(this.listRoot);
            _listContainer.addEventListener(UIEVENT.COLLAPSE, this.toggleCollapse);
            _listContainer.addEventListener(UIEVENT.UPDATE, this.collectMutator);
        }
        public getMutator(): ƒ.Mutator {
            return this.mutator;
        }
        
        public setMutator(_mutator: ƒ.Mutator): void {
            this.mutator = _mutator;
            let hule: HTMLUListElement = this.BuildFromMutator(this.mutator);
            this.listRoot.replaceWith(hule);
            this.listRoot = hule;
        }

        public collectMutator = (): ƒ.Mutator => {
            let children: HTMLCollection = this.listRoot.children;
            for (let child of children) {
                this.mutator[(<CollapsableAnimationListElement>child).name] = (<CollapsableAnimationListElement>child).mutator;
            }
            console.log(this.mutator);
            return this.mutator;
        }

        private BuildFromMutator(_mutator: ƒ.Mutator): HTMLUListElement {
            let listRoot: HTMLUListElement = document.createElement("ul");
            for (let key in _mutator) {
                let listElement: CollapsableAnimationListElement = new CollapsableAnimationListElement((<ƒ.Mutator>this.mutator[key]), key);
                listRoot.append(listElement);
            }
            return listRoot;
        }

        private toggleCollapse = (_event: Event): void => {
            _event.preventDefault();
            console.log(this.listRoot);
            let target: CollapsableAnimationListElement = <CollapsableAnimationListElement>_event.target;
            if (target.content.children.length != 0) {
                target.collapse(target.content);
            }
            else {
                target.buildContent(target.mutator);
            }
        }

    }

}