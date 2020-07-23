"use strict";
var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    let glDoc;
    window.addEventListener("load", start);
    class Panel extends GoldenLayout {
        constructor(_container = null, _state) {
            // let gl: GoldenLayout = new GoldenLayout(Panel.config, div);
            let div = document.createElement("div");
            super(Panel.config, div);
            // let div: HTMLDivElement = document.createElement("div");
            // console.log(div, this.container);
            console.log(_container);
            div.style.height = "100%";
            div.style.width = "100%";
            if (_container)
                _container.getElement().append(div);
            this.registerComponent("example", example);
            this.on("stateChanged", () => this.updateSize());
            this.init();
        }
        static add() {
            let config = {
                type: "stack",
                content: [{
                        type: "component",
                        componentName: "panel",
                        componentState: { text: "Panel 3" },
                        title: "Panel3"
                    }]
            };
            glDoc.root.contentItems[0].addChild(config);
        }
    }
    Panel.config = {
        type: "row",
        content: [{
                type: "stack",
                content: [{
                        type: "component",
                        componentName: "example",
                        componentState: { text: "1" },
                        title: "Example1"
                    }, {
                        type: "component",
                        componentName: "example",
                        componentState: { text: "2" },
                        title: "Example2"
                    }, {
                        type: "component",
                        componentName: "example",
                        componentState: { text: "3" },
                        title: "Example3"
                    }]
            }]
    };
    let configPanel = {
        content: [{
                type: "row",
                content: [
                    {
                        type: "component",
                        componentName: "panel",
                        componentState: { text: "Panel 1" },
                        title: "Panel1"
                    }, {
                        type: "component",
                        componentName: "panel",
                        componentState: { text: "Panel 2" },
                        title: "Panel2"
                    }
                ]
            }]
    };
    function start() {
        let btnAdd = document.querySelector("button");
        btnAdd.addEventListener("click", Panel.add);
        glDoc = new GoldenLayout(configPanel);
        glDoc.registerComponent("panel", Panel);
        glDoc.init();
    }
    function example(_container, _state) {
        let div = document.createElement("div");
        div.style.backgroundColor = "red";
        div.innerHTML = `<h2>${_state.text}</h2>`;
        _container.getElement().html(div);
    }
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=GoldenLayoutTest.js.map