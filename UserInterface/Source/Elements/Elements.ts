// namespace FudgeUserInterface {
//     /**
//      * <select><option>Hallo</option></select>
//      */
//     import ƒ = FudgeCore;
//     export class ToggleButton extends HTMLButtonElement {
//         private toggleState: boolean;

//         public constructor(style: string) {
//             super();
//             this.type = "button";
//             this.toggleState = true;
//             this.classList.add(style);
//             this.classList.add("ToggleOn");
//             this.addEventListener("click", this.switchToggleState);
//         }
//         public setToggleState(toggleState: boolean): void {
//             this.toggleState = toggleState;
//             if (this.toggleState == true) {
//                 this.classList.add("ToggleOn");
//                 this.classList.remove("ToggleOff");
//             }
//             else {
//                 this.classList.remove("ToggleOn");
//                 this.classList.add("ToggleOff");
//             }
//         }
//         public getToggleState(): boolean {
//             return this.toggleState;
//         }
//         public toggle(): void {
//             this.setToggleState(!this.toggleState);
//         }
//         private switchToggleState = (_event: MouseEvent): void => {
//             this.setToggleState(!this.toggleState);
//         }
//     }


//     export class Stepper extends HTMLInputElement {
//         public constructor(_label: string, params: { min?: number, max?: number, step?: number, value?: number } = {}) {
//             super();
//             this.name = _label;
//             this.type = "number";
//             this.value = params.value.toString();
//             this.id = _label;
//             this.step = String(params.step) || "1";
//         }
//     }

//     export class FoldableFieldSet extends HTMLFieldSetElement {
//         public constructor(_legend: string) {
//             super();
//             let cntLegend: HTMLLegendElement = document.createElement("legend");
//             cntLegend.classList.add("unfoldable");
//             let btnFoldButton: HTMLButtonElement = new ToggleButton("FoldButton");
//             btnFoldButton.addEventListener("click", this.toggleFoldElement);
//             // btnfoldButton.classList.add("unfoldable");
//             let lblTitle: HTMLSpanElement = document.createElement("span");
//             lblTitle.textContent = _legend;
//             // lblTitle.classList.add("unfoldable");
//             cntLegend.appendChild(btnFoldButton);
//             cntLegend.appendChild(lblTitle);

//             this.appendChild(cntLegend);
//         }

//         private toggleFoldElement = (_event: MouseEvent): void => {
//             _event.preventDefault();
//             if (_event.target != _event.currentTarget) return;
//             //Get the fieldset the button belongs to
//             let children: HTMLCollection = this.children;
//             //fold or unfold all children that aren't unfoldable
//             for (let child of children) {
//                 if (!child.classList.contains("unfoldable")) {
//                     child.classList.toggle("folded");
//                 }
//             }
//         }
//     }
//     class MenuButton extends HTMLDivElement {
//         name: string;
//         private signature: string;
//         public constructor(_name: string, textcontent: string, parentSignature: string) {
//             super();
//             this.name = _name;
//             this.signature = parentSignature + "." + _name;
//             let button: HTMLButtonElement = document.createElement("button");
//             button.textContent = textcontent;
//             this.append(button);
//             button.addEventListener("click", this.resolveClick);
//         }
//         private resolveClick = (_event: MouseEvent): void => {
//             let event: CustomEvent = new CustomEvent(EVENT_USERINTERFACE.DROPMENUCLICK, { detail: this.signature, bubbles: true });
//             this.dispatchEvent(event);
//         }

//     }
//     class MenuContent extends HTMLDivElement {

//         public constructor(_submenu?: boolean) {
//             super();
//             if (_submenu) {
//                 this.classList.add("submenu-content");
//             }
//             else {
//                 this.classList.add("dropdown-content");
//             }

//         }
//     }
//     export class DropMenu extends HTMLDivElement {
//         name: string;
//         private content: MenuContent;
//         private signature: string;

//         public constructor(_name: string, _contentList: ƒ.Mutator, params: { _parentSignature?: string, _text?: string }) {
//             super();
//             let button: HTMLButtonElement = document.createElement("button");
//             button.name = _name;
//             if (params._text) {
//                 button.textContent = params._text;
//             }
//             else {
//                 button.textContent = _name;
//             }

//             button.addEventListener("click", this.toggleFoldContent);
//             window.addEventListener("click", this.collapseMenu);
//             let isSubmenu: boolean = (params._parentSignature != null);
//             if (params._parentSignature) {
//                 this.signature = params._parentSignature + "." + _name;
//             }
//             else {
//                 this.signature = _name;
//             }
//             this.append(button);
//             this.content = new MenuContent(isSubmenu);
//             if (params._parentSignature) {
//                 this.classList.add("submenu");
//             }
//             else {
//                 this.classList.add("dropdown");
//             }
//             this.content.classList.toggle("folded");

//             this.name = _name;
//             for (let key in _contentList) {
//                 if (typeof _contentList[key] == "object") {
//                     let subMenu: DropMenu = new DropMenu(key, <ƒ.Mutator>_contentList[key], { _parentSignature: this.signature });
//                     this.content.append(subMenu);
//                 }
//                 else if (typeof _contentList[key] == "string") {
//                     let contentEntry: MenuButton = new MenuButton(key, <string>_contentList[key], this.signature);
//                     this.content.append(contentEntry);
//                 }

//             }
//             this.append(this.content);
//         }

//         private toggleFoldContent = (_event: MouseEvent): void => {
//             this.content.classList.toggle("folded");
//         }

//         private collapseMenu = (_event: MouseEvent): void => {
//             if (!(this.contains(<HTMLElement>_event.target))) {
//                 if (!this.content.classList.contains("folded")) {
//                     this.toggleFoldContent(_event);
//                 }
//             }
//         }
//     }

//     customElements.define("ui-stepper", Stepper, { extends: "input" });
//     customElements.define("ui-toggle-button", ToggleButton, { extends: "button" });
//     customElements.define("ui-fold-fieldset", FoldableFieldSet, { extends: "fieldset" });
//     customElements.define("ui-dropdown", DropMenu, { extends: "div" });
//     customElements.define("ui-dropdown-button", MenuButton, { extends: "div" });
//     customElements.define("ui-dropdown-content", MenuContent, { extends: "div" });
// }
