namespace GLEventTest {
  export class ViewB extends View {
    fillContent(): void {
      this.content = document.createElement("div");
      this.content.innerHTML = "<h1>This is View B</h1>";
    }
  }
}