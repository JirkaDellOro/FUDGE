namespace Fudge {
  import ƒ = FudgeCore;

  /**
   * Display the project structure and offer functions for creation of resources
   * @authors Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class PanelProject extends Panel {

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
    }

    public cleanup(): void {
      //TODO: desconstruct
    }
  }
}