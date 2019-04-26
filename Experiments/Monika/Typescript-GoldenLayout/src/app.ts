//<reference types="../node_modules/@types/golden-layout/"/>
/// <reference path="../node_modules/@types/golden-layout/index.d.ts"/>
// import * as jQuery from "jQuery";
// declare module 'golden-layout';
// declare var GoldenLayout:any;
// declare namespace GoldenLayout{}
// import * as GoldenLayout from "golden-layout";
import GoldenLayout = require("golden-layout");
     
// let component:HTMLElement;
let myLayout:GoldenLayout;
let savedState:string;
let config:GoldenLayout.Config = {
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
function stateupdate()
{
    let state = JSON.stringify( this.myLayout.toConfig() );
    localStorage.setItem( 'savedState', state );
}

function createPersistentComponent(state:GoldenLayout.ComponentConfig)
{
    let container:GoldenLayout.Container;
    if( !typeof window.localStorage ) {
        container.getElement().append(  '<h2 class="err">Your browser doesn\'t support localStorage.</h2>');
        return;
        }
        // Create the input
        let input = $( '<input type="text" />' );
    
        // Set the initial / saved state
        if( state.componentState.label ) {
        input.val( state.componentState.label );
        }
        // Store state updates
        input.on( 'change', function(){
        container.setState({
            label: input.val()
        });
        }); 
        return container
}

myLayout = new GoldenLayout(config);
savedState = localStorage.getItem( 'savedState' );

if( savedState !== null ) 
{
    myLayout = new GoldenLayout( JSON.parse( savedState ) );
} 
else 
{
    myLayout = new GoldenLayout(config);
}
//Layout Changes - listener
myLayout.on('stateChanged', stateupdate);

let state:GoldenLayout.ComponentConfig = myLayout.toConfig();

myLayout.registerComponent( 'Viewport', createPersistentComponent(state));
myLayout.registerComponent( 'Hierarchy', createPersistentComponent(state));
myLayout.registerComponent( 'Inspector', createPersistentComponent(state));
myLayout.registerComponent( 'Menubar', createPersistentComponent(state));
myLayout.init();


