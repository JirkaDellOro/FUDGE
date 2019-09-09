///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
var Fudge;
(function (Fudge) {
    /**
     * Holds various views into the currently processed Fudge-project.
     * There must be only one ViewData in this panel, that displays data for the selected entity
     * Multiple panels may be created by the user, presets for different processing should be available
     */
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    class Panel extends EventTarget {
        constructor(_name, _template) {
            super();
            // TODO: examine if the instance of GoldenLayout should be a singleton and static to all containers, or if each container holds its own
            this.views = [];
            if (_template) {
                console.log("Got Template");
                console.log(_template);
            }
            else {
                this.config = {
                    type: "column",
                    content: [],
                    title: _name
                };
                let viewData = new Fudge.ViewData(this);
                this.addView(viewData, false);
            }
        }
        addView(_v, _pushToPanelManager = true) {
            this.views.push(_v);
            this.config.content.push(_v.config);
            if (_pushToPanelManager) {
                Fudge.PanelManager.instance.addView(_v);
            }
        }
    }
    Fudge.Panel = Panel;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=Panel.js.map