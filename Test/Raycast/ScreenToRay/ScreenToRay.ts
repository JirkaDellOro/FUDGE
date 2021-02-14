namespace ScreenToRay {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  window.addEventListener("load", init);

  let uiMaps: { [name: string]: { ui: UI.FieldSet, framing: ƒ.Framing } } = {};
  let uiClient: UI.Rectangle;
  let menu: HTMLDivElement;

  let canvas: HTMLCanvasElement;
  let viewport: ƒ.Viewport = new ƒ.Viewport();
  let cmpCamera: ƒ.ComponentCamera;
  let uiCamera: UI.Camera;

  let mouse: ƒ.Vector2 = new ƒ.Vector2();
  let viewportRay: ƒ.Viewport = new ƒ.Viewport();
  let cameraRay: ƒ.ComponentCamera;
  let canvasRay: HTMLCanvasElement;

  let cursor: ƒAid.NodeArrow = new ƒAid.NodeArrow("Cursor", ƒ.Color.CSS("white"));

  function init(): void {
    // create asset
    let root: ƒ.Node = new ƒ.Node("Root");
    let cosys: ƒAid.Node = new ƒAid.NodeCoordinateSystem("CoSys", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(100)));
    cosys.getChildrenByName("ArrowBlue")[0].mtxLocal.rotateZ(45, true);
    cosys.getChildrenByName("ArrowBlue")[0].getChildrenByName("ArrowBlueShaft")[0].getComponent(ƒ.ComponentMaterial).clrPrimary.a = 0.5; // = ƒ.Color.CSS("white", 0.9);


    let object: ƒAid.Node = new ƒAid.Node(
      "Object",
      ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2)),
      new ƒ.Material("Object", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white"))),
      // new ƒ.Material("Object", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red"))),
      // new ƒ.MeshCube("Object")
      new ƒ.MeshSphere("Object", 15, 15)
    );

    root.appendChild(object);
    root.appendChild(cursor);

    // initialize viewports
    canvas = document.querySelector("canvas#viewport");
    cmpCamera = new ƒ.ComponentCamera();
    cmpCamera.projectCentral(1, 45, ƒ.FIELD_OF_VIEW.DIAGONAL, 2, 5);
    cmpCamera.pivot.translation = new ƒ.Vector3(1, 2, 3);
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    viewport.initialize(canvas.id, root, cmpCamera, canvas);
    canvas.addEventListener("mousemove", setCursorPosition);

    canvasRay = document.querySelector("canvas#ray");
    cameraRay = new ƒ.ComponentCamera();
    cameraRay.pivot.translation = new ƒ.Vector3(1, 2, 3);
    // cameraRay.projectCentral(1, 10);
    viewportRay.initialize("ray", root, cameraRay, canvasRay);
    viewportRay.adjustingFrames = true;

    menu = document.getElementsByTagName("div")[0];
    menu.innerHTML = "Test automatic rectangle transformation. Adjust CSS-Frame and framings";
    uiCamera = new UI.Camera();
    menu.appendChild(uiCamera);

    appendUIScale(menu, "DestinationToSource", viewport.frameDestinationToSource);
    appendUIComplex(menu, "CanvasToDestination", viewport.frameCanvasToDestination);
    appendUIScale(menu, "ClientToCanvas", viewport.frameClientToCanvas);

    uiClient = new UI.Rectangle("ClientRectangle");
    uiClient.addEventListener("input", hndChangeOnClient);
    menu.appendChild(uiClient);

    menu.appendChild(new UI.Point("Client"));
    menu.appendChild(new UI.Point("Canvas"));
    menu.appendChild(new UI.Point("Destination"));
    menu.appendChild(new UI.Point("Source"));
    menu.appendChild(new UI.Point("Render"));
    menu.appendChild(new UI.Point("Projection"));

    update();
    uiCamera.addEventListener("input", hndChangeOnCamera);
    setCamera();
    viewport.adjustingFrames = true;

    logMutatorInfo("Camera", cmpCamera);
    for (let name in uiMaps) {
      logMutatorInfo(name, uiMaps[name].framing);
    }

    document.addEventListener("keydown", hndKeydown);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
    ƒ.Loop.start();

    function animate(_event: Event): void {
      update();
      viewport.draw();
      adjustRayCamera();
      pick();
    }
  }

  function pick(): void {
    cursor.activate(false);
    let picks: ƒ.Pick[] = ƒ.Picker.pickViewport(viewport, mouse);
    cursor.activate(true);

    picks.sort((a: ƒ.Pick, b: ƒ.Pick) => a.zBuffer < b.zBuffer ? -1 : 1);

    let output: HTMLOutputElement = document.querySelector("output");
    output.innerHTML = "";
    for (let pick of picks) {
      output.innerHTML += "Name: " + pick.node.name + ", z: " + pick.zBuffer.toFixed(2) + "<br/>";
      // output.innerHTML += "luminance: " + pick.luminance.toFixed(2) + ", alpha: " + pick.alpha.toFixed(2) + "<br/>";
      output.innerHTML += "color: " + pick.color.toString() + "<br/>";
      output.innerHTML += "posWorld: " + pick.posWorld.toString() + "<br/>";
      output.innerHTML += "posMesh: " + pick.posMesh.toString() + "<br/>";
      output.innerHTML += "textureUV: " + pick.textureUV.toString() + "<br/>";
      output.innerHTML += "normal: " + pick.normal.toString() + "<br/>";
    }
    if (picks.length) {
      cursor.mtxLocal.translation = picks[0].posWorld;
      cursor.color = picks[0].color;
      cursor.mtxLocal.lookAt(ƒ.Vector3.SUM(picks[0].posWorld, picks[0].normal), ƒ.Vector3.SUM(ƒ.Vector3.ONE(), picks[0].normal));
    }
  }


  function adjustRayCamera(): void {
    let ray: ƒ.Ray = computeRay();

    ray.direction.transform(cmpCamera.pivot);

    cameraRay.pivot.lookAt(ray.direction);
    cameraRay.projectCentral(1, 5);
    viewportRay.draw();

    let crcRay: CanvasRenderingContext2D = canvasRay.getContext("2d");
    crcRay.translate(crcRay.canvas.width / 2, crcRay.canvas.height / 2);
    crcRay.strokeStyle = "white";
    crcRay.strokeRect(-10, -10, 20, 20);
  }

  function computeRay(): ƒ.Ray {
    let posMouse: ƒ.Vector2 = mouse.copy;
    setUiPoint("Client", posMouse);

    let posRender: ƒ.Vector2 = viewport.pointClientToRender(posMouse);
    setUiPoint("Render", posRender);

    let rect: ƒ.Rectangle = viewport.getClientRectangle();
    let result: ƒ.Vector2;
    result = viewport.frameClientToCanvas.getPoint(posMouse, rect);
    setUiPoint("Canvas", result);
    rect = viewport.getCanvasRectangle();
    result = viewport.frameCanvasToDestination.getPoint(result, rect);
    setUiPoint("Destination", result);
    result = viewport.frameDestinationToSource.getPoint(result, viewport.rectSource);
    setUiPoint("Source", result);
    //TODO: when Source, Render and RenderViewport deviate, continue transformation 

    let posProjection: ƒ.Vector2 = viewport.pointClientToProjection(posMouse);
    let rectProjection: ƒ.Rectangle = cmpCamera.getProjectionRectangle();
    setUiPoint("Projection", posProjection);

    let ray: ƒ.Ray = new ƒ.Ray(new ƒ.Vector3(-posProjection.x, posProjection.y, 1));

    return ray;
  }

  function setCursorPosition(_event: MouseEvent): void {
    mouse = new ƒ.Vector2(_event.clientX, _event.clientY);
  }

  function hndKeydown(_event: KeyboardEvent): void {
    let object: ƒ.Node = viewport.getBranch().getChildrenByName("Object")[0];
    object.mtxLocal.rotateY(5 * (_event.code == ƒ.KEYBOARD_CODE.A ? -1 : _event.code == ƒ.KEYBOARD_CODE.D ? 1 : 0));
    object.mtxLocal.rotateX(5 * (_event.code == ƒ.KEYBOARD_CODE.W ? -1 : _event.code == ƒ.KEYBOARD_CODE.S ? 1 : 0));
  }

  function setUiPoint(_name: string, _point: ƒ.Vector2): void {
    let uiPoint: UI.Point;
    uiPoint = menu.querySelector("fieldset[name=" + _name + "]");
    uiPoint.set(_point.getMutator());
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
    cmpCamera.projectCentral(params.aspect, params.fieldOfView, ƒ.FIELD_OF_VIEW.DIAGONAL, params.near, params.far); //);
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
          uiMap.ui.set({ Result: viewport.getCanvasRectangle() });
          break;
        }
        case "CanvasToDestination": {
          let uiMap: { ui: UI.FieldSet, framing: ƒ.FramingComplex } = <{ ui: UI.FieldSet, framing: ƒ.FramingComplex }>uiMaps[name];
          uiMap.ui.set({ Margin: uiMap.framing.margin, Padding: uiMap.framing.padding });
          uiMap.ui.set({ Result: viewport.rectDestination });
          break;
        }
        case "DestinationToSource": {
          let uiMap: { ui: UI.FramingScaled, framing: ƒ.FramingScaled } = <{ ui: UI.FramingScaled, framing: ƒ.FramingScaled }>uiMaps[name];
          uiMap.ui.set(uiMap.framing);
          uiMap.ui.set({ Result: viewport.rectSource });
          break;
        }
      }
    }
    let clientRect: ClientRect = canvas.getBoundingClientRect();
    uiClient.set(ƒ.Rectangle.GET(clientRect.left, clientRect.top, clientRect.width, clientRect.height));

    uiCamera.set({ aspect: cmpCamera.getAspect(), fieldOfView: cmpCamera.getFieldOfView(), near: cmpCamera.getNear(), far: cmpCamera.getFar() });
  }
}