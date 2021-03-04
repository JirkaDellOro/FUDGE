var ListControl;
(function (ListControl) {
    var ƒUi = FudgeUserInterface;
    class List extends HTMLDivElement {
        constructor(_array) {
            super();
            this.mutateOnInput = async (_event) => {
                let mutator = this.getMutator();
                console.log(mutator);
                await this.mutable.mutate(mutator);
                _event.stopPropagation();
                this.dispatchEvent(new Event("mutate" /* MUTATE */, { bubbles: true }));
            };
            this.setContent(_array);
            this.addEventListener("input", this.mutateOnInput);
        }
        setContent(_array) {
            this.mutable = _array;
            this.innerHTML = "";
            this.appendChild(ƒUi.Generator.createInterfaceFromMutable(this.mutable));
        }
        getMutator() {
            return ƒUi.Controller.getMutator(this.mutable, this);
        }
    }
    ListControl.List = List;
    customElements.define("list-array", List, { extends: "div" });
})(ListControl || (ListControl = {}));
//# sourceMappingURL=List.js.map