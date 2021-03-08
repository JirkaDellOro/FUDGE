var ListControl;
(function (ListControl) {
    var ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    class List extends ƒUi.Details {
        constructor(_legend, _array) {
            super(_legend);
            this.mutateOnInput = async (_event) => {
                let mutator = this.getMutator();
                // console.log(mutator);
                await this.mutable.mutate(mutator);
                _event.stopPropagation();
                this.dispatchEvent(new Event("mutate" /* MUTATE */, { bubbles: true }));
            };
            this.hndDragStart = (_event) => {
                // _event.preventDefault; 
                let keyDrag = _event.currentTarget.getAttribute("key");
                _event.dataTransfer.setData("index", keyDrag);
            };
            this.hndDragOver = (_event) => {
                _event.preventDefault();
                if (_event.ctrlKey)
                    _event.dataTransfer.dropEffect = "copy";
                if (_event.shiftKey)
                    _event.dataTransfer.dropEffect = "link";
            };
            this.hndDrop = (_event) => {
                let drop = _event.currentTarget;
                let keyDrop = drop.getAttribute("key");
                let keyDrag = _event.dataTransfer.getData("index");
                let drag = this.querySelector(`[key=${keyDrag}]`);
                let insertion = keyDrag > keyDrop ? "beforebegin" : "afterend";
                if (_event.ctrlKey)
                    drag = drag.cloneNode(true);
                if (_event.shiftKey) {
                    drag.parentNode.removeChild(drag);
                }
                else
                    drop.insertAdjacentElement(insertion, drag);
            };
            this.hndkey = (_event) => {
                let item = _event.currentTarget;
                // only work on items of list, not their children
                if (_event.target != item)
                    return;
                let focus = parseInt(item.getAttribute("label"));
                let sibling = item;
                switch (_event.code) {
                    case ƒ.KEYBOARD_CODE.DELETE:
                        item.parentNode.removeChild(item);
                        this.rearrangeMutable(focus);
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_UP:
                        if (!_event.altKey) {
                            this.setFocus(--focus);
                            break;
                        }
                        _event.shiftKey ? item = item.cloneNode(true) : sibling = item.previousSibling;
                        if (!sibling)
                            break;
                        sibling.insertAdjacentElement("beforebegin", item);
                        this.rearrangeMutable(--focus);
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                        if (!_event.altKey) {
                            this.setFocus(++focus);
                            break;
                        }
                        _event.shiftKey ? item = item.cloneNode(true) : sibling = item.nextSibling;
                        if (!sibling)
                            break;
                        sibling.insertAdjacentElement("afterend", item);
                        this.rearrangeMutable(++focus);
                        break;
                }
            };
            this.setContent(_array);
            this.addEventListener("input", this.mutateOnInput);
        }
        setContent(_array) {
            this.mutable = _array;
            // this.content.innerHTML = "";
            this.removeChild(this.content);
            this.content = ƒUi.Generator.createInterfaceFromMutable(this.mutable);
            this.appendChild(this.content);
            console.log(this);
            for (let child of this.content.children) {
                child.draggable = true;
                child.addEventListener("dragstart", this.hndDragStart);
                child.addEventListener("drop", this.hndDrop);
                child.addEventListener("dragover", this.hndDragOver);
                child.addEventListener("keydown", this.hndkey, true);
                child.tabIndex = 0;
            }
        }
        getMutator() {
            return ƒUi.Controller.getMutator(this.mutable, this);
        }
        rearrangeMutable(_focus = undefined) {
            let sequence = [];
            for (let child of this.content.children) {
                sequence.push(parseInt(child.getAttribute("label")));
            }
            console.log(sequence);
            this.mutable.rearrange(sequence);
            this.setContent(this.mutable);
            ƒUi.Controller.updateUserInterface(this.mutable, this);
            this.setFocus(_focus);
        }
        setFocus(_focus = undefined) {
            if (_focus == undefined)
                return;
            _focus = Math.min(_focus, this.content.children.length - 1);
            this.content.children[_focus].focus();
        }
    }
    ListControl.List = List;
    customElements.define("list-array", List, { extends: "details" });
})(ListControl || (ListControl = {}));
//# sourceMappingURL=List.js.map