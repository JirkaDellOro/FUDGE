namespace FudgeUserInterface {
  //import ƒ = FudgeCore;

  export class FoldableFieldSet extends HTMLFieldSetElement {
    private cntFold: HTMLInputElement;

    public constructor(_legend: string) {
      super();
      let cntLegend: HTMLLegendElement = document.createElement("legend");
      // cntLegend.classList.add("unfoldable");
      // let btnFoldButton: HTMLButtonElement = new ToggleButton("FoldButton");
      // btnFoldButton.addEventListener("click", this.toggleFoldElement);
      // btnfoldButton.classList.add("unfoldable");
      
      this.cntFold = document.createElement("input");
      this.cntFold.type = "checkbox";
      let lblTitle: HTMLSpanElement = document.createElement("span");
      lblTitle.textContent = _legend;
      // lblTitle.classList.add("unfoldable");
      cntLegend.appendChild(this.cntFold);
      cntLegend.appendChild(lblTitle);

      this.appendChild(cntLegend);
    }

    // private toggleFoldElement = (_event: MouseEvent): void => {
    //   _event.preventDefault();
    //   if (_event.target != _event.currentTarget) return;
    //   //Get the fieldset the button belongs to
    //   let children: HTMLCollection = this.children;
    //   //fold or unfold all children that aren't unfoldable
    //   for (let child of children) {
    //     if (!child.classList.contains("unfoldable")) {
    //       child.classList.toggle("folded");
    //     }
    //   }
    // }
  }

  customElements.define("ui-fold-fieldset", FoldableFieldSet, { extends: "fieldset" });
}
