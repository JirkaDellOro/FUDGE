namespace Fudge {
  export class DropdownHandler {
    private controller: Controller;

    constructor(_controller: Controller) {
      this.controller = _controller;
      let container: HTMLDivElement = document.createElement("div");
      container.style.borderWidth = "0px";

      window.addEventListener("click", this.closeMenu);
      ƒ.EventTargetStatic.addEventListener(MODELLER_EVENTS.HEADER_UPDATE, this.updateButtontext);
    }

    public getControlDropdown(): HTMLDivElement {
      let template: HTMLTemplateElement = document.querySelector("#dropdown-template");
      let dropdownControl: HTMLDivElement = <HTMLDivElement> template.content.cloneNode(true);
      dropdownControl.querySelector(".dropdown-content").id = "control-dropdown";
      let button: HTMLButtonElement = dropdownControl.querySelector(".dropbtn");
      button.addEventListener("click", this.openDropdownControl);
      button.id = "control-button";
      button.innerHTML = this.controller.controlMode.type;
      
      return dropdownControl;
    }

    public getInteractionDropdown(): HTMLDivElement {
      let template: HTMLTemplateElement = document.querySelector("#dropdown-template");
      let dropdownInteraction: HTMLDivElement = <HTMLDivElement> template.content.cloneNode(true);
      dropdownInteraction.querySelector(".dropdown-content").id = "interaction-dropdown";
      let buttonInteraction: HTMLButtonElement = dropdownInteraction.querySelector(".dropbtn");
      buttonInteraction.addEventListener("click", this.openDropdownInteraction);
      buttonInteraction.id = "interaction-button";
      buttonInteraction.innerHTML = this.controller.getInteractionModeType();
      return dropdownInteraction;
    }

    private openDropdownControl = (): void => {
      let dropdown: HTMLDivElement = document.querySelector("#control-dropdown");
      while (dropdown.firstChild) {
        dropdown.removeChild(dropdown.lastChild);
      }
      for (let [name, value] of this.controller.controlModes) {
        let button: HTMLButtonElement = document.createElement("button");
        button.innerHTML = name;
        button.classList.add("content-button");
        button.addEventListener("click", this.setControlMode.bind(null, name));
        let accelerator: HTMLDivElement = document.createElement("div");
        accelerator.classList.add("accelerator");
        accelerator.innerHTML = "Shift + " + value.shortcut;
        button.appendChild(accelerator);        
        dropdown.appendChild(button);
      }

      dropdown.classList.toggle("show");
    }

    private openDropdownInteraction = (): void => {
      let dropdown: HTMLDivElement = document.querySelector("#interaction-dropdown");
      while (dropdown.firstChild) {
        dropdown.removeChild(dropdown.lastChild);
      }
      for (let mode in this.controller.controlMode.modes) {
        let button: HTMLButtonElement = document.createElement("button");
        button.classList.add("content-button");
        button.innerHTML = mode;
        button.addEventListener("click", this.setInteractionMode.bind(null, mode));
        let accelerator: HTMLDivElement = document.createElement("div");
        accelerator.classList.add("accelerator");
        accelerator.innerHTML = "Shift + " + this.controller.controlMode.modes[mode].shortcut;
        button.appendChild(accelerator);        
        dropdown.appendChild(button);
      }
      dropdown.classList.toggle("show");
    }

    private setInteractionMode = (_name: INTERACTION_MODE, _event: Event): void => {
      this.controller.setInteractionMode(_name);
    }

    private setControlMode = (_name: CONTROL_MODE, _event: Event): void => {
      this.controller.setControlMode(_name);
    }

    private updateButtontext = (): void => {
      let controlButton: HTMLDivElement = document.querySelector("#control-button");
      if (controlButton)
        controlButton.innerHTML = this.controller.controlMode.type;
      let interactionButton: HTMLDivElement = document.querySelector("#interaction-button");
      if (interactionButton)
        interactionButton.innerHTML = this.controller.getInteractionModeType();
    }

    private closeMenu = (_event: ƒ.EventPointer): void => {
      if (!(<HTMLButtonElement>_event.target).matches(".dropbtn")) {
        var dropdowns: HTMLCollectionOf<Element> = document.getElementsByClassName("dropdown-content");
        for (let i: number = 0; i < dropdowns.length; i++) {
          var openDropdown: Element = dropdowns[i];
          if (openDropdown.classList.contains("show")) {
            openDropdown.classList.remove("show");
          }
        }
      }
    }
  }
}