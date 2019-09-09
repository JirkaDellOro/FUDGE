/// <reference types="../../../../../Core/Build/FudgeCore"/>
/// <reference types="../@types/golden-layout"/>
var UI;
/// <reference types="../../../../../Core/Build/FudgeCore"/>
/// <reference types="../@types/golden-layout"/>
(function (UI) {
    let myLayout;
    let savedState;
    window.addEventListener("load", init);
    function init() {
        let config = {
            settings: {
                hasHeaders: true,
                constrainDragToContainer: false,
                reorderEnabled: true,
                selectionEnabled: false,
                popoutWholeStack: false,
                blockedPopoutsThrowError: true,
                closePopoutsOnUnload: true,
                showPopoutIcon: false,
                showMaximiseIcon: false,
                showCloseIcon: false
            },
            dimensions: {
                borderWidth: 5,
                minItemHeight: 10,
                minItemWidth: 10,
                headerHeight: 20,
                dragProxyWidth: 300,
                dragProxyHeight: 200
            },
            labels: {
                close: 'Close',
                maximise: 'maximise',
                minimise: 'minimise',
                popout: 'open in new window'
            },
            content: [{
                    type: 'stack',
                    componentName: "root",
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
        myLayout.registerComponent('A Tab A', create);
        myLayout.registerComponent('A Tab B', createTabComponent);
        myLayout.registerComponent('A Tab C', createTabComponent);
        myLayout.registerComponent('B Tab A', createTabComponent);
        myLayout.registerComponent('B Tab B', createTabComponent);
        myLayout.registerComponent('B Tab C', createTabComponent);
        // console.log(content.layoutManager);
        myLayout.init();
        //Get Root Element of the GoldenLayout Hierarchy
        let root = myLayout.root.contentItems[0];
        //Gives active Tab
        myLayout.on('stateChanged', function () {
            console.log(root.getActiveContentItem());
        });
        console.log(root);
        console.log(root.element);
    }
    function createTabComponent(container, state) {
        container.getElement().html("<h2>" + state.label + "</h2>");
    }
    function create(container, state) {
    }
})(UI || (UI = {}));
//# sourceMappingURL=app.js.map