namespace Fudge {
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    export abstract class PanelTemplate {
        public config: GoldenLayout.ItemConfig;
    }

    export class NodePanelTemplate extends PanelTemplate {
        constructor () {
            super();
            this.config = {
                    type: "row",
                    content: [
                        {
                            type: "component",
                            componentName: Fudge.VIEW.RENDER,
                            title: "Viewport"
                        },
                        // {
                        //     type: "component",
                        //     componentName: Fudge.VIEW.CAMERA,
                        //     title: "Camera Controller"
                        // },
                        {
                            type: "column",
                            content: [
                                {
                                    type: "component",
                                    componentName: Fudge.VIEW.NODE,
                                    title: "Graph "
                                },
                                {
                                    type: "component",
                                    componentName: Fudge.VIEW.COMPONENTS,
                                    title: "Components"
                                }
                            ]
                        }
                        
                    ]
            };
        }
    }
}