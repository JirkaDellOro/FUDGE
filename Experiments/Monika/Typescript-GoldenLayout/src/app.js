"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GoldenLayout = require("golden-layout");
var app = /** @class */ (function () {
    function app() {
        this.config = {
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
        this.myLayout = new GoldenLayout(this.config);
        this.savedState = localStorage.getItem('savedState');
        if (this.savedState !== null) {
            this.myLayout = new GoldenLayout(JSON.parse(this.savedState));
        }
        else {
            this.myLayout = new GoldenLayout(this.config);
        }
        //Layout Changes - listener
        this.myLayout.on('stateChanged', this.stateupdate);
        var state = this.myLayout.toConfig();
        this.myLayout.registerComponent('Viewport', this.createPersistentComponent(state));
        this.myLayout.registerComponent('Hierarchy', this.createPersistentComponent(state));
        this.myLayout.registerComponent('Inspector', this.createPersistentComponent(state));
        this.myLayout.registerComponent('Menubar', this.createPersistentComponent(state));
        this.myLayout.init();
    }
    app.prototype.stateupdate = function () {
        var state = JSON.stringify(this.myLayout.toConfig());
        localStorage.setItem('savedState', state);
    };
    app.prototype.createPersistentComponent = function (state) {
        var container;
        if (!typeof window.localStorage) {
            container.getElement().append('<h2 class="err">Your browser doesn\'t support localStorage.</h2>');
            return;
        }
        // Create the input
        var input = $('<input type="text" />');
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
    };
    return app;
}());
//# sourceMappingURL=app.js.map