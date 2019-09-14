namespace GLEventTest {
  export class ViewB extends View {
    constructor(_parent: Panel) {
      super(_parent);
      this.config.title = "View B";
      this.addEvents();
    }

    fillContent(): void {
      this.content = document.createElement("div");
      this.content.innerHTML = "<h1>This is View B</h1>";
    }

    addEvents(){
      this.parentPanel.addEventListener("change", this.changeHandler.bind(this));
    }

    changeHandler(_e: CustomEvent){
      this.content.innerHTML = "<h1>There was a click!</h1>";
      console.log(_e.detail);
      this.content.appendChild(_e.detail);
    }
  }
}