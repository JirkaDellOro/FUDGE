"use strict";
var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    class Panel extends GoldenLayout {
        constructor(_container, _state) {
            let div = document.createElement("div");
            super(Panel.config, div);
            console.log(_container);
            div.style.height = "100%";
            div.style.width = "100%";
            _container.getElement().append(div);
            this.registerComponent("ViewA", GoldenLayoutTest.ViewA);
            this.registerComponent("ViewB", GoldenLayoutTest.ViewB);
            this.registerComponent("ViewC", GoldenLayoutTest.ViewC);
            this.on("stateChanged", this.hndStateChange.bind(this));
            this.init();
            document.addEventListener("keydown", this.hndKeyDown.bind(this));
            this.root.addChild({ type: "row", content: [] });
            this.root.contentItems[0].addChild({
                type: "column", content: [{
                        type: "component", componentName: "ViewA", componentState: { text: "1" }, title: "View1"
                    }]
            });
            this.root.contentItems[0].addChild({
                type: "column", content: [
                    { type: "component", componentName: "ViewB", componentState: { text: "2" }, title: "View2" },
                    { type: "component", componentName: "ViewC", componentState: { text: "3" }, title: "View3" }
                ]
            });
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
        hndStateChange() {
            // console.log(this);
            this.updateSize();
        }
        hndKeyDown() {
            console.log(this.toConfig());
        }
    }
    Panel.config = {
        type: "row",
        content: []
    };
    GoldenLayoutTest.Panel = Panel;
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=Panel.js.map