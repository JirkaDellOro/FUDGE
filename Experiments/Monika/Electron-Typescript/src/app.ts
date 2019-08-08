let myLayout: GoldenLayout;
let savedState: string;

// let file:HTML = "test.html"
function init() {
    let config: GoldenLayout.Config = {
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
}

function stateupdate() {
    let state = JSON.stringify(myLayout.toConfig());
    localStorage.setItem('savedState', state);
}

function createSimpleComponent(container: any, state: any) {
    let element: HTMLButtonElement = document.createElement("button");
    element.innerHTML = "open new window";
    
    container.getElement().html(element);
}

function createPersistentComponent(container: any, state: any) {
    if (!typeof window.localStorage) {
        container.getElement().append('<h2 class="err">Your browser doesn\'t support localStorage.</h2>');
        return;
    }
    // Create the input
    let input = $('<input type="text" />');
    container.getElement().append('<h2>I\'ll be saved to localStorage</h2>', input);
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
    return container
}
window.addEventListener("load", init);








