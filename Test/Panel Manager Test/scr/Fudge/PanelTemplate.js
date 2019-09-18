var FudgeTest;
(function (FudgeTest) {
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    class PanelTemplate {
    }
    FudgeTest.PanelTemplate = PanelTemplate;
    class NodePanelTemplate extends PanelTemplate {
        constructor() {
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
                                title: "Node Explorer"
                            },
                            {
                                type: "component",
                                componentName: FudgeTest.VIEW.DATA,
                                title: "Inspector"
                            }
                        ]
                    }
                ]
            };
        }
    }
    FudgeTest.NodePanelTemplate = NodePanelTemplate;
})(FudgeTest || (FudgeTest = {}));
//# sourceMappingURL=PanelTemplate.js.map