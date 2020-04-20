namespace FudgeUserInterface {
  export class CustomElementTextInput extends CustomElement {
    // @ts-ignore
    private static customElement: void = CustomElement.register("fudge-textinput", CustomElementTextInput, String);

    constructor(_attributes: CustomElementAttributes) {
      super(_attributes);
    }

    connectedCallback(): void {
      if (this.initialized)
        return;
      this.initialized = true;

      let input: HTMLInputElement = document.createElement("input");
      input.id = CustomElement.nextId;
      this.appendChild(input);

      this.appendLabel();
    }
  }
}