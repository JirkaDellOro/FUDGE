namespace GoldenLayoutTest {
    let myLayout: GoldenLayout;
    let savedState: string;
    // let file:HTML = "test.html"
    let config: GoldenLayout.Config = {
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
    myLayout.registerComponent('Hierarchy', function (container:any, state:any) {
        // return SimpleComponent.create(container, state);
        return new SimpleComponent(container, state);
    });
    console.log("I work");

    myLayout.init();

}