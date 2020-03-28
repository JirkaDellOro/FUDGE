///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var TreeControl;
(function (TreeControl) {
    var ƒ = FudgeCore;
    /**
     * Extension of ul-Element that builds a tree structure with interactive controls from an array of type TreeEntry.
     * Creates an li-Element called item for each entry, with a checkbox and a textinput as content.
     * Additional content of an item is again an instance of Tree, if the corresponding entry has children.
     *
     * ```plaintext
     * tree
     * ├ item
     * ├ item
     * │ └ tree
     * │   ├ item
     * │   └ item
     * └ item
     * ```
     */
    class Tree extends HTMLUListElement {
        constructor(_entries) {
            super();
            this.backlink = new Map();
            this.hndChange = (_event) => {
                console.log(_event);
                let target = _event.target;
                // TODO: check if listener is better attached to item than to tree
                let item = target.parentElement;
                _event.stopPropagation();
                switch (target.type) {
                    case "checkbox":
                        this.open(item, target.checked);
                        break;
                    case "text":
                        console.log(target.value);
                        break;
                    case "default":
                        console.log(target);
                        break;
                }
            };
            this.hndFocus = (_event) => {
                let listening = _event.currentTarget;
                switch (_event.type) {
                    case "focusNext":
                        let next = listening.nextElementSibling;
                        if (!next)
                            return;
                        next.focus();
                        _event.stopPropagation();
                        break;
                    case "focusPrevious":
                        if (listening == _event.target)
                            return;
                        let items = listening.querySelectorAll("li");
                        let prev = listening;
                        for (let item of items) {
                            if (item == _event.target)
                                break;
                            prev = item;
                        }
                        prev.focus();
                        _event.stopPropagation();
                        break;
                    default:
                        break;
                }
                // console.log(_event);
                // console.log(document.activeElement);
            };
            this.hndKey = (_event) => {
                // console.log(_event);
                _event.stopPropagation();
                let target = _event.target;
                let item = _event.currentTarget;
                let content = item.querySelector("ul");
                switch (_event.code) {
                    case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                        if (content)
                            content.firstChild.focus();
                        else
                            this.open(item, true);
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                        if (content)
                            this.open(item, false);
                        else
                            this.parentElement.focus();
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                        if (content)
                            content.firstChild.focus();
                        else
                            item.dispatchEvent(new Event("focusNext", { bubbles: true }));
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_UP:
                        item.dispatchEvent(new Event("focusPrevious", { bubbles: true }));
                        break;
                }
            };
            this.create(_entries);
            this.addEventListener("change", this.hndChange);
            // this.addEventListener("focusin", this.hndFocus);
        }
        open(_item, _open) {
            this.removeContent(_item);
            if (_open) {
                let entry = this.backlink.get(_item);
                let children = entry.children;
                if (children)
                    _item.appendChild(new Tree(children));
            }
            _item.querySelector("input[type='checkbox']").checked = _open;
        }
        create(_entries) {
            for (let entry of _entries) {
                let item = this.createItem(entry);
                this.appendChild(item);
            }
        }
        createItem(_entry) {
            let item = document.createElement("li");
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            item.appendChild(checkbox);
            if (!_entry.children)
                checkbox.style.visibility = "hidden";
            let text = document.createElement("input");
            text.type = "text";
            // text.readOnly = true;
            text.disabled = true;
            text.value = _entry.display;
            text.draggable = true;
            item.appendChild(text);
            item.addEventListener("keydown", this.hndKey);
            item.addEventListener("focusNext", this.hndFocus);
            item.addEventListener("focusPrevious", this.hndFocus);
            item.tabIndex = 0;
            this.backlink.set(item, _entry);
            return item;
        }
        removeContent(_item) {
            let content = _item.querySelector("ul");
            if (!content)
                return;
            _item.removeChild(content);
        }
    }
    customElements.define("ul-tree", Tree, { extends: "ul" });
    let list = new Tree(TreeControl.data);
    document.body.appendChild(list);
    console.log(document.querySelectorAll("[tabindex]"));
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=Main.js.map