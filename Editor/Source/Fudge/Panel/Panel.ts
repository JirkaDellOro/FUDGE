///<reference path="../View/View.ts"/>
namespace Fudge {
  import ƒ = FudgeCore;

  /**
   * Base class for all [[Panel]]s aggregating [[View]]s
   * Subclasses are presets for common panels. A user might add or delete [[View]]s at runtime
   * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */

  // TODO: class might become a customcomponent for HTML! = this.dom

  // extends view vorrübergehend entfernt
  export abstract class Panel extends View {
    protected goldenLayout: GoldenLayout;
    private views: View[] = [];
    //public dom; // muss vielleicht weg

    constructor(_container: ComponentContainer, _state: JsonValue | undefined) {
      super(_container, _state);
      //this.dom = document.createElement("div"); // muss vielleicht wieder weg
      //this.dom.style.height = "100%"; // muss vielleicht wieder weg
      this.dom.style.width = "100%";
      this.dom.style.overflow = "visible";
      this.dom.removeAttribute("view");  // wieder hinzufügen
      this.dom.setAttribute("panel", this.constructor.name);
      //_container.element.appendChild(this.dom); // muss vielleicht wieder weg

      let oldconfig: any = {
        settings: { showPopoutIcon: false },
        content: [{
          type: "row", content: []
        }]
      };

      const config: LayoutConfig = {
        root: {
          type: "row",
          isClosable: true,
          content: [
            // {
            //   type: "component",
            //   componentType: "anfang",
            //   content: []
            // }
          ]
        }
      }

      this.goldenLayout = new Page.goldenLayoutModule.GoldenLayout(this.dom);

      console.log("kann weg wenn es funktioniert");
      console.log(this.goldenLayout);

      this.goldenLayout.on("stateChanged", () => this.goldenLayout.updateRootSize());
      //this.goldenLayout.on("componentCreated", this.addViewComponent);                // Vorerst auskomentiert zu testzwecken
      this.goldenLayout.on("itemCreated", this.addViewComponent);
      // this.goldenLayout.on("itemCreated", () => {
      //   console.log("itemcreated Test");
      // })

      // this.goldenLayout.registerComponentFactoryFunction("anfang", (container, state) => {
      //   let newDiv = document.createElement("div")
      //   console.log(newDiv);
      //   newDiv.style.height = "100%";
      //   newDiv.style.width = "100%";
      //   newDiv.style.color = "white";
      //   newDiv.innerHTML = "<h2> This is a first component test usw. </h2>";
      //   newDiv.innerHTML += "<form> <label for='vname'>Vorname: <input id='vname' name='vname'></label>";
      //   newDiv.innerHTML += "<label for='zname'>Zuname: <input id='zname' name='zname'></label>"
      //   container.element.appendChild(newDiv);
      // })


      this.goldenLayout.loadLayout(config);
    }

    /** Send custom copies of the given event to the views */
    public broadcastEvent = (_event: Event): void => {
       console.log("views", this.views);
      for (let view of this.views) {
        let event: CustomEvent = new CustomEvent(_event.type, { bubbles: false, cancelable: true, detail: (<CustomEvent>_event).detail });
        view.dom.dispatchEvent(event);
      }
    }

    private addViewComponent = (_component: Object): void => {
      this.views.push(<View>(<ƒ.General>_component).instance);
    }
  }
}