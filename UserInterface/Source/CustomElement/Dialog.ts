namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  /**
   * Static class to display a modal or non-modal dialog with an interface for the given mutator.
   */
  export class Dialog {
    public static dom: HTMLDialogElement;
    /**
     * Prompt the dialog to the user with the given headline, call to action and labels for the cancel- and ok-button
     * Use `await` on call, to continue after the user has pressed one of the buttons.
     */
    public static async prompt(_data: ƒ.Mutable | ƒ.Mutator | Object, _modal: boolean = true, _head: string = "Headline", _callToAction: string = "Instruction", _ok: string = "OK", _cancel: string = "Cancel"): Promise<boolean> {
      Dialog.dom = document.createElement("dialog");
      document.body.appendChild(Dialog.dom);
      Dialog.dom.innerHTML = "<h1>" + _head + "</h1>";

      let content: HTMLDivElement;
      if (_data instanceof ƒ.Mutable)
        content = Generator.createInterfaceFromMutable(_data);
      else
        content = Generator.createInterfaceFromMutator(_data);
      content.id = "content";
      Dialog.dom.appendChild(content);

      let footer: HTMLElement = document.createElement("footer");
      footer.innerHTML = "<p>" + _callToAction + "</p>";
      let btnCancel: HTMLButtonElement = document.createElement("button");
      btnCancel.innerHTML = _cancel;
      footer.appendChild(btnCancel);
      let btnOk: HTMLButtonElement = document.createElement("button");
      btnOk.innerHTML = _ok;
      footer.appendChild(btnOk);
      Dialog.dom.appendChild(footer);
      if (_modal)
        //@ts-ignore
        Dialog.dom.showModal();
      else
        //@ts-ignore
        Dialog.dom.show();

      return new Promise((_resolve) => {
        let hndButton: (_event: Event) => void = (_event: Event) => {
          btnCancel.removeEventListener("click", hndButton);
          btnOk.removeEventListener("click", hndButton);
          if (_event.target == btnOk)
            try {
              Controller.updateMutator(content, _data);
            } catch (_e) {
              ƒ.Debug.info(_e);
            }
          //@ts-ignore
          Dialog.dom.close();
          document.body.removeChild(Dialog.dom);
          _resolve(_event.target == btnOk);
        };
        btnCancel.addEventListener(EVENT.CLICK, hndButton);
        btnOk.addEventListener(EVENT.CLICK, hndButton);
      });
    }
  }
}