import * as jQuery from 'jQuery';
import * as GoldenLayout from 'golden-layout';
import { StreamState } from 'http2';

class app
{
    private config:GoldenLayout.Config = {
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
    public component:HTMLElement;
    private myLayout:GoldenLayout;
    private savedState:string;
    constructor()
    {
        this.myLayout = new GoldenLayout(this.config);
        this.savedState = localStorage.getItem( 'savedState' );
        
        if( this.savedState !== null ) 
        {
            this.myLayout = new GoldenLayout( JSON.parse( this.savedState ) );
        } 
        else 
        {
            this.myLayout = new GoldenLayout(this.config);
        }
        //Layout Changes - listener
        this.myLayout.on('stateChanged', this.stateupdate);

        var state:GoldenLayout.ComponentConfig = this.myLayout.toConfig();

        this.myLayout.registerComponent( 'Viewport', this.createPersistentComponent(state));
        this.myLayout.registerComponent( 'Hierarchy', this.createPersistentComponent(state));
        this.myLayout.registerComponent( 'Inspector', this.createPersistentComponent(state));
        this.myLayout.registerComponent( 'Menubar', this.createPersistentComponent(state));
        this.myLayout.init();
    }
    stateupdate()
    {
        var state = JSON.stringify( this.myLayout.toConfig() );
        localStorage.setItem( 'savedState', state );
    }
    createPersistentComponent(state:GoldenLayout.ComponentConfig)
    {
        var container:GoldenLayout.Container;
        if( !typeof window.localStorage ) {
            container.getElement().append(  '<h2 class="err">Your browser doesn\'t support localStorage.</h2>');
            return;
            }
          // Create the input
          var input = $( '<input type="text" />' );
        
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
}