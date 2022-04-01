namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * TODO: add
   * @authors Jonas Plotzky, HFU, 2022
   */
  export class PanelAnimation extends Panel {
    constructor(_container: ComponentContainer, _state: JsonValue | undefined) {
      super(_container, _state);

      //old registercomponent
      // this.goldenLayout.registerComponent(VIEW.INTERNAL, ViewInternal);
      // this.goldenLayout.registerComponent(VIEW.EXTERNAL, ViewExternal);
      // this.goldenLayout.registerComponent(VIEW.PROPERTIES, ViewProperties);
      // this.goldenLayout.registerComponent(VIEW.PREVIEW, ViewPreview);
      // this.goldenLayout.registerComponent(VIEW.SCRIPT, ViewScript);

      this.goldenLayout.registerComponentConstructor(VIEW.RENDER, ViewRender);
      this.goldenLayout.registerComponentConstructor(VIEW.COMPONENTS, ViewComponents);
      this.goldenLayout.registerComponentConstructor(VIEW.ANIMATION, ViewAnimation);

      // const config = {
      //           type: "column",
      //           content: [
      //             {
      //               type: "row",
      //               content: [
      //                 {
      //                   type: "component",
      //                   componentName: Fudge.VIEW.RENDER,
      //                   title: "Viewport"
      //                 },
      //                 {
      //                   type: "component",
      //                   componentName: Fudge.VIEW.COMPONENTS,
      //                   title: "Inspector"
      //                 }
      //               ]
      //             },
      //             {
      //               type: "component",
      //               componentName: Fudge.VIEW.ANIMATION,
      //               title: "Animator"
      //             }
      //           ]
      //         };

      const config: RowOrColumnItemConfig = {
        type: "column",
        content: [
          {
            type: "row",
            content: [
              {
                type: "component",
                componentType: VIEW.RENDER,
                componentState: _state,
                title: "Viewport"
              },
              {
                type: "component",
                componentType: VIEW.COMPONENTS,
                componentState: _state,
                title: "Inspector"
              }
            ]
          },
          {
            type: "component",
            componentType: VIEW.ANIMATION,
            componentState: _state,
            title: "Animator"
          }
        ]
      };

      this.goldenLayout.rootItem.layoutManager.addItemAtLocation(config, [
        { typeId: LayoutManager.LocationSelector.TypeId.Root }
      ]);

      // this.dom.addEventListener(EVENT_EDITOR.SET_PROJECT, this.hndEvent);
      // this.dom.addEventListener(ƒui.EVENT.SELECT, this.hndEvent);
      // this.dom.addEventListener(ƒui.EVENT.MUTATE, this.hndEvent);
      // this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.hndEvent);
      // this.dom.addEventListener(EVENT_EDITOR.REFRESH, this.hndEvent);

      this.setTitle("Animation | " );
      // this.broadcastEvent(new Event(EVENT_EDITOR.SET_PROJECT));
    }

    public getState(): { [key: string]: string } {
      // TODO: iterate over views and collect their states for reconstruction
      return {};
    }
  }
}
