///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
var Fudge;
(function (Fudge) {
    // import ƒ = FudgeCore;
    /**
     * Holds various views into the currently processed Fudge-project.
     * There must be only one ViewData in this panel, that displays data for the selected entity
     * Multiple panels may be created by the user, presets for different processing should be available
     */
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    class Panel extends EventTarget {
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
                let viewData = new Fudge.ViewData(this);
                this.addView(viewData, false);
            }
            // console.log("panel config" + _name);
            // console.log(this.config);
        }
        addView(_v, _pushToPanelManager = true) {
            this.views.push(_v);
            this.config.content.push(_v.config);
            if (_pushToPanelManager) {
                Fudge.PanelManager.instance.addView(_v);
            }
        }
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
                            case Fudge.VIEW.NODE:
                                view = new Fudge.ViewNode(this);
                                break;
                            case Fudge.VIEW.DATA:
                                view = new Fudge.ViewData(this);
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
                        this.addView(view, false);
                        // console.log(view.config.title);
                        // console.log(view.config);
                        // console.log(view.content);
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
    Fudge.Panel = Panel;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=Panel.js.map