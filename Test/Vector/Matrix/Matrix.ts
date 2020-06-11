namespace MatrixTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;


  let coSys: ƒ.Node[] = [];
  let viewport: ƒ.Viewport = new ƒ.Viewport();
  let root: ƒ.Node = new ƒ.Node("Root");

  window.addEventListener("load", init);

  function init(_event: Event): void {
    for (let i: number = 0; i < 2; i++) {
      coSys.push(new ƒAid.NodeCoordinateSystem("CoSys", ƒ.Matrix4x4.IDENTITY()));
      root.addChild(coSys[i]);
      createUI(i);
    }
    document.querySelector("fieldset#Hierarchy").addEventListener("change", hndHierarchy);

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translate(new ƒ.Vector3(1, 2, 2));
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    viewport.initialize("Viewport", root, cmpCamera, document.querySelector("canvas"));

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 5);
  }

  function animate(): void {
    for (let i: number = 0; i < 2; i++) {
      displayMatrix(i, coSys[i].mtxLocal);
      move(i);
    }
    viewport.draw();

    // let relative: ƒ.Matrix4x4 = calculateRelativeMatrix(coSys[1].mtxWorld, coSys[0].mtxWorld);
    // console.log("Relative", relative.toString());
    // console.log("Local", coSys[1].mtxLocal.toString());
    // coSys[1].cmpTransform.local = relative;
  }


  function move(_which: number): void {
    let fieldset: HTMLFieldSetElement = document.querySelector("fieldset#Interact" + _which);
    let formData: FormData = new FormData(fieldset.querySelector("form"));
    // console.log(formData.get("t").valueOf(), formData.get("tValue"), formData.get("tDirection"));
    // console.log(formData.get("r"), formData.get("rValue"), formData.get("rDirection"));
    // console.log(formData.get("s"), formData.get("sValue"), formData.get("sDirection"));

    let translate: ƒ.Vector3 = calcVector(String(formData.get("t")), Number(formData.get("tValue")), Number(formData.get("tDirection")));
    let rotate: ƒ.Vector3 = calcVector(String(formData.get("r")), Number(formData.get("rValue")), Number(formData.get("rDirection")));
    let scale: ƒ.Vector3 = calcVector(String(formData.get("s")), Number(formData.get("sValue")), Number(formData.get("sDirection")));

    // let transform: ƒ.Matrix4x4 = ƒ.Matrix4x4.IDENTITY();
    // coSys[_which].mtxLocal.translate(translate, false);
    // coSys[_which].mtxLocal.rotate(rotate, false);
    // scale.add(ƒ.Vector3.ONE());
    // coSys[_which].mtxLocal.scale(scale);

    let transform: ƒ.Matrix4x4 = ƒ.Matrix4x4.IDENTITY();
    transform.translate(translate, false);
    transform.rotate(rotate, false);
    scale.add(ƒ.Vector3.ONE());
    transform.scale(scale);

    let move: ƒ.Matrix4x4 = coSys[_which].mtxLocal.copy;

    if (_which == 1) {
      // move = calculateRelativeMatrix(move, coSys[0].mtxWorld);
      // move.multiply(transform);
      // move.multiply(coSys[0].mtxLocal, true);
      // move = calculateRelativeMatrix(move, root.mtxWorld);
      transformRelative(transform, coSys[1].cmpTransform, coSys[0].cmpTransform);
    }
    else {
      move.multiply(transform);
      coSys[_which].cmpTransform.local = move;
    }
  }

  function transformRelative(_transform: ƒ.Matrix4x4, _move: ƒ.ComponentTransform, _relativeTo: ƒ.ComponentTransform): void {
    let mtxMove: ƒ.Matrix4x4 = _move.local.copy;
    let containerRelative: ƒ.Node = _relativeTo.getContainer();
    let containerMove: ƒ.Node = _move.getContainer();

    if (containerRelative)
      mtxMove = calculateRelativeMatrix(mtxMove, containerRelative.mtxWorld);
    else
      mtxMove = calculateRelativeMatrix(mtxMove, _relativeTo.local);

    mtxMove.multiply(_transform);
    mtxMove.multiply(_relativeTo.local, true);

    // if (containerMove)
    //   mtxMove = calculateRelativeMatrix(mtxMove, containerMove.mtxWorld);

    _move.local = mtxMove;
  }


  function createUI(_which: number): void {
    let fieldset: HTMLFieldSetElement;
    fieldset = document.querySelector("fieldset#Matrix" + _which);
    let element: number = 0;
    for (let prefix of ["X", "Y", "Z", "T"])
      for (let postfix of ["x", "y", "z", "w"]) {
        fieldset.innerHTML += `<span>${prefix}${postfix}&nbsp;<input id='m${element}' type='number' disabled /></span>`;
        if (++element % 4 == 0)
          fieldset.innerHTML += "<br />";
      }

    fieldset = document.querySelector("fieldset#Interact" + _which);
    let table: string = "<form><table>";
    for (let transform of ["t", "r", "s"]) {
      let step: number = transform == "r" ? 1 : 0.1;
      let value: number = transform == "r" ? 5 : 0.1;
      table += `<tr><th>${transform}</th>`;
      for (let dimension of ["x", "y", "z"]) {
        let id: string = transform + dimension;
        // fieldset.innerHTML += `<span>${id} <input id='${id}' type='number' step='0.1'/><button>+</button><button>-</button></span>`;
        table += `<td><input type="radio" name="${transform}" value="${dimension}" id="${id}" ${dimension == "x" ? "checked" : ""}></input>`;
        table += `<label for="${id}">${dimension}</label></td>`;
      }
      table += `<td><input type="number" name="${transform}Value" step="${step}" value="${value}"></input></td>`;
      table += `<td><input type="range" name="${transform}Direction" step="1" value="0" min="-1" max="1"></input></td>`;
      table += "</tr>";
    }
    table += "</table></form>";
    console.log(table);
    fieldset.innerHTML += table;


    fieldset.addEventListener("keyup", hndKey);
    fieldset.addEventListener("keydown", hndKey);
  }

  async function hndKey(_event: ƒ.EventKeyboard): Promise<void> {
    let slider: HTMLInputElement = <HTMLInputElement>_event.target;
    if (slider.type != "range")
      return;
    if (_event.code != ƒ.KEYBOARD_CODE.ARROW_LEFT && _event.code != ƒ.KEYBOARD_CODE.ARROW_RIGHT)
      return;

    if (_event.type == "keyup")
      slider.value = "0";
    else {
      ƒ.Loop.stop();
      window.setTimeout(tick, 10);
    }
  }

  async function tick(): Promise<void> {
    animate();
    await ƒ.Time.game.delay(100);
    ƒ.Loop.continue();
  }

  function hndHierarchy(_event: Event): void {
    let hierarchy: number = Number((<HTMLInputElement>_event.target).value);
    switch (hierarchy) {
      case 0:
        root.appendChild(coSys[0]);
        coSys[0].appendChild(coSys[1]);
        break;
      case 1:
        root.appendChild(coSys[1]);
        coSys[1].appendChild(coSys[0]);
        break;
      default:
        root.appendChild(coSys[0]);
        root.appendChild(coSys[1]);
        break;
    }
  }

  function calcVector(_dimension: string, _value: number, _factor: number): ƒ.Vector3 {
    let vector: ƒ.Vector3 = new ƒ.Vector3();
    vector[_dimension] = _factor * _value;
    return vector;
  }

  function displayMatrix(_which: number, _matrix: ƒ.Matrix4x4): void {
    let fieldset: HTMLFieldSetElement = document.querySelector("fieldset#Matrix" + _which);
    let data: Float32Array = _matrix.get();
    for (let index in data) {
      let input: HTMLInputElement = fieldset.querySelector("#m" + index);
      input.value = data[index].toFixed(2);
    }
  }

  function calculateRelativeMatrix(_matrix: ƒ.Matrix4x4, _relativeTo: ƒ.Matrix4x4): ƒ.Matrix4x4 {
    let result: ƒ.Matrix4x4;
    result = ƒ.Matrix4x4.INVERSION(_relativeTo);
    result = ƒ.Matrix4x4.MULTIPLICATION(result, _matrix);
    return result;
  }
}