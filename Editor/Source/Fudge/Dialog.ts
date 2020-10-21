namespace Fudge {
  import ƒui = FudgeUserInterface;
  import ƒ = FudgeCore;

  export class Dialog {
    private static dom: HTMLDialogElement;

    public static async prompt(_mutator: ƒ.Mutator | Object, _head: string = "Headline", _callToAction: string = "Instruction"): Promise<boolean> {
      this.dom.innerHTML = "<h1>" + _head + "</h1>";

      let content: HTMLDivElement;
      content = ƒui.Generator.createInterfaceFromMutator(_mutator);
      content.id = "content";
      this.dom.appendChild(content);

      let div: HTMLDivElement = document.createElement("div");
      div.innerHTML = "<p>" + _callToAction + "</p>";
      let cancel: HTMLButtonElement = document.createElement("button");
      cancel.innerHTML = "Cancel";
      div.appendChild(cancel);
      let ok: HTMLButtonElement = document.createElement("button");
      ok.innerHTML = "OK";
      div.appendChild(ok);
      this.dom.appendChild(div);
      this.dom.showModal();

      return new Promise((_resolve) => {
        let hndButton: (_event: Event) => void = (_event: Event) => {
          cancel.removeEventListener("click", hndButton);
          ok.removeEventListener("click", hndButton);
          ƒui.Controller.getMutator(content, _mutator);
          this.dom.close();
          _resolve(_event.target == ok);
        };
        cancel.addEventListener("click", hndButton);
        ok.addEventListener("click", hndButton);
      });
    }

    public static create(): void {
      this.dom = document.createElement("dialog");
      document.body.appendChild(this.dom);
    }
  }
}