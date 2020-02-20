"use strict";
var FudgeUserInterface;
(function (FudgeUserInterface) {
    class ToggleButton extends HTMLButtonElement {
        constructor(style) {
            super();
            this.switchToggleState = (_event) => {
                this.setToggleState(!this.toggleState);
            };
            this.type = "button";
            this.toggleState = true;
            this.classList.add(style);
            this.classList.add("ToggleOn");
            this.addEventListener("click", this.switchToggleState);
        }
        setToggleState(toggleState) {
            this.toggleState = toggleState;
            if (this.toggleState == true) {
                this.classList.add("ToggleOn");
                this.classList.remove("ToggleOff");
            }
            else {
                this.classList.remove("ToggleOn");
                this.classList.add("ToggleOff");
            }
        }
        getToggleState() {
            return this.toggleState;
        }
        toggle() {
            this.setToggleState(!this.toggleState);
        }
    }
    FudgeUserInterface.ToggleButton = ToggleButton;
    class Stepper extends HTMLInputElement {
        constructor(_label, params = {}) {
            super();
            this.name = _label;
            this.type = "number";
            this.value = params.value.toString();
            this.id = _label;
            this.step = String(params.step) || "1";
        }
    }
    FudgeUserInterface.Stepper = Stepper;
    class FoldableFieldSet extends HTMLFieldSetElement {
        constructor(_legend) {
            super();
            this.toggleFoldElement = (_event) => {
                _event.preventDefault();
                if (_event.target != _event.currentTarget)
                    return;
                //Get the fieldset the button belongs to
                let children = this.children;
                //fold or unfold all children that aren't unfoldable
                for (let child of children) {
                    if (!child.classList.contains("unfoldable")) {
                        child.classList.toggle("folded");
                    }
                }
            };
            let cntLegend = document.createElement("legend");
            cntLegend.classList.add("unfoldable");
            let btnFoldButton = new ToggleButton("FoldButton");
            btnFoldButton.addEventListener("click", this.toggleFoldElement);
            // btnfoldButton.classList.add("unfoldable");
            let lblTitle = document.createElement("span");
            lblTitle.textContent = _legend;
            // lblTitle.classList.add("unfoldable");
            cntLegend.appendChild(btnFoldButton);
            cntLegend.appendChild(lblTitle);
            this.appendChild(cntLegend);
        }
    }
    FudgeUserInterface.FoldableFieldSet = FoldableFieldSet;
    class MenuButton extends HTMLDivElement {
        constructor(_name, textcontent, parentSignature) {
            super();
            this.resolveClick = (_event) => {
                let event = new CustomEvent("dropMenuClick" /* DROPMENUCLICK */, { detail: this.signature, bubbles: true });
                this.dispatchEvent(event);
            };
            this.name = _name;
            this.signature = parentSignature + "." + _name;
            let button = document.createElement("button");
            button.textContent = textcontent;
            this.append(button);
            button.addEventListener("click", this.resolveClick);
        }
    }
    class MenuContent extends HTMLDivElement {
        constructor(_submenu) {
            super();
            if (_submenu) {
                this.classList.add("submenu-content");
            }
            else {
                this.classList.add("dropdown-content");
            }
        }
    }
    class DropMenu extends HTMLDivElement {
        constructor(_name, _contentList, params) {
            super();
            this.toggleFoldContent = (_event) => {
                this.content.classList.toggle("folded");
            };
            this.collapseMenu = (_event) => {
                if (!(this.contains(_event.target))) {
                    if (!this.content.classList.contains("folded")) {
                        this.toggleFoldContent(_event);
                    }
                }
            };
            let button = document.createElement("button");
            button.name = _name;
            if (params._text) {
                button.textContent = params._text;
            }
            else {
                button.textContent = _name;
            }
            button.addEventListener("click", this.toggleFoldContent);
            window.addEventListener("click", this.collapseMenu);
            let isSubmenu = (params._parentSignature != null);
            if (params._parentSignature) {
                this.signature = params._parentSignature + "." + _name;
            }
            else {
                this.signature = _name;
            }
            this.append(button);
            this.content = new MenuContent(isSubmenu);
            if (params._parentSignature) {
                this.classList.add("submenu");
            }
            else {
                this.classList.add("dropdown");
            }
            this.content.classList.toggle("folded");
            this.name = _name;
            for (let key in _contentList) {
                if (typeof _contentList[key] == "object") {
                    let subMenu = new DropMenu(key, _contentList[key], { _parentSignature: this.signature });
                    this.content.append(subMenu);
                }
                else if (typeof _contentList[key] == "string") {
                    let contentEntry = new MenuButton(key, _contentList[key], this.signature);
                    this.content.append(contentEntry);
                }
            }
            this.append(this.content);
        }
    }
    FudgeUserInterface.DropMenu = DropMenu;
    customElements.define("ui-stepper", Stepper, { extends: "input" });
    customElements.define("ui-toggle-button", ToggleButton, { extends: "button" });
    customElements.define("ui-fold-fieldset", FoldableFieldSet, { extends: "fieldset" });
    customElements.define("ui-dropdown", DropMenu, { extends: "div" });
    customElements.define("ui-dropdown-button", MenuButton, { extends: "div" });
    customElements.define("ui-dropdown-content", MenuContent, { extends: "div" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
// / <reference types="../../../Core/Build/FudgeCore"/>
/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>
var FudgeUserInterface;
/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>
(function (FudgeUserInterface) {
    class UIGenerator {
        static createFromMutable(_mutable, _element, _name, _mutator) {
            let name = _name || _mutable.constructor.name;
            let mutator = _mutator || _mutable.getMutator();
            let mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
            let parent = UIGenerator.createFoldableFieldset(name, _element);
            UIGenerator.createFromMutator(mutator, mutatorTypes, parent, _mutable);
        }
        static createFromMutator(_mutator, _mutatorTypes, _parent, _mutable) {
            for (let key in _mutatorTypes) {
                let type = _mutatorTypes[key];
                let value = _mutator[key].toString();
                if (type instanceof Object) {
                    //Type is Enum
                    UIGenerator.createLabelElement(key, _parent);
                    UIGenerator.createDropdown(key, type, value, _parent);
                }
                else {
                    switch (type) {
                        case "Number":
                            UIGenerator.createLabelElement(key, _parent, { _value: key });
                            // UIGenerator.createTextElement(key, _parent, { _value: value })
                            let numValue = parseInt(value);
                            UIGenerator.createStepperElement(key, _parent, { _value: numValue });
                            break;
                        case "Boolean":
                            UIGenerator.createLabelElement(key, _parent, { _value: key });
                            let enabled = value == "true" ? true : false;
                            UIGenerator.createCheckboxElement(key, enabled, _parent);
                            break;
                        case "String":
                            UIGenerator.createLabelElement(key, _parent, { _value: key });
                            UIGenerator.createTextElement(key, _parent, { _value: value });
                            break;
                        // Some other complex subclass of Mutable
                        default:
                            let subMutable;
                            subMutable = _mutable[key];
                            UIGenerator.createFromMutable(subMutable, _parent, key, _mutator[key]);
                            break;
                    }
                }
            }
        }
        static createDropdown(_id, _content, _value, _parent, _cssClass) {
            let dropdown = document.createElement("select");
            dropdown.id = _id;
            dropdown.name = _id;
            for (let value in _content) {
                let entry = document.createElement("option");
                entry.text = value;
                entry.value = value;
                if (value.toUpperCase() == _value.toUpperCase()) {
                    entry.selected = true;
                }
                dropdown.add(entry);
            }
            _parent.appendChild(dropdown);
            return dropdown;
        }
        static createFieldset(_legend, _parent, _cssClass) {
            let cntfieldset = document.createElement("fieldset");
            cntfieldset.id = _legend;
            let legend = document.createElement("legend");
            legend.innerHTML = _legend;
            cntfieldset.appendChild(legend);
            _parent.appendChild(cntfieldset);
            return cntfieldset;
        }
        static createFoldableFieldset(_legend, _parent) {
            let cntFoldFieldset = new FudgeUserInterface.FoldableFieldSet(_legend);
            cntFoldFieldset.id = _legend;
            _parent.appendChild(cntFoldFieldset);
            return cntFoldFieldset;
        }
        static createLabelElement(_id, _parent, params = {}) {
            let label = document.createElement("label");
            if (params._value == undefined)
                params._value = _id;
            label.innerText = params._value;
            if (!params._cssClass == undefined)
                label.classList.add(params._cssClass);
            label.id = "_" + _id;
            _parent.appendChild(label);
            return label;
        }
        static createTextElement(_id, _parent, params = {}) {
            let valueInput = document.createElement("input");
            if (params._value == undefined)
                params._value = "";
            if (!params._cssClass == undefined)
                valueInput.classList.add(params._cssClass);
            valueInput.id = _id;
            valueInput.name = _id;
            valueInput.value = params._value;
            _parent.appendChild(valueInput);
            return valueInput;
        }
        static createCheckboxElement(_id, _value, _parent, _cssClass) {
            let valueInput = document.createElement("input");
            valueInput.type = "checkbox";
            valueInput.checked = _value;
            valueInput.classList.add(_cssClass);
            valueInput.name = _id;
            valueInput.id = _id;
            _parent.appendChild(valueInput);
            return valueInput;
        }
        static createStepperElement(_id, _parent, params = {}) {
            if (params._value == undefined)
                params._value = 0;
            let stepper = new FudgeUserInterface.Stepper(_id, { value: params._value });
            _parent.appendChild(stepper);
            return stepper;
        }
    }
    FudgeUserInterface.UIGenerator = UIGenerator;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    class UIAnimationList {
        constructor(_mutator, _listContainer) {
            this.collectMutator = () => {
                let children = this.listRoot.children;
                for (let child of children) {
                    this.mutator[child.name] = child.mutator;
                }
                console.log(this.mutator);
                return this.mutator;
            };
            this.toggleCollapse = (_event) => {
                _event.preventDefault();
                console.log(_event.target instanceof FudgeUserInterface.CollapsableAnimationListElement);
                if (_event.target instanceof FudgeUserInterface.CollapsableAnimationListElement) {
                    let target = _event.target;
                    target.collapse(target);
                }
            };
            this.mutator = _mutator;
            this.listRoot = document.createElement("ul");
            this.index = {};
            this.listRoot = this.buildFromMutator(this.mutator);
            _listContainer.append(this.listRoot);
            _listContainer.addEventListener("listCollapseEvent" /* COLLAPSE */, this.toggleCollapse);
            _listContainer.addEventListener("mutatorUpdateEvent" /* UPDATE */, this.collectMutator);
        }
        getMutator() {
            return this.mutator;
        }
        setMutator(_mutator) {
            this.mutator = _mutator;
            let hule = this.buildFromMutator(this.mutator);
            this.listRoot.replaceWith(hule);
            this.listRoot = hule;
        }
        getElementIndex() {
            return this.index;
        }
        updateMutator(_update) {
            this.mutator = this.updateMutatorEntry(_update, this.mutator);
            this.updateEntry(this.mutator, this.index);
        }
        updateEntry(_update, _index) {
            for (let key in _update) {
                if (typeof _update[key] == "object") {
                    this.updateEntry(_update[key], _index[key]);
                }
                else if (typeof _update[key] == "string" || "number") {
                    let element = _index[key];
                    element.value = _update[key];
                }
            }
        }
        updateMutatorEntry(_update, _toUpdate) {
            let updatedMutator = _toUpdate;
            for (let key in _update) {
                if (typeof updatedMutator[key] == "object") {
                    if (typeof updatedMutator[key] == "object") {
                        updatedMutator[key] = this.updateMutatorEntry(_update[key], updatedMutator[key]);
                    }
                }
                else if (typeof _update[key] == "string" || "number") {
                    if (typeof updatedMutator[key] == "string" || "number") {
                        updatedMutator[key] = _update[key];
                    }
                }
            }
            return updatedMutator;
        }
        buildFromMutator(_mutator) {
            let listRoot = document.createElement("ul");
            for (let key in _mutator) {
                let listElement = new FudgeUserInterface.CollapsableAnimationListElement(this.mutator[key], key);
                listRoot.append(listElement);
                this.index[key] = listElement.getElementIndex();
                console.log(this.index);
            }
            return listRoot;
        }
    }
    FudgeUserInterface.UIAnimationList = UIAnimationList;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    class UIListController {
    }
    FudgeUserInterface.UIListController = UIListController;
    class CollapsableListElement extends HTMLUListElement {
        constructor() {
            super();
            this.header = document.createElement("li");
            this.content = document.createElement("ul");
            this.appendChild(this.header);
            this.appendChild(this.content);
        }
        collapse(element) {
            element.content.classList.toggle("folded");
        }
    }
    class CollapsableNodeListElement extends CollapsableListElement {
        constructor(_node, _name, _unfolded = false) {
            super();
            this.selectNode = (_event) => {
                let event = new CustomEvent("nodeSelectionEvent" /* SELECTION */, { bubbles: true, detail: this.node });
                this.dispatchEvent(event);
            };
            this.collapseEvent = (_event) => {
                let event = new CustomEvent("listCollapseEvent" /* COLLAPSE */, { bubbles: true, detail: this });
                this.dispatchEvent(event);
            };
            this.node = _node;
            let buttonState;
            if (this.node.getChildren().length != 0)
                buttonState = "FoldButton";
            else
                buttonState = "invisible";
            let btnToggle = new FudgeUserInterface.ToggleButton(buttonState);
            btnToggle.setToggleState(_unfolded);
            btnToggle.addEventListener("click", this.collapseEvent);
            this.header.appendChild(btnToggle);
            let lblName = document.createElement("span");
            lblName.textContent = _name;
            lblName.addEventListener("click", this.selectNode);
            this.header.appendChild(lblName);
        }
    }
    FudgeUserInterface.CollapsableNodeListElement = CollapsableNodeListElement;
    class CollapsableAnimationListElement extends CollapsableListElement {
        constructor(_mutator, _name, _unfolded = false) {
            super();
            this.collapseEvent = (_event) => {
                let event = new CustomEvent("listCollapseEvent" /* COLLAPSE */, { bubbles: true, detail: this });
                this.dispatchEvent(event);
            };
            this.updateMutator = (_event) => {
                let target = _event.target;
                this.mutator[target.id] = parseFloat(target.value);
                _event.cancelBubble = true;
                let event = new CustomEvent("mutatorUpdateEvent" /* UPDATE */, { bubbles: true, detail: this.mutator });
                this.dispatchEvent(event);
            };
            this.mutator = _mutator;
            this.name = _name;
            this.index = {};
            let btnToggle = new FudgeUserInterface.ToggleButton("FoldButton");
            btnToggle.setToggleState(_unfolded);
            btnToggle.addEventListener("click", this.collapseEvent);
            this.header.appendChild(btnToggle);
            let lblName = document.createElement("span");
            lblName.textContent = _name;
            this.header.appendChild(lblName);
            this.buildContent(_mutator);
            this.content.addEventListener("input", this.updateMutator);
        }
        buildContent(_mutator) {
            for (let key in _mutator) {
                if (typeof _mutator[key] == "object") {
                    let newList = new CollapsableAnimationListElement(_mutator[key], key);
                    this.content.append(newList);
                    this.index[key] = newList.getElementIndex();
                }
                else {
                    let listEntry = document.createElement("li");
                    FudgeUserInterface.UIGenerator.createLabelElement(key, listEntry);
                    let inputEntry = FudgeUserInterface.UIGenerator.createStepperElement(key, listEntry, { _value: _mutator[key] });
                    this.content.append(listEntry);
                    this.index[key] = inputEntry;
                }
            }
        }
        getMutator() {
            return this.mutator;
        }
        setMutator(_mutator) {
            this.collapse(this.content);
            this.mutator = _mutator;
            this.buildContent(_mutator);
        }
        getElementIndex() {
            return this.index;
        }
    }
    FudgeUserInterface.CollapsableAnimationListElement = CollapsableAnimationListElement;
    customElements.define("ui-node-list", CollapsableNodeListElement, { extends: "ul" });
    customElements.define("ui-animation-list", CollapsableAnimationListElement, { extends: "ul" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
// / <reference types="../../../Core/Build/FudgeCore"/>
var FudgeUserInterface;
// / <reference types="../../../Core/Build/FudgeCore"/>
(function (FudgeUserInterface) {
    class UINodeList {
        constructor(_node, _listContainer) {
            this.updateList = (_event) => {
                this.setNodeRoot(this.nodeRoot);
            };
            this.toggleCollapse = (_event) => {
                _event.preventDefault();
                if (event.target instanceof FudgeUserInterface.CollapsableNodeListElement) {
                    let target = _event.target;
                    if (target.content.children.length > 1)
                        target.collapse(target);
                    else {
                        let nodeToExpand = target.node;
                        let newList = this.BuildListFromNode(nodeToExpand);
                        target.replaceWith(newList);
                    }
                }
            };
            this.nodeRoot = _node;
            this.nodeRoot.addEventListener("childAppend" /* CHILD_APPEND */, this.updateList);
            this.nodeRoot.addEventListener("childRemove" /* CHILD_REMOVE */, this.updateList);
            this.listRoot = document.createElement("ul");
            this.listRoot.classList.add("NodeList");
            let list = this.BuildListFromNode(this.nodeRoot);
            this.listRoot.appendChild(list);
            _listContainer.appendChild(this.listRoot);
            _listContainer.addEventListener("listCollapseEvent" /* COLLAPSE */, this.toggleCollapse);
        }
        getNodeRoot() {
            return this.nodeRoot;
        }
        setSelection(_node) {
            //TODO: Select Appropriate Entry
        }
        getSelection() {
            return this.selectedEntry.node;
        }
        setNodeRoot(_node) {
            this.nodeRoot = _node;
            this.listRoot = this.BuildListFromNode(this.nodeRoot);
            this.listRoot.classList.add("NodeList");
        }
        BuildListFromNode(_node) {
            let listRoot = new FudgeUserInterface.CollapsableNodeListElement(_node, _node.name, true);
            let nodeChildren = _node.getChildren();
            for (let child of nodeChildren) {
                let listItem = new FudgeUserInterface.CollapsableNodeListElement(child, child.name);
                listRoot.content.appendChild(listItem);
            }
            return listRoot;
        }
    }
    FudgeUserInterface.UINodeList = UINodeList;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    let NODEMENU;
    (function (NODEMENU) {
        NODEMENU["EMPTY"] = "Empty Node";
        NODEMENU["BOX"] = "Box Mesh Node";
        NODEMENU["PYRAMID"] = "Pyramid Mesh Node";
        NODEMENU["PLANE"] = "Plane Mesh Node";
    })(NODEMENU = FudgeUserInterface.NODEMENU || (FudgeUserInterface.NODEMENU = {}));
    let COMPONENTMENU;
    (function (COMPONENTMENU) {
        COMPONENTMENU["MESHBOX"] = "Mesh Component.Box Mesh Component";
        COMPONENTMENU["MESHPLANE"] = "Mesh Component.Plane Mesh Component";
        COMPONENTMENU["MESHPYRAMID"] = "Mesh Component.Pyramid Mesh Component";
        COMPONENTMENU["AUDIOLISTENER"] = "Audio Listener Component";
        COMPONENTMENU["AUDIO"] = "Audio Component";
        COMPONENTMENU["ANIMATION"] = "Animation Component";
        COMPONENTMENU["CAMERA"] = "Camera Component";
        COMPONENTMENU["LIGHT"] = "Light Component";
        COMPONENTMENU["SCRIPT"] = "Script Component";
        COMPONENTMENU["TRANSFORM"] = "Transform Component";
    })(COMPONENTMENU = FudgeUserInterface.COMPONENTMENU || (FudgeUserInterface.COMPONENTMENU = {}));
    class MultiLevelMenuManager {
        static buildFromSignature(_signature, _mutator) {
            let mutator = _mutator || {};
            let signatureLevels = _signature.split(".");
            if (signatureLevels.length > 1) {
                let subSignature = signatureLevels[1];
                for (let i = 2; i < signatureLevels.length; i++) {
                    subSignature = subSignature + "." + signatureLevels[i];
                }
                if (mutator[signatureLevels[0]] != null) {
                    mutator[signatureLevels[0]] = this.buildFromSignature(subSignature, mutator[signatureLevels[0]]);
                }
                else {
                    mutator[signatureLevels[0]] = this.buildFromSignature(subSignature);
                }
            }
            else {
                mutator[signatureLevels[0]] = signatureLevels[0];
            }
            return mutator;
        }
    }
    FudgeUserInterface.MultiLevelMenuManager = MultiLevelMenuManager;
})(FudgeUserInterface || (FudgeUserInterface = {}));
// / <reference types="../../../Core/Build/FudgeCore"/>
var FudgeUserInterface;
// / <reference types="../../../Core/Build/FudgeCore"/>
(function (FudgeUserInterface) {
    class UIMutable {
        constructor(mutable) {
            this.timeUpdate = 190;
            this.mutateOnInput = (_e) => {
                this.mutator = this.updateMutator(this.mutable, this.root);
                this.mutable.mutate(this.mutator);
            };
            this.refreshUI = (_e) => {
                this.mutable.updateMutator(this.mutator);
                this.updateUI(this.mutable, this.root);
            };
            this.root = document.createElement("div");
            this.mutable = mutable;
            this.mutator = mutable.getMutator();
            window.setInterval(this.refreshUI, this.timeUpdate);
            this.root.addEventListener("input", this.mutateOnInput);
        }
        updateMutator(_mutable, _root, _mutator, _types) {
            let mutator = _mutator || _mutable.getMutator();
            let mutatorTypes = _types || _mutable.getMutatorAttributeTypes(mutator);
            for (let key in mutator) {
                if (this.root.querySelector("#" + key) != null) {
                    let type = mutatorTypes[key];
                    if (type instanceof Object) {
                        let selectElement = _root.querySelector("#" + key);
                        selectElement.value = mutator[key];
                    }
                    else {
                        let element = _root.querySelector("#" + key);
                        let input = element;
                        switch (type) {
                            case "Boolean":
                                mutator[key] = input.checked;
                                break;
                            case "String":
                            case "Number":
                                mutator[key] = input.value;
                                break;
                            default:
                                let subMutator = mutator[key];
                                let subMutable;
                                subMutable = _mutable[key];
                                let subTypes = subMutable.getMutatorAttributeTypes(subMutator);
                                mutator[key] = this.updateMutator(subMutable, element, subMutator, subTypes);
                                break;
                        }
                    }
                }
            }
            return mutator;
        }
        updateUI(_mutable, _root) {
            let mutator = _mutable.getMutator();
            let mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
            for (let key in mutator) {
                if (this.root.querySelector("#" + key) != null) {
                    let type = mutatorTypes[key];
                    if (type instanceof Object) {
                        let selectElement = _root.querySelector("#" + key);
                        selectElement.value = mutator[key];
                    }
                    else {
                        switch (type) {
                            case "Boolean":
                                let checkbox = _root.querySelector("#" + key);
                                checkbox.checked = mutator[key];
                                break;
                            case "String":
                                let textfield = _root.querySelector("#" + key);
                                textfield.value = mutator[key];
                                break;
                            case "Number":
                                let stepper = _root.querySelector("#" + key);
                                if (document.activeElement != stepper) {
                                    stepper.value = mutator[key];
                                }
                                break;
                            default:
                                let fieldset = _root.querySelector("#" + key);
                                let subMutable = _mutable[key];
                                this.updateUI(subMutable, fieldset);
                                break;
                        }
                    }
                }
            }
        }
    }
    FudgeUserInterface.UIMutable = UIMutable;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    class UINodeData extends FudgeUserInterface.UIMutable {
        constructor(_mutable, _container) {
            super(_mutable);
            this.root = document.createElement("form");
            FudgeUserInterface.UIGenerator.createFromMutable(_mutable, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            _container.append(this.root);
        }
    }
    FudgeUserInterface.UINodeData = UINodeData;
})(FudgeUserInterface || (FudgeUserInterface = {}));
//# sourceMappingURL=FudgeUI.js.map