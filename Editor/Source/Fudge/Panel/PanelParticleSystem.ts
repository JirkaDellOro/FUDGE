namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * TODO: add
   * @authors Jonas Plotzky, HFU, 2022
   */
  export class PanelParticleSystem extends Panel {
    public constructor(_container: ComponentContainer, _state: ViewState) {
      const config: RowOrColumnItemConfig = {
        type: "column",
        content: [{
          type: "component",
          componentType: VIEW.PARTICLE_SYSTEM,
          title: ƒ.ParticleSystem.name
        }]
      };

      super(_container, _state, { [VIEW.PARTICLE_SYSTEM]: ViewParticleSystem }, config);

      this.dom.addEventListener(EVENT_EDITOR.CLOSE, this.hndEvent);
      this.setTitle(ƒ.ParticleSystem.name);
    }

    // public getState(): { [key: string]: string } {
    //   // TODO: iterate over views and collect their states for reconstruction
    //   return {};
    // }

    private hndEvent = async (_event: EditorEvent): Promise<void> => {
      this.broadcast(_event);
      // _event.stopPropagation();
    };
  }
}
