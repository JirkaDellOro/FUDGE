System.register(["golden-layout"], function (exports_1, context_1) {
    "use strict";
    var GoldenLayout, myLayout, savedState, config, state;
    var __moduleName = context_1 && context_1.id;
    function stateupdate() {
        let state = JSON.stringify(this.myLayout.toConfig());
        localStorage.setItem('savedState', state);
    }
    function createPersistentComponent(state) {
        let container;
        if (!typeof window.localStorage) {
            container.getElement().append('<h2 class="err">Your browser doesn\'t support localStorage.</h2>');
            return;
        }
        // Create the input
        let input = $('<input type="text" />');
        // Set the initial / saved state
        if (state.componentState.label) {
            input.val(state.componentState.label);
        }
        // Store state updates
        input.on('change', function () {
            container.setState({
                label: input.val()
            });
        });
        return container;
    }
    return {
        setters: [
            function (GoldenLayout_1) {
                GoldenLayout = GoldenLayout_1;
            }
        ],
        execute: function () {
            config = {
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
            if (savedState !== null) {
                myLayout = new GoldenLayout(JSON.parse(savedState));
            }
            else {
                myLayout = new GoldenLayout(config);
            }
            //Layout Changes - listener
            myLayout.on('stateChanged', stateupdate);
            state = myLayout.toConfig();
            myLayout.registerComponent('Viewport', createPersistentComponent(state));
            myLayout.registerComponent('Hierarchy', createPersistentComponent(state));
            myLayout.registerComponent('Inspector', createPersistentComponent(state));
            myLayout.registerComponent('Menubar', createPersistentComponent(state));
            myLayout.init();
        }
    };
});
//# sourceMappingURL=app.js.map