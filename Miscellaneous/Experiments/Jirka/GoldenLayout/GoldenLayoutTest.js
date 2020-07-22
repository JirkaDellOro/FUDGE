"use strict";
var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    let glDoc;
    window.addEventListener("load", start);
    function start() {
        let configPanel = {
            content: [{
                    type: "row",
                    content: [
                        {
                            type: "component",
                            componentName: "panel",
                            componentState: { text: "Panel 1" }
                        }, {
                            type: "component",
                            componentName: "panel",
                            componentState: { text: "Panel 2" }
                        }
                    ]
                }]
        };
        let Panel = /** @class */ (() => {
            class Panel {
                constructor(_container, _state) {
                    let div = document.createElement("div");
                    div.style.height = "100%";
                    div.style.width = "100%";
                    _container.getElement().append(div);
                    let gl = new GoldenLayout(Panel.config, div);
                    gl.registerComponent("example", example);
                    gl.on("stateChanged", () => gl.updateSize());
                    gl.init();
                }
            }
            Panel.config = {
                type: "row",
                content: [{
                        type: "stack",
                        content: [{
                                type: "component",
                                componentName: "example",
                                componentState: { text: "1" }
                            }, {
                                type: "component",
                                componentName: "example",
                                componentState: { text: "2" }
                            }, {
                                type: "component",
                                componentName: "example",
                                componentState: { text: "3" }
                            }]
                    }]
            };
            return Panel;
        })();
        function example(_container, _state) {
            let div = document.createElement("div");
            div.style.backgroundColor = "red";
            div.innerHTML = `<h2>${_state.text}</h2>`;
            _container.getElement().html(div);
        }
        glDoc = new GoldenLayout(configPanel);
        glDoc.registerComponent("panel", Panel);
        glDoc.init();
    }
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=GoldenLayoutTest.js.map