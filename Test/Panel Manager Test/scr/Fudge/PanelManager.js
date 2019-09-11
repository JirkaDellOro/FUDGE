/// <reference types="../../../@types/jquery"/>
/// <reference types="../../../@types/golden-layout"/>
var Fudge;
(function (Fudge) {
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    class PanelManager extends EventTarget {
        constructor() {
            super();
            this.panels = [];
        }
        createPanelFromTemplate(_template, _name) {
            let panel = new Fudge.Panel(_name, _template);
            console.log(panel);
            return panel;
        }
        createEmptyPanel(_name) {
            let panel = new Fudge.Panel(_name);
            return panel;
        }
        addPanel(_p) {
            this.panels.push(_p);
            for (let view of _p.views) {
                // console.log(view);
            }
            this.editorLayout.root.contentItems[0].addChild(_p.config);
        }
        addView(_v) {
            console.log("Add View has been called at PM");
            this.editorLayout.root.contentItems[0].getActiveContentItem().addChild(_v.config);
        }
        init() {
            let config = {
                content: [{
                        type: "stack",
                        isClosable: false,
                        content: [
                            {
                                type: "component",
                                componentName: "welcome",
                                title: "Welcome",
                                componentState: {}
                            }
                        ]
                    }]
            };
            this.editorLayout = new GoldenLayout(config); //This might be a problem because it can't use a specific place to put it.
            this.editorLayout.registerComponent("welcome", welcome);
            this.editorLayout.registerComponent("View", registerViewComponent);
            this.editorLayout.init();
        }
    }
    PanelManager.instance = new PanelManager();
    Fudge.PanelManager = PanelManager;
    function welcome(container, state) {
        container.getElement().html("<div>Welcome</div>");
    }
    function registerViewComponent(container, state) {
        container.getElement().html(state.content);
    }
})(Fudge || (Fudge = {}));
//# sourceMappingURL=PanelManager.js.map