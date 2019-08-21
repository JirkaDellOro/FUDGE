///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>

namespace Fudge {
    import ƒ = FudgeCore;

    /**
     * Holds various views into the currently processed Fudge-project.  
     * There must be only one ViewData in this panel, that displays data for the selected entity  
     * Multiple panels may be created by the user, presets for different processing should be available
     */
    export class Panel {
        // TODO: examine if the instance of GoldenLayout should be a singleton and static to all containers, or if each container holds its own
        public static goldenLayout: GoldenLayout;
        public viewContainers: GoldenLayout.Container[] = []; 

        constructor(_viewType: VIEW) {
            if (Panel.goldenLayout)
                // TODO: support multiple Panels! In this template, there is only one resembling GoldenLayout itself
                return;

            // TODO: make Panel generic! In this template, the Panel always host a ViewNode
            Panel.goldenLayout = new GoldenLayout(this.getLayout());
            Panel.goldenLayout.registerComponent(VIEW.DATA, ViewData);
            if (_viewType == VIEW.NODE)
                Panel.goldenLayout.registerComponent(VIEW.NODE, ViewNode);

            // Register a view allows easy communication from the panel back to the registered view
            Panel.goldenLayout.on("registerView", (_context: GoldenLayout.Container) => {
                ƒ.Debug.info("Register view " + _context["title"], _context);
                this.viewContainers.push(_context);
            });

            
            Panel.goldenLayout.on("clickOnButtonInDataView", (_context: unknown) => {
                ƒ.Debug.info("Click on button in DataView ", _context);
            });

            Panel.goldenLayout.init();
        }

        public getLayout(): GoldenLayout.Config {
            const config: GoldenLayout.Config = {
                content: [{
                    type: "row",
                    content: [{
                        type: "component",
                        componentName: VIEW.DATA,
                        title: "Data"
                    }, {
                        type: "component",
                        componentName: VIEW.NODE,
                        title: "Node"
                    }]
                }]
            };
            return config;
        }
    }
}