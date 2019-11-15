namespace MarixTest {
    import ƒ = FudgeCore;
    let coSys: ƒ.Node;
    let viewport: ƒ.Viewport = new ƒ.Viewport();
    window.addEventListener("load", init);
    let anim: ƒ.Vector3[] = [ƒ.Vector3.ZERO(), new ƒ.Vector3(1, 1, 1), new ƒ.Vector3(0, 0, 0)];

    function init(_event: Event): void {
        createUI();
        coSys = Scenes.createCoordinateSystem();
        coSys.addComponent(new ƒ.ComponentTransform());

        ƒ.RenderManager.initialize();

        let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(1, 2, 2)); //, new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", coSys, cmpCamera, document.querySelector("canvas"));

        update();
        displayVectors(coSys.cmpTransform.local);

        animate();
    }

    function animate(): void {
        window.setInterval(
            function (): void {
                let local: ƒ.Matrix4x4 = coSys.cmpTransform.local;

                anim = [local.translation, local.rotation, local.scaling];
                // anim[2].x += 1;
                // anim[2].y += 1;
                // anim[2].z += 1;
                setTransform(anim);

                update();
            },
            20);
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
        for (let transform of ["t", "r", "s"]) {
            for (let dimension of ["x", "y", "z"]) {
                let id: string = transform + dimension;
                fieldset.innerHTML += `<span>${id} <input id='${id}' type='number' lastValue='0' stepped='0'/></span>`;
            }
            fieldset.innerHTML += "<br />";
        }

        fieldset.addEventListener("input", hndInteraction);
    }

    function hndInteraction(_event: Event): void {
        let input: HTMLInputElement = <HTMLInputElement>_event.target;
        if (input.name == "Interact") {
            let local: ƒ.Matrix4x4 = coSys.cmpTransform.local;
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
        let vectors: ƒ.Vector3[] = [];
        for (let transform of ["t", "r", "s"]) {
            let vector: ƒ.Vector3 = new ƒ.Vector3();
            for (let dimension of ["x", "y", "z"]) {
                let id: string = transform + dimension;
                let input: HTMLInputElement = <HTMLInputElement>document.querySelector("#" + id);
                vector[dimension] = parseFloat(input.value);
            }
            vectors.push(vector);
        }
        setTransform(vectors);
    }

    function setTransform(_vectors: ƒ.Vector3[]): void {
        let matrix: ƒ.Matrix4x4 = ƒ.Matrix4x4.IDENTITY;
        matrix.translate(_vectors[0]);
        matrix.rotateZ(_vectors[1].z);
        matrix.rotateY(_vectors[1].y);
        matrix.rotateX(_vectors[1].x);
        matrix.scale(_vectors[2]);

        coSys.cmpTransform.local = matrix;
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
        let data: Float32Array = _matrix.get();
        for (let index in data) {
            let input: HTMLInputElement = document.querySelector("#m" + index);
            input.value = data[index].toFixed(2);
        }
    }
    function displayVectors(_matrix: ƒ.Matrix4x4): void {
        let vectors: ƒ.Vector3[] = [_matrix.translation, _matrix.rotation, _matrix.scaling];
        for (let transform of ["t", "r", "s"]) {
            let vector: ƒ.Vector3 = vectors.shift();
            for (let dimension of ["x", "y", "z"]) {
                let id: string = transform + dimension;
                let input: HTMLInputElement = document.querySelector("#" + id);
                input.value = vector[dimension].toFixed(2);
            }
        }
    }
}