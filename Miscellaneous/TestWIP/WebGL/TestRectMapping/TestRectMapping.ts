namespace TestRectMapping {
  import ƒ = FudgeCore;
  

  window.addEventListener("load", init);
  let uiMaps: { [name: string]: { ui: UI.FieldSet, framing: ƒ.Framing } } = {};
  let uiClient: UI.Rectangle;
  let canvas: HTMLCanvasElement;
  let viewPort: ƒ.Viewport = new ƒ.Viewport();
  let cmpCamera: ƒ.ComponentCamera;
  let uiCamera: UI.Camera;

  function init(): void {
    // create asset
    let graph: ƒ.Node = Scenes.createAxisCross();
    graph.addComponent(new ƒ.ComponentTransform());

    // initialize viewports
    canvas = document.getElementsByTagName("canvas")[0];
    cmpCamera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
    viewPort.initialize(canvas.id, graph, cmpCamera, canvas);

    let menu: HTMLDivElement = document.getElementsByTagName("div")[0];
    menu.innerHTML = "Test automatic rectangle transformation. Adjust CSS-Frame and framings";
    uiCamera = new UI.Camera();
    menu.appendChild(uiCamera);

    appendUIScale(menu, "DestinationToSource", viewPort.frameDestinationToSource);
    appendUIComplex(menu, "CanvasToDestination", viewPort.frameCanvasToDestination);
    appendUIScale(menu, "ClientToCanvas", viewPort.frameClientToCanvas);

    uiClient = new UI.Rectangle("ClientRectangle");
    uiClient.addEventListener("input", hndChangeOnClient);
    menu.appendChild(uiClient);

    update();
    uiCamera.addEventListener("input", hndChangeOnCamera);
    setCamera();
    viewPort.adjustingFrames = true;

    logMutatorInfo("Camera", cmpCamera);
    for (let name in uiMaps) {
      logMutatorInfo(name, uiMaps[name].framing);
    }

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
    ƒ.Loop.start();
    function animate(_event: Event): void {
      update();
      graph.mtxLocal.rotateY(1);
      viewPort.draw();
    }

  }

  function logMutatorInfo(_title: string, _mutable: ƒ.Mutable): void {
    let mutator: ƒ.Mutator = _mutable.getMutator();
    let types: ƒ.MutatorAttributeTypes = _mutable.getMutatorAttributeTypes(mutator);
    console.group(_title);
    console.log("Types: ", types);
    console.log("Mutator: ", mutator);
    console.groupEnd();
  }

  function appendUIComplex(_parent: HTMLElement, _name: string, _framing: ƒ.FramingComplex): void {
    let uiMap: UI.FramingComplex = new UI.FramingComplex(_name);
    uiMap.addEventListener("input", hndChangeOnComplex);
    _parent.appendChild(uiMap);
    uiMaps[_name] = { ui: uiMap, framing: _framing };
  }
  function appendUIScale(_parent: HTMLElement, _name: string, _framing: ƒ.FramingScaled): void {
    let uiMap: UI.FramingScaled = new UI.FramingScaled(_name);
    uiMap.addEventListener("input", hndChangeOnScale);
    _parent.appendChild(uiMap);
    uiMaps[_name] = { ui: uiMap, framing: _framing };
  }

  function hndChangeOnComplex(_event: Event): void {
    let target: UI.FramingComplex = <UI.FramingComplex>_event.currentTarget;
    setRectComplex(target);
  }
  function hndChangeOnScale(_event: Event): void {
    let target: UI.FramingScaled = <UI.FramingScaled>_event.currentTarget;
    setRectScale(target);
  }
  function hndChangeOnCamera(_event: Event): void {
    //let target: UI.Rectangle = <UI.Rectangle>_event.currentTarget;
    setCamera();
  }

  function hndChangeOnClient(_event: Event): void {
    let target: UI.Rectangle = <UI.Rectangle>_event.currentTarget;
    setClient(target);
  }

  function setRectComplex(_uiMap: UI.FramingComplex): void {
    let value: {} = _uiMap.get();
    let framing: ƒ.FramingComplex = <ƒ.FramingComplex>uiMaps[_uiMap.name].framing;
    for (let key in value) {
      switch (key) {
        case "Margin":
          framing.margin = <ƒ.Border>value[key];
          break;
        case "Padding":
          framing.padding = <ƒ.Border>value[key];
          break;
        case "Result":
          break;
        default:
          throw (new Error("Invalid name: " + key));
      }
    }
  }

  function setRectScale(_uiMap: UI.FramingScaled): void {
    let value: { normWidth: number, normHeight: number } = <{ normWidth: number, normHeight: number }>_uiMap.get();
    let framing: ƒ.FramingScaled = <ƒ.FramingScaled>uiMaps[_uiMap.name].framing;
    framing.setScale(value.normWidth, value.normHeight);
  }

  function setCamera(): void {
    let params: UI.ParamsCamera = uiCamera.get();
    cmpCamera.projectCentral(params.aspect, params.fieldOfView);
  }

  function setClient(_uiRectangle: UI.Rectangle): void {
    let rect: ƒ.Rectangle = <ƒ.Rectangle>_uiRectangle.get();
    canvas.style.left = rect.x + "px";
    canvas.style.top = rect.y + "px";
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
  }

  function update(): void {
    for (let name in uiMaps) {
      // uiMap.ui.set({ Margin: uiMap.map.margin, Padding: uiMap.map.padding });

      switch (name) {
        case "ClientToCanvas": {
          let uiMap: { ui: UI.FieldSet, framing: ƒ.FramingScaled } = <{ ui: UI.FramingScaled, framing: ƒ.FramingScaled }>uiMaps[name];
          uiMap.ui.set(uiMap.framing);
          uiMap.ui.set({ Result: viewPort.getCanvasRectangle() });
          break;
        }
        case "CanvasToDestination": {
          let uiMap: { ui: UI.FieldSet, framing: ƒ.FramingComplex } = <{ ui: UI.FieldSet, framing: ƒ.FramingComplex }>uiMaps[name];
          uiMap.ui.set({ Margin: uiMap.framing.margin, Padding: uiMap.framing.padding });
          uiMap.ui.set({ Result: viewPort.rectDestination });
          break;
        }
        case "DestinationToSource": {
          let uiMap: { ui: UI.FramingScaled, framing: ƒ.FramingScaled } = <{ ui: UI.FramingScaled, framing: ƒ.FramingScaled }>uiMaps[name];
          uiMap.ui.set(uiMap.framing);
          uiMap.ui.set({ Result: viewPort.rectSource });
          break;
        }
      }
    }
    let clientRect: ClientRect = canvas.getBoundingClientRect();
    uiClient.set(ƒ.Rectangle.GET(clientRect.left, clientRect.top, clientRect.width, clientRect.height));

    uiCamera.set({ aspect: cmpCamera.getAspect(), fieldOfView: cmpCamera.getFieldOfView() });
  }
}