namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  export class FoldableFieldSet extends HTMLFieldSetElement {
    public content: HTMLDivElement;
    private checkbox: HTMLInputElement;

    public constructor(_legend: string = "") {
      super();
      let cntLegend: HTMLLegendElement = document.createElement("legend");

      this.checkbox = document.createElement("input");
      this.checkbox.type = "checkbox";
      this.checkbox.checked = true;
      this.checkbox.tabIndex = -1;
      let lblTitle: HTMLSpanElement = document.createElement("span");
      lblTitle.textContent = _legend;
      this.appendChild(this.checkbox);
      cntLegend.appendChild(lblTitle);

      this.content = document.createElement("div");

      this.appendChild(cntLegend);
      this.appendChild(this.content);

      this.tabIndex = 0;
      this.addEventListener(EVENT.KEY_DOWN, this.hndKey);
      this.addEventListener(EVENT.FOCUS_NEXT, this.hndFocus);
      this.addEventListener(EVENT.FOCUS_PREVIOUS, this.hndFocus);
      this.addEventListener(EVENT.FOCUS_SET, this.hndFocus);
      // this.checkbox.addEventListener(EVENT_TREE.KEY_DOWN, this.hndKey);
    }

    private open(_open: boolean): void {
      this.checkbox.checked = _open;
    }
    private get isOpen(): boolean {
      return this.checkbox.checked;
    }

    private hndFocus = (_event: Event): void => {
      switch (_event.type) {
        case EVENT.FOCUS_NEXT:
          let next: HTMLElement = <HTMLElement>this.nextElementSibling;
          if (next && next.tabIndex > -1) {
            next.focus();
            _event.stopPropagation();
          }
          break;
        case EVENT.FOCUS_PREVIOUS:
          let previous: HTMLElement = <HTMLElement>this.previousElementSibling;
          if (previous && previous.tabIndex > -1) {
            let fieldsets: NodeListOf<HTMLFieldSetElement> = previous.querySelectorAll("fieldset");
            let i: number = fieldsets.length;
            if (i)
              do { // focus the last visible fieldset
                fieldsets[--i].focus();
              } while (!fieldsets[i].offsetParent);
            else
              previous.focus();


            _event.stopPropagation();
          }
          break;
        case EVENT.FOCUS_SET:
          if (_event.target != this) {
            this.focus();
            _event.stopPropagation();
          }
          break;
      }
    }

    private hndKey = (_event: KeyboardEvent): void => {
      _event.stopPropagation();
      // let target: HTMLElement = <HTMLElement>_event.target;

      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
          if (!this.isOpen) {
            this.open(true);
            return;
          }
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          let next: HTMLElement = this;
          if (this.isOpen)
            next = this.querySelector("fieldset");
          else
            do {
              next = <HTMLElement>next.nextElementSibling;
            } while (next && next.tabIndex > -1);

          if (next)
            next.focus();
          // next.dispatchEvent(new KeyboardEvent(EVENT_TREE.FOCUS_NEXT, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
          else
            this.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_NEXT, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
          break;
        case ƒ.KEYBOARD_CODE.ARROW_LEFT:
          if (this.isOpen) {
            this.open(false);
            return;
          }
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          let previous: HTMLElement = this;
          do {
            previous = <HTMLElement>previous.previousElementSibling;
          } while (previous && !(previous instanceof FoldableFieldSet));

          if (previous)
            if ((<FoldableFieldSet>previous).isOpen)
              this.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_PREVIOUS, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
            else
              previous.focus();
          else
            this.parentElement.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_SET, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
          break;
      }
    }
  }

  customElements.define("ui-fold-fieldset", FoldableFieldSet, { extends: "fieldset" });
}
