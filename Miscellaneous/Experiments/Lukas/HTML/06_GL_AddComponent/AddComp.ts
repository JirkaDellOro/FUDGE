namespace AddComp {
  let config: GoldenLayout.Config = {
    content: [{
      type: "stack",
      isClosable: false,
      content: [{
        type: "component",
        componentName: "test",
        componentState: { text: "Component 1" }
      }, {
        type: "component",
        componentName: "test",
        componentState: { text: "Component 2" }
      }]
    }]
  };

  let gl: GoldenLayout = new GoldenLayout(config);

  gl.registerComponent("test", createTest);
  gl.init();

  setTimeout(addComponent, 2000);

  function createTest(_container: GoldenLayout.Container, _state: any) {
    console.log("state", _state.content);
    if (_state.content) {
      _container.getElement().append(_state.content);
    } else {
      _container.getElement().html("<span>" + _state.text + "</span>");
    }
  }

  function addComponent() {
    let div: HTMLDivElement = document.createElement("div");
    div.innerHTML = "Hello";

    let newItemConf: any = {
      type: "component",
      componentName: "test",
      componentState: { text: "New Component", content: div }
    }
    console.log(gl.root);
    gl.root.contentItems[0].addChild(newItemConf);
  }
}