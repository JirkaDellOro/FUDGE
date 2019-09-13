namespace AddComp {
  let config: GoldenLayout.Config = {
    content: [{
      type: "stack",
      isClosable: false,
      content: [{
        type: "column",
        componentName: "test",
        title: "stack",
        componentState: { text: "Stack" },
        content: [{
          type: "component",
          componentName: "test",
          componentState: { text: "Component 1.1" }
        }, {
          type: "component",
          componentName: "test",
          componentState: { text: "Component 1.2" }
        }, {
          type: "component",
          componentName: "test",
          componentState: { text: "Component 1.3" }
        }, {
          type: "component",
          componentName: "test",
          componentState: { text: "Component 1.4" }
        }]
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

  // gl.on("close", stateChanged);

  function stateChanged(_thing: any) {
    console.log(_thing.config.componentState);
  }

  function createTest(_container: GoldenLayout.Container, _state: any) {
    _container.getElement().html("<span>" + _state.text + "</span>");
    _container.on("destroy",stateChanged);
  }
}