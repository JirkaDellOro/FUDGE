namespace Fudge {
  import ƒui = FudgeUserInterface;
  import ƒ = FudgeCore;

  export class Dialog {
    private static dom: HTMLDialogElement;

    public static async prompt(_mutable: ƒ.Mutable, _head: string = "Additional information needed", _callToAction: string = "Enter information and hit OK"): Promise<boolean> {
      this.dom.innerHTML = "<h1>" + _head + "</h1>";
      let content: ƒui.ExpandableFieldSet = ƒui.Generator.createFieldSetFromMutable(_mutable);
      this.dom.appendChild(content);
      let div: HTMLDivElement = document.createElement("div");
      div.innerHTML = "<p>" + _callToAction + "</p>";
      div.innerHTML += "<button type='button'>Cancel</Button><button type='button'>OK</button>";
      this.dom.appendChild(div);
      this.dom.showModal();
      return true;
    }

    public static create(): void {
      this.dom = document.createElement("dialog");
      document.body.appendChild(this.dom);
    }
  }

  export class DialogMutable extends ƒ.Mutable {
    constructor(_object: Object) {
      super();
      for (let key in _object) 
        this[key] = _object[key];
    }
    protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
  }
}