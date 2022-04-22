namespace Fudge {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  /**
   * TODO: add
   * @authors Jonas Plotzky, HFU, 2022
   */
  export class PanelAnimation extends Panel {

    constructor(_container: ComponentContainer, _state: JsonValue | undefined) {
      super(_container, _state);

      this.goldenLayout.registerComponentConstructor(VIEW.RENDER, ViewRender);
      this.goldenLayout.registerComponentConstructor(VIEW.HIERARCHY, ViewHierarchy);
      this.goldenLayout.registerComponentConstructor(VIEW.ANIMATION, ViewAnimation);

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
                title: "RENDER"
              },
              {
                type: "component",
                componentType: VIEW.HIERARCHY,
                componentState: _state,
                title: "HIERARCHY"
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

      this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.SELECT, this.hndFocusNode);

      this.setTitle("Animation | " );
    }

    public getState(): { [key: string]: string } {
      // TODO: iterate over views and collect their states for reconstruction
      return {};
    }

    private hndEvent = async (_event: CustomEvent): Promise<void> => {
      // switch (_event.type) {

      // }

      this.broadcastEvent(_event);
      _event.stopPropagation();
    }

    private hndFocusNode = (_event: CustomEvent): void => {
      let event: CustomEvent = new CustomEvent(EVENT_EDITOR.FOCUS_NODE, { bubbles: false, detail: _event.detail.data });
      this.broadcastEvent(event);
    }
  }
}
