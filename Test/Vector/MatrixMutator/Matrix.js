var MarixMutatorTest;
(function (MarixMutatorTest) {
    var ƒ = FudgeCore;
    let coSys;
    let viewport = new ƒ.Viewport();
    window.addEventListener("load", init);
    let mutator;
    function init(_event) {
        createUI();
        coSys = Scenes.createCoordinateSystem();
        coSys.addComponent(new ƒ.ComponentTransform());
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(1, 2, 2)); //, new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", coSys, cmpCamera, document.querySelector("canvas"));
        update();
        displayVectors(coSys.mtxLocal);
        animate();
    }
    function animate() {
        window.setInterval(function () {
            let local = coSys.mtxLocal;
            mutator = local.getMutator();
            local.mutate(mutator);
            update();
        }, 20);
    }
    function update() {
        viewport.draw();
        let local = coSys.mtxLocal;
        displayMatrix(local);
        displayVectors(local);
    }
    function createUI() {
        let fieldset;
        fieldset = document.querySelector("#Matrix");
        for (let element = 0; element < 16;) {
            fieldset.innerHTML += `<span>${element} <input id='m${element}' type='number' disabled /></span>`;
            if (++element % 4 == 0)
                fieldset.innerHTML += "<br />";
        }
        fieldset = document.querySelector("#Vectors");
        for (let transform of ["t", "r", "s"]) {
            let step = (transform == "r") ? 5 : 0.1;
            for (let dimension of ["x", "y", "z"]) {
                let id = transform + dimension;
                fieldset.innerHTML += `<span>${id} <input id='${id}' type='number' step='${step}' lastValue='0' stepped='0'/></span>`;
            }
            fieldset.innerHTML += "<br />";
        }
        fieldset.addEventListener("input", hndInteraction);
    }
    function hndInteraction(_event) {
        let input = _event.target;
        if (input.name == "Interact") {
            let local = coSys.mtxLocal;
            displayVectors(local);
            return;
        }
        let stepped = parseFloat(input.value) - parseFloat(input.getAttribute("lastValue"));
        input.setAttribute("stepped", stepped.toString());
        if (isAbsolute())
            interactAbsolute(input);
        else
            interactRelative(input);
        update();
        input.setAttribute("lastValue", input.value);
    }
    function isAbsolute() {
        return document.querySelector("#absolute").checked;
    }
    function interactAbsolute(_input) {
        let mutator = {};
        for (let transform of ["translation", "rotation", "scaling"]) {
            let vector = new ƒ.Vector3();
            for (let dimension of ["x", "y", "z"]) {
                let id = transform[0] + dimension;
                let input = document.querySelector("#" + id);
                vector[dimension] = parseFloat(input.value);
            }
            mutator[transform] = vector;
        }
        coSys.mtxLocal.mutate(mutator);
    }
    function interactRelative(_input) {
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
    function translate(_input) {
        let vector = calcInputVector(_input);
        vector.scale(0.1);
        coSys.mtxLocal.translate(vector);
    }
    function scale(_input) {
        let vector = calcInputVector(_input);
        vector.scale(0.1);
        vector.add(new ƒ.Vector3(1, 1, 1));
        coSys.mtxLocal.scale(vector);
    }
    function rotate(_input) {
        let vector = calcInputVector(_input);
        vector.scale(5);
        coSys.mtxLocal.rotateY(vector.y);
        coSys.mtxLocal.rotateX(vector.x);
        coSys.mtxLocal.rotateZ(vector.z);
    }
    function calcInputVector(_input) {
        let dimension = _input.id[1];
        let vector = new ƒ.Vector3();
        let stepdown = 0 > parseFloat(_input.getAttribute("stepped"));
        vector[dimension] = stepdown ? -1 : 1;
        return vector;
    }
    function displayMatrix(_matrix) {
        let data = _matrix.get();
        for (let index in data) {
            let input = document.querySelector("#m" + index);
            input.value = data[index].toFixed(2);
        }
    }
    function displayVectors(_matrix) {
        let mutator = _matrix.getMutator();
        for (let transform of ["translation", "rotation", "scaling"]) {
            let vector = mutator[transform];
            for (let dimension of ["x", "y", "z"]) {
                let id = transform[0] + dimension;
                let input = document.querySelector("#" + id);
                input.value = vector[dimension].toFixed(2);
            }
        }
    }
})(MarixMutatorTest || (MarixMutatorTest = {}));
//# sourceMappingURL=Matrix.js.map