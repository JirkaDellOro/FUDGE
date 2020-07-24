///<reference path="../View/View.ts"/>
///<reference path="../Panel/Panel.ts"/>

namespace Fudge {
  import ƒ = FudgeCore;

  /**
  * Panel that functions as a Node Editor. Uses ViewData, ViewPort and ViewNode. 
  * Use NodePanelTemplate to initialize the default NodePanel.
  * @author Monika Galkewitsch, 2019, HFU
  */
  export class PanelNode extends Panel {
    private static config: GoldenLayout.ItemConfig = {
      type: "row", content: [{
        type: "row", content: [
          { type: "component", componentName: VIEW.RENDER, title: "Render" }, //, componentState: _state 
          {
            type: "column", content: [
              { type: "component", componentName: VIEW.GRAPH, title: "Graph" }, //, componentState: _state },
              { type: "component", componentName: VIEW.COMPONENTS, title: "Components" }] //, componentState: _state }]
          }]
      }]
    };
    private node: ƒ.Node;

    // constructor(_name: string, _template?: PanelTemplate, _node?: ƒ.Node) {
    //   super(_name);
    //   this.node = _node || new ƒ.Node("Scene");
    //   if (_template) {
    //     let id: string = this.config.id.toString();
    //     this.config.content[0] = this.constructFromTemplate(_template.config, _template.config.type, id);
    //   }
    //   else {
    //     let viewData: ViewComponents = new ViewComponents(this);
    //     this.addView(viewData, false);
    //   }
    // }

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      console.log(_state);
      let config: GoldenLayout.Config = {
        settings: { showPopoutIcon: false },
        content: [{
          type: "row", content: [
            { type: "component", componentName: VIEW.RENDER, title: "Render", componentState: _state },
            {
              type: "column", content: [
                { type: "component", componentName: VIEW.GRAPH, title: "Graph" }, //, componentState: _state },
                { type: "component", componentName: VIEW.COMPONENTS, title: "Components" }] //, componentState: _state }]
            }]
        }]
      };
      this.goldenLayout = new GoldenLayout(config, this.dom);
      _container.getElement().append(this.dom);

      this.goldenLayout.registerComponent(VIEW.RENDER, ViewRender);
      this.goldenLayout.registerComponent(VIEW.COMPONENTS, ViewComponents);
      this.goldenLayout.registerComponent(VIEW.GRAPH, ViewGraph);

      this.goldenLayout.on("stateChanged", () => this.goldenLayout.updateSize());
      this.goldenLayout.init();
    }

    // public static add(): void {
    //   let config: GoldenLayout.ItemConfig = {
    //     type: "stack",
    //     content: [{
    //       type: "component",
    //       componentName: "PanelNode",
    //       componentState: { text: "Panel 3" },
    //       title: "Panel3"
    //     }]
    //   };
    //   PanelManager.instance.editorLayout.root.contentItems[0].addChild(config);
    //   // glDoc.root.contentItems[0].addChild(config); 
    // }

    public setNode(_node: ƒ.Node): void {
      this.node = _node;
      // for (let view of this.views) {
      //   if (view["setRoot"])
      //     view["setRoot"](this.node);
      // }
    }

    public getNode(): ƒ.Node {
      return this.node;
    }
    // /**
    //  * Allows to construct the view from a template config.
    //  * @param template Panel Template to be used for the construction
    //  * @param _type Type of the top layer container element used in the goldenLayout Config. This can be "row", "column" or "stack"
    //  */
    // public constructFromTemplate(template: GoldenLayout.ItemConfig, _type: string, _id?: string): GoldenLayout.ItemConfigType {
    //   let id: string = template.id + _id;
    //   let config: GoldenLayout.ItemConfig = {
    //     type: _type,
    //     width: template.width,
    //     height: template.height,
    //     id: id,
    //     title: template.title,
    //     isClosable: template.isClosable,
    //     content: []
    //   };
    //   if (template.content.length != 0) {
    //     let content: GoldenLayout.ComponentConfig[] = <GoldenLayout.ComponentConfig[]>template.content;
    //     for (let item of content) {
    //       if (item.type == "component") {
    //         let view: View;
    //         switch (item.componentName) {
    //           case VIEW.NODE:
    //             view = new ViewGraph(this);
    //             // view.content.addEventListener(ƒui.EVENT_USERINTERFACE.SELECTION, this.passEvent);
    //             break;
    //           case VIEW.COMPONENTS:
    //             view = new ViewComponents(this);
    //             break;
    //           case VIEW.RENDER:
    //             view = new ViewRender(this);
    //             break;
    //           case VIEW.CAMERA:
    //             view = new ViewCamera(this);
    //             break;
    //           case VIEW.ANIMATION:
    //             // view = new ViewAnimation(this);
    //             break;
    //         }
    //         let viewConfig: GoldenLayout.ComponentConfig = {
    //           type: "component",
    //           title: item.title,
    //           width: item.width,
    //           height: item.height,
    //           id: item.id,
    //           isClosable: item.isClosable,
    //           componentName: "View",
    //           componentState: { content: view.content }
    //         };

    //         view.config = viewConfig;
    //         config.content.push(viewConfig);
    //         this.addView(view, false, false);

    //       }
    //       else {
    //         config.content.push(this.constructFromTemplate(item, item.type, <string>item.id));
    //       }
    //     }
    //   }
    //   // console.log(config);
    //   return config;
    // }
  }
}