var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    let myLayout;
    let savedState;
    // let file:HTML = "test.html"
    let config = {
        content: [{
                type: 'row',
                content: [{
                        type: 'component',
                        componentName: 'Hierarchy',
                        title: "Hierarchy",
                    }]
            }]
    };
    myLayout = new GoldenLayout(config);
    myLayout.registerComponent('Hierarchy', function (container, state) {
        // return SimpleComponent.create(container, state);
        return new GoldenLayoutTest.SimpleComponent(container, state);
    });
    console.log("I work");
    myLayout.init();
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=app.js.map