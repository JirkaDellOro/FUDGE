var Fudge;
(function (Fudge) {
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    class PanelTemplate {
    }
    Fudge.PanelTemplate = PanelTemplate;
    class NodePanelTemplate extends PanelTemplate {
        constructor() {
            super();
            this.config = {
                type: "row",
                content: [
                    {
                        type: "component",
                        componentName: Fudge.VIEW.NODE,
                        title: "Viewport"
                    },
                    {
                        type: "column",
                        content: [
                            {
                                type: "component",
                                componentName: Fudge.VIEW.NODE,
                                title: "Node Explorer"
                            },
                            {
                                type: "component",
                                componentName: Fudge.VIEW.DATA,
                                title: "Inspector"
                            }
                        ]
                    }
                ]
            };
        }
    }
    Fudge.NodePanelTemplate = NodePanelTemplate;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=PanelTemplate.js.map