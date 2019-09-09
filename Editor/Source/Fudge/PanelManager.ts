namespace Fudge {
    // Code by Monika Galkewitsch with a whole lot of Help by Lukas Scheuerle
    export class PanelManager extends EventTarget {
        static instance: PanelManager = new PanelManager();
        static templates: typeof PanelTemplate[];
        editorLayout: GoldenLayout;
        private panels: Panel[] = [];
    
        private constructor() {
          super();
          let config: GoldenLayout.Config = {
            content: [{
              type: "stack",
              isClosable: false,
              content: [{
                type: "component",
                componentName: "welcome",
                title: "Welcome"
              }]
            }]
          };
          this.editorLayout = new GoldenLayout(config);   //This might be a problem because it can't use a specific place to put it.
          this.editorLayout.init();
        }
        createPanelFromTemplate(_template: PanelTemplate, _name: string): Panel {
            let panel: Panel = new Panel(_name, _template);
            return panel;
        }
        createEmptyPanel(_name: string): Panel {
            let panel: Panel = new Panel(_name);
            return panel;
        }
        addPanel (_p: Panel): void {
          this.panels.push(_p);
          this.editorLayout.root.contentItems[0].addChild(_p.config);
          
        }
        
        addView (_v: View): void {
          this.editorLayout.root.contentItems[0].getActiveContentItem().addChild(_v.config);
        }
      }
}