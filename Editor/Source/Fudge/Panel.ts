///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>

namespace Fudge {
    import ƒ = FudgeCore;

    /**
     * Holds various views into the currently processed Fudge-project.  
     * There must be only one ViewData in this panel, that displays data for the selected entity  
     * Multiple panels may be created by the user, presets for different processing should be available
     */
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    export class Panel extends EventTarget {
        // TODO: examine if the instance of GoldenLayout should be a singleton and static to all containers, or if each container holds its own
        views: View[] = [];
        config: GoldenLayout.ItemConfig;

        constructor(_name: string, _template?: PanelTemplate) {
            super();
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
                let viewData: ViewData = new ViewData(this);
                this.addView(viewData);
            }
        }

        addView (_v: View, _pushToPanelManager: boolean = true, _pushConfig: boolean = true): void  {
            this.views.push(_v);
            if ( _pushConfig) {
                this.config.content.push(_v.config);
            }
            if (_pushToPanelManager) {
                PanelManager.instance.addView(_v);
            }
        }


}
}