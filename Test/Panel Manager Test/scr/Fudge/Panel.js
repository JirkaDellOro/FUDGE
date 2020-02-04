///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
var FudgeTest;
///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
(function (FudgeTest) {
    // import ƒ = FudgeCore;
    /**
     * Holds various views into the currently processed Fudge-project.
     * There must be only one ViewData in this panel, that displays data for the selected entity
     * Multiple panels may be created by the user, presets for different processing should be available
     */
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    class Panel extends EventTarget {
        /**
         * Constructor for panel Objects. Generates an empty panel with a single ViewData.
         * @param _name Panel Name
         * @param _template Optional. Template to be used in the construction of the panel.
         */
        constructor(_name, _template) {
            super();
            this.views = [];
            this.config = {
                type: "row",
                content: [],
                title: _name
            };
            if (_template) {
                this.config.content[0] = this.constructFromTemplate(_template.config, "row");
            }
            else {
                let viewData = new FudgeTest.ViewData(this);
                this.addView(viewData, false);
            }
        }
        /**
         * Adds given View to the list of views on the panel.
         * @param _v View to be added
         * @param _pushToPanelManager Wether or not the View should also be pushed to the Panelmanagers list of views
         * @param _pushConfig Wether or not the config of the view should be pushed into the panel config. If this is false, you will have to push the view config manually. This is helpful for creating custom structures in the panel config.
         */
        addView(_v, _pushToPanelManager = true, _pushConfig = true) {
            this.views.push(_v);
            if (_pushConfig) {
                this.config.content.push(_v.config);
            }
            if (_pushToPanelManager) {
                FudgeTest.PanelManager.instance.addView(_v);
            }
        }
        /**
         * Allows to construct the view from a template config.
         * @param template Panel Template to be used for the construction
         * @param _type Type of the top layer container element used in the goldenLayout Config. This can be "row", "column" or "stack"
         */
        constructFromTemplate(template, _type) {
            let config = {
                type: _type,
                content: []
            };
            if (template.content.length != 0) {
                let content = template.content;
                for (let item of content) {
                    if (item.type == "component") {
                        let view;
                        switch (item.componentName) {
                            case FudgeTest.VIEW.NODE:
                                view = new FudgeTest.ViewNode(this);
                                break;
                            case FudgeTest.VIEW.DATA:
                                view = new FudgeTest.ViewData(this);
                                break;
                            case FudgeTest.VIEW.PORT:
                                view = new FudgeTest.ViewPort(this);
                                break;
                        }
                        let viewConfig = {
                            type: "component",
                            title: item.title,
                            componentName: "View",
                            componentState: { content: view.content }
                        };
                        view.config = viewConfig;
                        config.content.push(viewConfig);
                        this.addView(view, false, false);
                    }
                    else {
                        config.content.push(this.constructFromTemplate(item, item.type));
                    }
                }
            }
            console.log(config);
            return config;
        }
    }
    FudgeTest.Panel = Panel;
})(FudgeTest || (FudgeTest = {}));
//# sourceMappingURL=Panel.js.map