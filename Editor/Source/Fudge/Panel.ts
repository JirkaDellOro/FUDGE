///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>

//<reference types="../../Examples/Code/Scenes"/>

namespace Fudge {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    /**
     * Holds various views into the currently processed Fudge-project.  
     * There must be only one ViewData in this panel, that displays data for the selected entity  
     * Multiple panels may be created by the user, presets for different processing should be available
     * @author Monika Galkewitsch, HFU, 2019
     * @author Lukas Scheuerle, HFU, 2019
     */

    export abstract class Panel extends EventTarget {
        views: View[] = [];
        config: GoldenLayout.ItemConfig;


        /**
         * Constructor for panel Objects. Generates an empty panel with a single ViewData.
         * @param _name Panel Name
         * @param _template Optional. Template to be used in the construction of the panel.
         */
        constructor(_name: string) {
            super();
            let id: string = this.generateID();
            this.config = {
                type: "row",
                content: [],
                title: _name,
                id: id
            };

        }
        /**
         * Adds given View to the list of views on the panel. 
         * @param _v View to be added
         * @param _pushToPanelManager Wether or not the View should also be pushed to the Panelmanagers list of views
         * @param _pushConfig Wether or not the config of the view should be pushed into the panel config. If this is false, you will have to push the view config manually. This is helpful for creating custom structures in the panel config.
         */
        public addView(_v: View, _pushToPanelManager: boolean = true, _pushConfig: boolean = true): void {
            this.views.push(_v);
            if (_pushConfig) {
                this.config.content.push(_v.config);
            }
            if (_pushToPanelManager) {
                PanelManager.instance.addView(_v);
            }
        }

        /**
         * Returns a randomly generated ID. 
         * Used to identify panels
         */
        private generateID(): string {
            let randLetter: string = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            let uniqid: string = randLetter + Date.now();
            return uniqid;
        }

    }

    /**
    * Panel that functions as a Node Editor. Uses ViewData, ViewPort and ViewNode. 
    * Use NodePanelTemplate to initialize the default NodePanel.
    * @author Monika Galkewitsch, 2019, HFU
    */
    export class NodePanel extends Panel {
        private node: ƒ.Node;
        constructor(_name: string, _template?: PanelTemplate, _node?: ƒ.Node) {
            super(_name);
            this.node = _node || new ƒ.Node("Scene");
            if (_template) {
                let id: string = this.config.id.toString();
                this.config.content[0] = this.constructFromTemplate(_template.config, _template.config.type, id);
            }
            else {
                let viewData: ViewData = new ViewData(this);
                this.addView(viewData, false);
            }
        }

        public setNode(_node: ƒ.Node): void {
            this.node = _node;
            for (let view of this.views) {
                if (view instanceof ViewNode) {
                    (<ViewNode>view).setRoot(this.node);
                }
                else if (view instanceof ViewViewport) {
                    (<ViewViewport>view).setRoot(this.node);
                }
            }
        }

        public getNode(): ƒ.Node {
            return this.node;
        }
        /**
 * Allows to construct the view from a template config.
 * @param template Panel Template to be used for the construction
 * @param _type Type of the top layer container element used in the goldenLayout Config. This can be "row", "column" or "stack"
 */
        public constructFromTemplate(template: GoldenLayout.ItemConfig, _type: string, _id?: string): GoldenLayout.ItemConfigType {
            let id: string = template.id + _id;
            let config: GoldenLayout.ItemConfig = {
                type: _type,
                width: template.width,
                height: template.height,
                id: id,
                title: template.title,
                isClosable: template.isClosable,
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
                                // view.content.addEventListener(ƒui.UIEVENT.SELECTION, this.passEvent);
                                break;
                            case VIEW.DATA:
                                view = new ViewData(this);
                                break;
                            case VIEW.PORT:
                                view = new ViewViewport(this);
                                break;
                            case VIEW.CAMERA:
                                view = new ViewCamera(this);
                                break;
                        }
                        let viewConfig: GoldenLayout.ComponentConfig = {
                            type: "component",
                            title: item.title,
                            width: item.width,
                            height: item.height,
                            id: item.id,
                            isClosable: item.isClosable,
                            componentName: "View",
                            componentState: { content: view.content }
                        };

                        view.config = viewConfig;
                        config.content.push(viewConfig);
                        this.addView(view, false, false);

                    }
                    else {
                        config.content.push(this.constructFromTemplate(item, item.type, <string>item.id));
                    }
                }
            }
            console.log(config);
            return config;
        }
    }
}