var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    // class SimpleComponent {
    function create(container, state) {
        let element = document.createElement("span");
        container.getElement().html(element);
    }
    // }
    let myLayout;
    let savedState;
    // let file:HTML = "test.html"
    let config = {
        content: [{
                type: 'row',
                content: [{
                        type: 'component',
                        componentName: 'Scene Explorer',
                        title: "Scene Explorer",
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
                                settings:{hasHeaders:false},
                                componentState: { label: 'C' }
                            },
                            {
                                type: 'component',
                                componentName: 'Toolbar',
                                title: "Toolbar",
                                settings:{hasHeaders:false},
                                componentState: { label: 'D' }
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
    // let s:SimpleComponent = new SimpleComponent();
    // console.log(s);
    myLayout.on('stateChanged', stateupdate);
    myLayout.registerComponent('Viewport', createPersistentComponent);
    myLayout.registerComponent('Scene Explorer', create);
    myLayout.registerComponent('Inspector', createSimpleComponent);
    myLayout.registerComponent('Menubar', createSimpleComponent);
    myLayout.registerComponent('Toolbar', createSimpleComponent);
    myLayout.init();
    function stateupdate() {
        let state = JSON.stringify(myLayout.toConfig());
        localStorage.setItem('savedState', state);
    }
    function createSimpleComponent(container, state) {
    }
    function createPersistentComponent(container, state) {
        if (!typeof window.localStorage) {
            container.getElement().append('<h2 class="err">.</h2>');
            return;
        }
        // Create the input
        let input = $('<input type="text" />');
        // Set the initial / saved state
        if (state.label) {
            input.val(state.label);
        }
        // Store state updates
        input.on('change', function () {
            container.setState({
                label: input.val()
            });
        });
        return container;
    }
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=app.js.map