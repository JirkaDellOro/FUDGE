"use strict";
var AddComp;
(function (AddComp) {
    let config = {
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
    let gl = new GoldenLayout(config);
    gl.registerComponent("test", createTest);
    gl.init();
    // gl.on("close", stateChanged);
    function stateChanged(_thing) {
        console.log(_thing.config.componentState);
    }
    function createTest(_container, _state) {
        _container.getElement().html("<span>" + _state.text + "</span>");
        _container.on("destroy", stateChanged);
    }
})(AddComp || (AddComp = {}));
//# sourceMappingURL=CloseEvent.js.map