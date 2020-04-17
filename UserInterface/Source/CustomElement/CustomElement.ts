namespace FudgeUserInterface {
  export abstract class CustomElement extends HTMLElement {
    private static idCounter: number = 0;
    protected initialized: boolean = false;

    public constructor(_key: string) {
      super();
      if (_key)
        this.setAttribute("key", _key);
    }

    public get key(): string {
      return this.getAttribute("key");
    }

    public static get nextId(): string {
      return "ƒ" + CustomElement.idCounter++;
    }
  }
}