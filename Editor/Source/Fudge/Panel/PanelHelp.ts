namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
  * Shows a help and documentation
  * @authors Jirka Dell'Oro-Friedl, HFU, 2021
  */
  export class PanelHelp extends Panel {
    constructor(_container: ComponentContainer, _state: JsonValue | undefined) {
      super(_container, _state);
      this.setTitle("Help");
      console.log(this.dom);
      // TODO: iframe sandbox disallows use of scripts, remove or replace with object if necessary
      // this.dom.innerHTML = `<iframe src="Help.html" sandbox></iframe>`;
      this.dom.innerHTML = `<object data="Help.html"></object>`;

      // const config: RowOrColumnItemConfig = {
      //   type: "column",
      //   isClosable: true,
      //   content: [
      //     {
      //       type: "component",
      //       componentType: VIEW.RENDER,
      //       componentState: _state,
      //       title: "Render"
      //     }
      //   ]
      // };

      // this.goldenLayout.addItemAtLocation(config, [{ typeId: LayoutManager.LocationSelector.TypeId.Root }]);
    }

    public getState(): { [key: string]: string } {
      return {};
    }
  }
}