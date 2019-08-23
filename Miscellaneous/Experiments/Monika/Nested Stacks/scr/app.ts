/// <reference types="../../../../../Core/Build/FudgeCore"/>
/// <reference types="../@types/golden-layout"/>

namespace UI {
    let myLayout: GoldenLayout;
    let savedState: string;


    window.addEventListener("load", init);

    function init() {
        let config: GoldenLayout.Config = {
            content: [{
                type: 'stack',
                content: [{
                    type: 'stack',
                    title: "Stack A",
                    content: [{
                        type: 'component',
                        componentName: 'A Tab A',
                        title: "Tab A",
                        componentState: { label: 'A' }
                    },
                    {
                        type: 'component',
                        componentName: 'A Tab B',
                        title: "Tab B",
                        componentState: { label: 'B' }
                    },
                    {
                        type: 'component',
                        componentName: 'A Tab C',
                        title: "Tab C",
                        componentState: { label: 'C' }

                    }]
                }, {
                    type: 'stack',
                    title: "Stack B",
                    content: [{
                        type: 'component',
                        componentName: 'B Tab A',
                        title: "Tab A",
                        componentState: { label: 'D' }
                    },
                    {
                        type: 'component',
                        componentName: 'B Tab B',
                        title: "Tab B",
                        componentState: { label: 'E' }
                    },
                    {
                        type: 'component',
                        componentName: 'B Tab C',
                        title: "Tab C",
                        componentState: { label: 'F' }
                    }]
                }]
            }]
        };
        myLayout = new GoldenLayout(config);
        myLayout.registerComponent('A Tab A', createTabComponent);
        myLayout.registerComponent('A Tab B', createTabComponent);
        myLayout.registerComponent('A Tab C', createTabComponent);
        myLayout.registerComponent('B Tab A', createTabComponent);
        myLayout.registerComponent('B Tab B', createTabComponent);
        myLayout.registerComponent('B Tab C', createTabComponent);
        myLayout.init();
    }


    function createTabComponent(container: GoldenLayout.Container, state: any): void {
        container.getElement().html("<h2>" + state.label + "</h2>");
    }

}