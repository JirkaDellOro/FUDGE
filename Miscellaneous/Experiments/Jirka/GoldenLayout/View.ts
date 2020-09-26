namespace GoldenLayoutTest {

  export class View {
    protected container: HTMLElement;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      this.container = document.createElement("div");
      _container.getElement().append(this.container);
    }
  }

  export class ViewA extends View {
    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      this.container.style.backgroundColor = "red";
      this.container.innerHTML = `<h2>${(<any>_state).text}</h2>`;
    }
  }

  export class ViewB extends View {
    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      this.container.style.backgroundColor = "blue";
      this.container.innerHTML = `<h2>${(<any>_state).text}</h2>`;
    }
  }

  export class ViewC extends View {
    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      this.container.style.backgroundColor = "green";
      this.container.innerHTML = `<h2>${(<any>_state).text}</h2>`;
    }
  }
}