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

      this.goldenLayout.registerComponentConstructor(VIEW.ANIMATION, ViewAnimation);

      const config: RowOrColumnItemConfig = {
        type: "row",
        content: [
          {
            type: "component",
            componentType: VIEW.ANIMATION,
            componentState: _state,
            title: "ANIMATION"
          }
        ]
      };

      this.goldenLayout.addItemAtLocation(config, [
        { typeId: LayoutManager.LocationSelector.TypeId.Root }
      ]);

      this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.FOCUS, this.hndEvent);

      this.setTitle("Animation | " );
    }

    public getState(): { [key: string]: string } {
      // TODO: iterate over views and collect their states for reconstruction
      return {};
    }

    private hndEvent = async (_event: FudgeEvent): Promise<void> => {
      // switch (_event.type) {

      // }

      this.broadcastEvent(_event);
      _event.stopPropagation();
    }
  }
}
