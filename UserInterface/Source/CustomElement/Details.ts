namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  export class Details extends HTMLDetailsElement {
    public content: HTMLDivElement;

    public constructor(_legend: string = "", _type: string) {
      super();
      this.setAttribute("key", _legend);
      this.setAttribute("type", _type);
      this.open = true;
      let lblSummary: HTMLElement = document.createElement("summary");
      lblSummary.textContent = _legend;
      this.appendChild(lblSummary);

      this.content = document.createElement("div");
      this.appendChild(this.content);

      this.tabIndex = 0;
      this.addEventListener(EVENT.KEY_DOWN, this.hndKey);
      this.addEventListener(EVENT.FOCUS_NEXT, this.hndFocus);
      this.addEventListener(EVENT.FOCUS_PREVIOUS, this.hndFocus);
      this.addEventListener(EVENT.FOCUS_SET, this.hndFocus);
      this.addEventListener(EVENT.TOGGLE, this.hndToggle);
    }


    public get isExpanded(): boolean {
      // return this.expander.checked;
      return this.open;
    }

    public setContent(_content: HTMLDivElement): void {
      this.replaceChild(_content, this.content);
      this.content = _content;
    }

    public expand(_expand: boolean): void {
      // this.expander.checked = _expand;
      this.open = _expand;
      this.hndToggle(null);
    }

    private hndToggle = (_event: Event): void => {
      if (_event)
        _event.stopPropagation();
      this.dispatchEvent(new Event(this.isExpanded ? EVENT.EXPAND : EVENT.COLLAPSE, { bubbles: true }));
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
            let sets: NodeListOf<HTMLDetailsElement> = previous.querySelectorAll("details");
            let i: number = sets.length;
            if (i)
              do { // focus the last visible set
                sets[--i].focus();
              } while (!sets[i].offsetParent);
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
          if (!this.isExpanded) {
            this.expand(true);
            return;
          }
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          let next: HTMLElement = this;
          if (this.isExpanded)
            next = this.querySelector("details");
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
          if (this.isExpanded) {
            this.expand(false);
            return;
          }
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          let previous: HTMLElement = this;
          do {
            previous = <HTMLElement>previous.previousElementSibling;
          } while (previous && !(previous instanceof Details));

          if (previous)
            if ((<Details>previous).isExpanded)
              this.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_PREVIOUS, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
            else
              previous.focus();
          else
            this.parentElement.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_SET, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
          break;
      }
    }
  }
  // TODO: use CustomElement.register?
  customElements.define("ui-details", Details, { extends: "details" });
}
