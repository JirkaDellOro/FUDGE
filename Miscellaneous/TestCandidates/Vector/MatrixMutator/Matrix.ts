namespace MarixMutatorTest {
  import ƒ = FudgeCore;
  

  let coSys: ƒ.Node;
  let viewport: ƒ.Viewport = new ƒ.Viewport();
  window.addEventListener("load", init);
  let mutator: ƒ.Mutator;

  function init(_event: Event): void {
    createUI();
    coSys = Scenes.createCoordinateSystem();
    coSys.addComponent(new ƒ.ComponentTransform());


    let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(1, 2, 2)); //, new ƒ.Vector3(0, 0, 0));
    viewport.initialize("Viewport", coSys, cmpCamera, document.querySelector("canvas"));

    update();
    displayVectors(coSys.mtxLocal);

    animate();
  }

  function animate(): void {
    window.setInterval(
      function (): void {
        let local: ƒ.Matrix4x4 = coSys.mtxLocal;

        mutator = local.getMutator();
        local.mutate(mutator);

        update();
      },
      20);
  }

  function update(): void {
    viewport.draw();
    let local: ƒ.Matrix4x4 = coSys.mtxLocal;
    displayMatrix(local);
    displayVectors(local);
  }

  function createUI(): void {
    let fieldset: HTMLFieldSetElement;
    fieldset = document.querySelector("#Matrix");
    for (let element: number = 0; element < 16;) {
      fieldset.innerHTML += `<span>${element} <input id='m${element}' type='number' disabled /></span>`;
      if (++element % 4 == 0)
        fieldset.innerHTML += "<br />";
    }

    fieldset = document.querySelector("#Vectors");
    for (let transform of ["t", "r", "s"]) {
      let step: number = (transform == "r") ? 5 : 0.1;
      for (let dimension of ["x", "y", "z"]) {
        let id: string = transform + dimension;
        fieldset.innerHTML += `<span>${id} <input id='${id}' type='number' step='${step}' lastValue='0' stepped='0'/></span>`;
      }
      fieldset.innerHTML += "<br />";
    }

    fieldset.addEventListener("input", hndInteraction);
  }

  function hndInteraction(_event: Event): void {
    let input: HTMLInputElement = <HTMLInputElement>_event.target;
    if (input.name == "Interact") {
      let local: ƒ.Matrix4x4 = coSys.mtxLocal;
      displayVectors(local);
      return;
    }
    let stepped: number = parseFloat(input.value) - parseFloat(input.getAttribute("lastValue"));
    input.setAttribute("stepped", stepped.toString());

    if (isAbsolute())
      interactAbsolute(input);
    else
      interactRelative(input);

    update();
    input.setAttribute("lastValue", input.value);
  }

  function isAbsolute(): boolean {
    return (<HTMLInputElement>document.querySelector("#absolute")).checked;
  }

  function interactAbsolute(_input: HTMLInputElement): void {
    let mutator: ƒ.Mutator = {};
    for (let transform of ["translation", "rotation", "scaling"]) {
      let vector: ƒ.Vector3 = new ƒ.Vector3();
      for (let dimension of ["x", "y", "z"]) {
        let id: string = transform[0] + dimension;
        let input: HTMLInputElement = <HTMLInputElement>document.querySelector("#" + id);
        vector[dimension] = parseFloat(input.value);
      }
      mutator[transform] = vector;
    }

    coSys.mtxLocal.mutate(mutator);
  }

  function interactRelative(_input: HTMLInputElement): void {

    switch (_input.id[0]) {
      case "t":
        translate(_input);
        break;
      case "s":
        scale(_input);
        break;
      case "r":
        rotate(_input);
        break;
    }
  }

  function translate(_input: HTMLInputElement): void {
    let vector: ƒ.Vector3 = calcInputVector(_input);
    vector.scale(0.1);
    coSys.mtxLocal.translate(vector);
  }
  function scale(_input: HTMLInputElement): void {
    let vector: ƒ.Vector3 = calcInputVector(_input);
    vector.scale(0.1);
    vector.add(new ƒ.Vector3(1, 1, 1));
    coSys.mtxLocal.scale(vector);
  }
  function rotate(_input: HTMLInputElement): void {
    let vector: ƒ.Vector3 = calcInputVector(_input);
    vector.scale(5);
    coSys.mtxLocal.rotateY(vector.y);
    coSys.mtxLocal.rotateX(vector.x);
    coSys.mtxLocal.rotateZ(vector.z);
  }

  function calcInputVector(_input: HTMLInputElement): ƒ.Vector3 {
    let dimension: string = _input.id[1];
    let vector: ƒ.Vector3 = new ƒ.Vector3();
    let stepdown: boolean = 0 > parseFloat(_input.getAttribute("stepped"));
    vector[dimension] = stepdown ? -1 : 1;
    return vector;
  }

  function displayMatrix(_matrix: ƒ.Matrix4x4): void {
    let data: Float32Array = _matrix.get();
    for (let index in data) {
      let input: HTMLInputElement = document.querySelector("#m" + index);
      input.value = data[index].toFixed(2);
    }
  }
  function displayVectors(_matrix: ƒ.Matrix4x4): void {
    let mutator: ƒ.Mutator = _matrix.getMutator();
    for (let transform of ["translation", "rotation", "scaling"]) {
      let vector: ƒ.Vector3 = <ƒ.Vector3>mutator[transform];
      for (let dimension of ["x", "y", "z"]) {
        let id: string = transform[0] + dimension;
        let input: HTMLInputElement = document.querySelector("#" + id);
        input.value = vector[dimension].toFixed(2);
      }
    }
  }
}