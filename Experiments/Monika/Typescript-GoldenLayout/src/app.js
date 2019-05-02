let myLayout;
let savedState;
let config = {
    content: [{
            type: 'row',
            content: [{
                    type: 'component',
                    componentName: 'Hierarchy',
                    title: "Hierarchy",
                    componentState: { label: 'A' }
                },
                {
                    type: 'component',
                    componentName: 'Viewport',
                    title: "Viewport",
                    componentState: { label: 'D' }
                },
                {
                    type: 'column',
                    content: [{
                            type: 'component',
                            componentName: 'Inspector',
                            title: "Inspector",
                            componentState: { label: 'B' }
                        },
                        {
                            type: 'component',
                            componentName: 'Menubar',
                            title: "Menubar",
                            componentState: { label: 'C' }
                        }]
                }]
        }]
};
myLayout = new GoldenLayout(config);
savedState = localStorage.getItem('savedState');
// let state:GoldenLayout.ComponentConfig = myLayout.toConfig();
if (savedState !== null) {
    myLayout = new GoldenLayout(JSON.parse(savedState));
}
else {
    myLayout = new GoldenLayout(config);
}
//Layout Changes - listener
myLayout.on('stateChanged', stateupdate);
myLayout.registerComponent('Viewport', createSimpleComponent);
myLayout.registerComponent('Hierarchy', createSimpleComponent);
myLayout.registerComponent('Inspector', createSimpleComponent);
myLayout.registerComponent('Menubar', createSimpleComponent);
myLayout.init();
function stateupdate() {
    let state = JSON.stringify(myLayout.toConfig());
    localStorage.setItem('savedState', state);
}
function createSimpleComponent(container, state) {
    container.getElement().html('<button name="testbutton" value="Test">TEST</button>');
}
function createPersistentComponent(state) {
    let config;
    let container;
    config = GoldenLayout.unminifyConfig(state);
    if (!typeof window.localStorage) {
        container.getElement().append('<h2 class="err">Your browser doesn\'t support localStorage.</h2>');
        return;
    }
    // Create the input
    let input = $('<input type="text" />');
    // Set the initial / saved state
    if (config.componentState.label) {
        input.val(config.componentState.label);
    }
    // Store state updates
    input.on('change', function () {
        container.setState({
            label: input.val()
        });
    });
    return container;
}
//# sourceMappingURL=app.js.map