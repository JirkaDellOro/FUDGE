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
                        }, {
                            type: "component",
                            componentName: "panel",
                            componentState: { text: "Panel 3" }
                        }
                    ]
                }]
        };
        let configViews = {
            type: "row",
            content: [{
                    type: "component",
                    componentName: "example",
                    componentState: { text: "1" }
                }, {
                    type: "component",
                    componentName: "example",
                    componentState: { text: "2" }
                }]
        };
        function panel(_container, _state) {
            let div = document.createElement("div");
            div.style.height = "100%";
            // document.body.appendChild(div);
            _container.getElement().html(div);
            let gl = new GoldenLayout(configViews, div);
            gl.registerComponent("example", example);
            // gl.registerComponent("panel", panel);
            gl.init();
        }
        function example(_container, _state) {
            let div = document.createElement("div");
            div.style.backgroundColor = "red";
            div.innerHTML = `<h2>${_state.text}</h2>`;
            _container.getElement().html(div);
        }
        glDoc = new GoldenLayout(configPanel);
        glDoc.registerComponent("panel", panel);
        glDoc.init();
    }
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=GoldenLayoutTest.js.map