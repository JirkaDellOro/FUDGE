namespace FudgeUserInterface {
  // import ƒ = FudgeCore;

  // class MenuButton extends HTMLDivElement {
  //   name: string;
  //   private signature: string;
  //   public constructor(_name: string, textcontent: string, parentSignature: string) {
  //     super();
  //     this.name = _name;
  //     this.signature = parentSignature + "." + _name;
  //     let button: HTMLButtonElement = document.createElement("button");
  //     button.textContent = textcontent;
  //     this.append(button);
  //     button.addEventListener("click", this.resolveClick);
  //   }
  //   private resolveClick = (_event: MouseEvent): void => {
  //     let event: CustomEvent = new CustomEvent(EVENT_USERINTERFACE.DROPMENUCLICK, { detail: this.signature, bubbles: true });
  //     this.dispatchEvent(event);
  //   }

  // }
  // class MenuContent extends HTMLDivElement {

  //   public constructor(_submenu?: boolean) {
  //     super();
  //     if (_submenu) {
  //       this.classList.add("submenu-content");
  //     }
  //     else {
  //       this.classList.add("dropdown-content");
  //     }

  //   }
  // }

  // export class DropMenu extends HTMLDivElement {
  //   name: string;
  //   private content: MenuContent;
  //   private signature: string;

  //   public constructor(_name: string, _contentList: ƒ.Mutator, params: { _parentSignature?: string, _text?: string }) {
  //     super();
  //     let button: HTMLButtonElement = document.createElement("button");
  //     button.name = _name;
  //     if (params._text) {
  //       button.textContent = params._text;
  //     }
  //     else {
  //       button.textContent = _name;
  //     }

  //     button.addEventListener("click", this.toggleFoldContent);
  //     window.addEventListener("click", this.collapseMenu);
  //     let isSubmenu: boolean = (params._parentSignature != null);
  //     if (params._parentSignature) {
  //       this.signature = params._parentSignature + "." + _name;
  //     }
  //     else {
  //       this.signature = _name;
  //     }
  //     this.append(button);
  //     this.content = new MenuContent(isSubmenu);
  //     if (params._parentSignature) {
  //       this.classList.add("submenu");
  //     }
  //     else {
  //       this.classList.add("dropdown");
  //     }
  //     this.content.classList.toggle("folded");

  //     this.name = _name;
  //     for (let key in _contentList) {
  //       if (typeof _contentList[key] == "object") {
  //         let subMenu: DropMenu = new DropMenu(key, <ƒ.Mutator>_contentList[key], { _parentSignature: this.signature });
  //         this.content.append(subMenu);
  //       }
  //       else if (typeof _contentList[key] == "string") {
  //         let contentEntry: MenuButton = new MenuButton(key, <string>_contentList[key], this.signature);
  //         this.content.append(contentEntry);
  //       }

  //     }
  //     this.append(this.content);
  //   }

  //   private toggleFoldContent = (_event: MouseEvent): void => {
  //     this.content.classList.toggle("folded");
  //   }

  //   private collapseMenu = (_event: MouseEvent): void => {
  //     if (!(this.contains(<HTMLElement>_event.target))) {
  //       if (!this.content.classList.contains("folded")) {
  //         this.toggleFoldContent(_event);
  //       }
  //     }
  //   }
  // }

  // // customElements.define("ui-dropdown", DropMenu, { extends: "div" });
  // // customElements.define("ui-dropdown-button", MenuButton, { extends: "div" });
  // customElements.define("ui-dropdown-content", MenuContent, { extends: "div" });
}
