namespace FudgeUserInterface {

  /**
   * Static class to display a modal or non-modal warning.
   */
  export class Warning {
    public static dom: HTMLDialogElement;
    /**
     * Prompt the warning to the user with the given headline, call to action and labels for the cancel- and ok-button
     * Use `await` on call, to continue after the user has pressed one of the buttons.
     */
    public static prompt(_errors: string[] = [], _head: string = "Headline", _warning: string = "Warning", _ok: string = "OK"): void {
      Warning.dom = document.createElement("dialog");
      document.body.appendChild(Warning.dom);
      Warning.dom.innerHTML = "<h1>" + _head + "</h1>";

      let content: HTMLDivElement = document.createElement("div");
      content.id = "content";
      content.innerText = _errors.join("\n");
      Warning.dom.appendChild(content);

      let footer: HTMLElement = document.createElement("footer");
      footer.innerHTML = "<p>" + _warning + "</p>";
      let btnOk: HTMLButtonElement = document.createElement("button");
      btnOk.innerHTML = _ok;
      btnOk.onclick = () => {
        //@ts-ignore
        Warning.dom.close();
        Warning.dom.remove();
      };
      footer.appendChild(btnOk);
      Warning.dom.appendChild(footer);
      //@ts-ignore
      Warning.dom.showModal();
    }
  }
}