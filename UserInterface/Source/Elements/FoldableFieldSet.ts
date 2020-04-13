namespace FudgeUserInterface {
  //import ƒ = FudgeCore;

  export class FoldableFieldSet extends HTMLFieldSetElement {
    public content: HTMLDivElement;

    public constructor(_legend: string) {
      super();
      let cntLegend: HTMLLegendElement = document.createElement("legend");
      
      let cntFold: HTMLInputElement = document.createElement("input");
      cntFold.type = "checkbox";
      cntFold.checked = true;
      let lblTitle: HTMLSpanElement = document.createElement("span");
      lblTitle.textContent = _legend;
      this.appendChild(cntFold);
      cntLegend.appendChild(lblTitle);

      this.content = document.createElement("div");

      this.appendChild(cntLegend);
      this.appendChild(this.content);
    }
  }

  customElements.define("ui-fold-fieldset", FoldableFieldSet, { extends: "fieldset" });
}
