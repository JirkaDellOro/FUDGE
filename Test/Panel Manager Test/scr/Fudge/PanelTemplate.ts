namespace FudgeTest {
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
                            componentName: FudgeTest.VIEW.PORT,
                            title: "Viewport"
                        },
                        {
                            type: "column",
                            content: [
                                {
                                    type: "component",
                                    componentName: FudgeTest.VIEW.NODE,
                                    title: "Node"
                                },
                                {
                                    type: "component",
                                    componentName: FudgeTest.VIEW.DATA,
                                    title: "Data"
                                }
                            ]
                        }
                        
                    ]
            };
        }
    }
}