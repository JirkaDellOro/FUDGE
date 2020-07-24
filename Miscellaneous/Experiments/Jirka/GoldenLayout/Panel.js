"use strict";
var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    class Panel extends GoldenLayout {
        constructor(_container, _state) {
            // let gl: GoldenLayout = new GoldenLayout(Panel.config, div);
            let div = document.createElement("div");
            super(Panel.config, div);
            // let div: HTMLDivElement = document.createElement("div");
            // console.log(div, this.container);
            console.log(_container);
            div.style.height = "100%";
            div.style.width = "100%";
            _container.getElement().append(div);
            this.registerComponent("ViewA", GoldenLayoutTest.ViewA);
            this.registerComponent("ViewB", GoldenLayoutTest.ViewB);
            this.registerComponent("ViewC", GoldenLayoutTest.ViewC);
            this.on("stateChanged", () => this.updateSize());
            this.init();
        }
        static add() {
            let config = {
                type: "stack",
                content: [{
                        type: "component",
                        componentName: "Panel",
                        componentState: { text: "Panel 3" },
                        title: "Panel3"
                    }]
            };
            GoldenLayoutTest.glDoc.root.contentItems[0].addChild(config);
        }
    }
    Panel.config = {
        type: "row",
        content: [{
                type: "stack",
                content: [{
                        type: "component",
                        componentName: "ViewA",
                        componentState: { text: "1" },
                        title: "View1"
                    }, {
                        type: "component",
                        componentName: "ViewB",
                        componentState: { text: "2" },
                        title: "View2"
                    }, {
                        type: "component",
                        componentName: "ViewC",
                        componentState: { text: "3" },
                        title: "View3"
                    }]
            }]
    };
    GoldenLayoutTest.Panel = Panel;
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=Panel.js.map