namespace GLEventTest {
  export class ViewA extends View {

    constructor(_parent: Panel){
      super(_parent);
      this.config.title = "View A";
    }
    fillContent(){
      super.fillContent();
      let button: HTMLButtonElement = document.createElement("button");
      button.innerText = "click me";
      button.addEventListener("click", this.handleButtonClick.bind(this));

      this.content.appendChild(button);
      // this.content.innerHTML = "<h1>View A my friends</h1>";
    }

    handleButtonClick(_e:Event){
      console.log(_e.target);
      let e: Event = new CustomEvent("change", {detail: _e.target});
      this.parentPanel.dispatchEvent(e);
    }
  }
}