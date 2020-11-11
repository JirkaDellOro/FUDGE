/// <reference types="../../../@types/jquery"/>
/// <reference types="../../../@types/golden-layout"/>
var FudgeTest;
/// <reference types="../../../@types/jquery"/>
/// <reference types="../../../@types/golden-layout"/>
(function (FudgeTest) {
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    class PanelManager extends EventTarget {
        constructor() {
            super();
            this.panels = [];
        }
        /**
         * Create new Panel from Template Structure
         * @param _template Template to be used
         * @param _name Name of the Panel
         */
        createPanelFromTemplate(_template, _name) {
            let panel = new FudgeTest.Panel(_name, _template);
            console.log(panel);
            return panel;
        }
        /**
         * Creates an Panel with nothing but the default ViewData
         * @param _name Name of the Panel
         */
        createEmptyPanel(_name) {
            let panel = new FudgeTest.Panel(_name);
            return panel;
        }
        /**
         * Add Panel to PanelManagers Panel List and to the PanelManagers GoldenLayout Config
         * @param _p Panel to be added
         */
        addPanel(_p) {
            this.panels.push(_p);
            this.editorLayout.root.contentItems[0].addChild(_p.config);
        }
        /**
         * Add View to PanelManagers View List and add the view to the active panel
         * @param _v View to be added
         */
        addView(_v) {
            console.log("Add View has been called at PM");
            this.editorLayout.root.contentItems[0].getActiveContentItem().addChild(_v.config);
        }
        /**
         * Initialize GoldenLayout Context of the PanelManager Instance
         */
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
    FudgeTest.PanelManager = PanelManager;
    //TODO: Give these Factory Functions a better home
    /**
     * Factory Function for the the "Welcome"-Component
     * @param container
     * @param state
     */
    function welcome(container, state) {
        container.getElement().html("<div>Welcome</div>");
    }
    /**
     * Factory Function for the generic "View"-Component
     * @param container
     * @param state
     */
    function registerViewComponent(container, state) {
        container.getElement().html(state.content);
    }
})(FudgeTest || (FudgeTest = {}));
//# sourceMappingURL=PanelManager.js.map