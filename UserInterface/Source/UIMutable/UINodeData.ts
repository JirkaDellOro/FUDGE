namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    export class UINodeData extends UIMutable {
        public constructor(_mutable: ƒ.Mutable, _container: HTMLElement) {
            super(_mutable);
            this.root = document.createElement("form");
            UIGenerator.createFromMutable(<ƒ.Mutable>_mutable, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            _container.append(this.root);
        }
    
    }
}