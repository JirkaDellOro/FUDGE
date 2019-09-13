"use strict";
/// <reference types="../@types/golden-layout"/>
var GLEventTest;
/// <reference types="../@types/golden-layout"/>
(function (GLEventTest) {
    class View {
        constructor(_parent) {
            this.parentPanel = _parent;
            this.fillContent();
            this.type = this.constructor.name;
            this.config = {
                type: "component",
                title: this.type,
                componentName: "View",
                componentState: { content: this.content, test: 123 }
            };
        }
        fillContent() {
            this.content = document.createElement("div");
            this.content.innerHTML = "<h1>View</h1>";
        }
        deconstruct() {
        }
    }
    GLEventTest.View = View;
    class Panel extends EventTarget {
        constructor(_name) {
            super();
            this.views = [];
            this.config = {
                type: "column",
                content: [],
                title: _name
            };
            let va = new GLEventTest.ViewA(this);
            // console.log(va);
            this.addView(va, false);
        }
        addView(_v, _pushToPanelManager = true) {
            this.views.push(_v);
            this.config.content.push(_v.config);
            if (_pushToPanelManager) {
                PanelManager.instance.addView(_v);
            }
        }
    }
    GLEventTest.Panel = Panel;
    class PanelManager extends EventTarget {
        constructor() {
            super();
            this.panels = [];
            let config = {
                content: [{
                        type: "stack",
                        isClosable: false,
                        content: [{
                                type: "component",
                                componentName: "welcome",
                                title: "Welcome"
                            }]
                    }]
            };
            this.gl = new GoldenLayout(config); //This might be a problem because it can't use a specific place to put it.
            this.gl.registerComponent("welcome", createWelcomeComponent);
            this.gl.registerComponent("View", createViewComponent);
            this.gl.init();
            // console.log("init: root?", this.gl.root);
        }
        addPanel(_p) {
            this.panels.push(_p);
            // console.log(this.root);
            // this.root.addChild(_p.config);
            // debugger;
            // this.gl.createContentItem(_p.config)
            // console.log(_p.config);
            this.gl.root.contentItems[0].addChild(_p.config);
        }
        addView(_v) {
            this.gl.root.contentItems[0].getActiveContentItem().addChild(_v.config);
        }
    }
    PanelManager.instance = new PanelManager();
    GLEventTest.PanelManager = PanelManager;
    function createWelcomeComponent(container) {
        container.getElement().html("<h1>Welcome. this is a test</h1>");
    }
    function createViewComponent(container, state) {
        // console.log(state);
        container.getElement().append(state.content);
        // container.getElement().html("<h1>This is a view!</h1>")
    }
})(GLEventTest || (GLEventTest = {}));
//# sourceMappingURL=Classes.js.map