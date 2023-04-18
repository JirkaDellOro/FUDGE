namespace FudgeUserInterface {

  /**
   * Static class to display a modal warning.
   */
  export class Warning {
    /**
     * Display a warning to the user with the given headline, warning text and ok butten text.
     */
    public static display(_errors: string[] = [], _headline: string = "Headline", _warning: string = "Warning", _ok: string = "OK"): void {
      let warning: HTMLDialogElement = document.createElement("dialog");
      document.body.appendChild(warning);
      warning.innerHTML = "<h1>" + _headline + "</h1>";

      let content: HTMLDivElement = document.createElement("div");
      content.id = "content";
      content.innerText = _errors.join("\n");
      warning.appendChild(content);

      let footer: HTMLElement = document.createElement("footer");
      footer.innerHTML = "<p>" + _warning + "</p>";
      let btnOk: HTMLButtonElement = document.createElement("button");
      btnOk.innerHTML = _ok;
      btnOk.onclick = () => {
        //@ts-ignore
        warning.close();
        warning.remove();
      };
      footer.appendChild(btnOk);
      warning.appendChild(footer);
      //@ts-ignore
      warning.showModal();
    }
  }
}