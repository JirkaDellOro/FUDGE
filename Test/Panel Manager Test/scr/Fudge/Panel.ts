///<reference types="../../../../Core/Build/FudgeCore"/>

//<reference types="../../Examples/Code/Scenes"/>

namespace Fudge {
    // import ƒ = FudgeCore;

    /**
     * Holds various views into the currently processed Fudge-project.  
     * There must be only one ViewData in this panel, that displays data for the selected entity  
     * Multiple panels may be created by the user, presets for different processing should be available
     */
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    export class Panel extends EventTarget {
        views: View[] = [];
        config: GoldenLayout.ItemConfig;

        constructor(_name: string, _template?: PanelTemplate) {
            super();
            this.config = {
                type: "row",
                content: [],
                title: _name
            };
            if (_template) {
                this.config.content[0] = this.constructFromTemplate(_template.config, "row");
            }
            else {
                let viewData: ViewData = new ViewData(this);
                this.addView(viewData, false);
            }
            // console.log("panel config" + _name);
            // console.log(this.config);
        }

        public addView(_v: View, _pushToPanelManager: boolean = true): void {
            this.views.push(_v);
            this.config.content.push(_v.config);
            if (_pushToPanelManager) {
                PanelManager.instance.addView(_v);
            }
        }

        constructFromTemplate(template: GoldenLayout.ItemConfig, _type: string): GoldenLayout.ItemConfigType {
            let config: GoldenLayout.ItemConfig = {
                type: _type,
                content: []
            };
            if (template.content.length != 0) {
                let content: GoldenLayout.ComponentConfig[] = <GoldenLayout.ComponentConfig[]>template.content;
                for (let item of content) {
                    if (item.type == "component") {
                        let view: View;
                        switch (item.componentName) {
                            case VIEW.NODE:
                                view = new ViewNode(this);
                                break;
                            case VIEW.DATA:
                                view = new ViewData(this);
                                break;
                        }
                        let viewConfig: GoldenLayout.ComponentConfig = {
                            type: "component",
                            title: item.title,
                            componentName: "View",
                            componentState: { content: view.content}
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
}