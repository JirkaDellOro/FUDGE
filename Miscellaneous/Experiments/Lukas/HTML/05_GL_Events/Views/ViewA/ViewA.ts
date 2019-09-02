namespace GLEventTest {
  export class ViewA extends View {

    constructor(_parent: Panel){
      super(_parent);
      this.config.title = "View A";
    }
    fillContent(){
      super.fillContent();
      this.content.innerHTML = "<h1>View A my friends</h1>";
    }
  }
}