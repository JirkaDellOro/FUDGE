var UI;
(function (UI) {
    let myLayout;
    let savedState;
    // let file:HTML = "test.html"
    let config = {
        content: [{
                type: 'row',
                content: [{
                        type: 'component',
                        componentName: 'Inspector',
                        title: "Inspector",
                    },
                    {
                        type: 'component',
                        componentName: 'Viewport',
                        title: "Viewport",
                    }]
            }]
    };
    function createSimpleComponent(container, state) {
        // return SimpleComponent.create(container, state);
        return new UI.SimpleComponent(container, state);
    }
    myLayout = new GoldenLayout(config);
    myLayout.registerComponent('Inspector', createSimpleComponent);
    myLayout.registerComponent('Viewport', createSimpleComponent);
    console.log("I work");
    myLayout.init();
})(UI || (UI = {}));
//# sourceMappingURL=app.js.map