namespace MarixTest {
    import ƒ = Fudge;
    let coSys: ƒ.Node;
    let viewport: ƒ.Viewport = new ƒ.Viewport();
    window.addEventListener("load", init);

    function init(_event: Event): void {
        createUI();
        coSys = Scenes.createCoordinateSystem();
        coSys.addComponent(new ƒ.ComponentTransform());

        ƒ.RenderManager.initialize();

        let camera: ƒ.Node = Scenes.createCamera(new ƒ.Vector3(1, 2, 2)); //, new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", coSys, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));

        update();

        // window.setInterval(
        //     function (): void {
        //         let local: ƒ.Matrix4x4 = coSys.cmpTransform.local;
        //         // body.cmpTransform.rotateY(-1.1);
        //         local.rotateY(1);
        //         // body.cmpTransform.rotateZ(-0.9);

        //         displayMatrix(local);
        //         displayVectors(local);
        //     },
        //     20);
    }

    function update(): void {
        ƒ.RenderManager.update();
        viewport.draw();
        let local: ƒ.Matrix4x4 = coSys.cmpTransform.local;
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
        for (let transform of ["t", "s", "r"]) {
            for (let dimension of ["x", "y", "z"]) {
                let id: string = transform + dimension;
                fieldset.innerHTML += `<span>${id} <input id='${id}' type='number' lastValue='0' stepped='0'/></span>`;
            }
            fieldset.innerHTML += "<br />";
        }

        fieldset.addEventListener("input", hndInteraction);
    }

    function hndInteraction(_event: Event): void {
        ƒ.Debug.log(_event);
        let input: HTMLInputElement = <HTMLInputElement>_event.target;
        let stepped: number = parseFloat(input.value) - parseFloat(input.getAttribute("lastValue"));
        input.setAttribute("stepped", stepped.toString());

        switch (input.id[0]) {
            case "t":
                translate(input);
                break;
            case "s":
                scale(input);
                break;
            case "r":
                rotate(input);
                break;
        }
        update();
        input.setAttribute("lastValue", input.value);
    }

    function translate(_input: HTMLInputElement): void {
        let vector: ƒ.Vector3 = calcInputVector(_input);
        vector.scale(0.1);
        coSys.cmpTransform.local.translate(vector);
    }
    function scale(_input: HTMLInputElement): void {
        let vector: ƒ.Vector3 = calcInputVector(_input);
        vector.scale(0.1);
        vector.add(new ƒ.Vector3(1, 1, 1));
        coSys.cmpTransform.local.scale(vector);
    }
    function rotate(_input: HTMLInputElement): void {
        let vector: ƒ.Vector3 = calcInputVector(_input);
        vector.scale(5);
        coSys.cmpTransform.local.rotateY(vector.y);
        coSys.cmpTransform.local.rotateX(vector.x);
        coSys.cmpTransform.local.rotateZ(vector.z);
    }

    function calcInputVector(_input: HTMLInputElement): ƒ.Vector3 {
        let dimension: string = _input.id[1];
        let vector: ƒ.Vector3 = new ƒ.Vector3();
        let stepdown: boolean = 0 > parseFloat(_input.getAttribute("stepped"));
        vector[dimension] = stepdown ? -1 : 1;
        return vector;
    }

    function displayMatrix(_matrix: ƒ.Matrix4x4): void {
        for (let index in _matrix.data) {
            let input: HTMLInputElement = document.querySelector("#m" + index);
            input.value = _matrix.data[index].toFixed(2);
        }
    }
    function displayVectors(_matrix: ƒ.Matrix4x4): void {
        let vectors: ƒ.Vector3[] = _matrix.getVectorRepresentation();
        for (let transform of ["t", "s", "r"]) {
            let vector: ƒ.Vector3 = vectors.shift();
            for (let dimension of ["x", "y", "z"]) {
                let id: string = transform + dimension;
                let input: HTMLInputElement = document.querySelector("#" + id);
                input.value = vector[dimension].toFixed(2);
            }
        }
    }
}