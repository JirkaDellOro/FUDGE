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
      this.goldenLayout.registerComponentConstructor(VIEW.ANIMATION_SHEET, ViewAnimationSheet);

      const config: RowOrColumnItemConfig = {
        type: "row",
        content: [
          {
            type: "component",
            componentType: VIEW.ANIMATION,
            componentState: _state,
            title: "Properties"
          },
          {
            type: "component",
            componentType: VIEW.ANIMATION_SHEET,
            componentState: _state
          }
        ]
      };

      this.goldenLayout.addItemAtLocation(config, [
        { typeId: LayoutManager.LocationSelector.TypeId.Root }
      ]);

      this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);

      this.setTitle("Animation | ");
    }

    public getState(): { [key: string]: string } {
      // TODO: iterate over views and collect their states for reconstruction
      return {};
    }

    private hndEvent = async (_event: EditorEvent): Promise<void> => {
      switch (_event.type) {
        case EVENT_EDITOR.SELECT:
          let name: string = _event.detail.node?.getComponent(ƒ.ComponentAnimator)?.animation?.name;
          if (name)
            this.setTitle("Animation | " + name);

          break;
      }

      this.broadcast(_event);
      _event.stopPropagation();
    }
  }
}

