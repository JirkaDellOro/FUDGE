namespace GoldenLayoutTest {
    let myLayout: GoldenLayout;
    let savedState: string;
    // let file:HTML = "test.html"
    let config: GoldenLayout.Config = {
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
    function createSimpleComponent (container: any, state: any) {
        // return SimpleComponent.create(container, state);
        return new SimpleComponent(container, state);
    }
    myLayout = new GoldenLayout(config);
    myLayout.registerComponent('Inspector', createSimpleComponent);
    myLayout.registerComponent('Viewport', createSimpleComponent);
    console.log("I work");

    myLayout.init();

}