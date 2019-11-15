var MarixTest;
(function (MarixTest) {
    var ƒ = FudgeCore;
    let coSys;
    let viewport = new ƒ.Viewport();
    window.addEventListener("load", init);
    let anim = [ƒ.Vector3.ZERO(), new ƒ.Vector3(1, 1, 1), new ƒ.Vector3(0, 0, 0)];
    function init(_event) {
        createUI();
        coSys = Scenes.createCoordinateSystem();
        coSys.addComponent(new ƒ.ComponentTransform());
        ƒ.RenderManager.initialize();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(1, 2, 2)); //, new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", coSys, cmpCamera, document.querySelector("canvas"));
        update();
        displayVectors(coSys.cmpTransform.local);
        animate();
    }
    function animate() {
        window.setInterval(function () {
            let local = coSys.cmpTransform.local;
            anim = [local.translation, local.rotation, local.scaling];
            // anim[2].x += 1;
            // anim[2].y += 1;
            // anim[2].z += 1;
            setTransform(anim);
            update();
        }, 20);
    }
    function update() {
        ƒ.RenderManager.update();
        viewport.draw();
        let local = coSys.cmpTransform.local;
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
            for (let dimension of ["x", "y", "z"]) {
                let id = transform + dimension;
                fieldset.innerHTML += `<span>${id} <input id='${id}' type='number' lastValue='0' stepped='0'/></span>`;
            }
            fieldset.innerHTML += "<br />";
        }
        fieldset.addEventListener("input", hndInteraction);
    }
    function hndInteraction(_event) {
        let input = _event.target;
        if (input.name == "Interact") {
            let local = coSys.cmpTransform.local;
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
        let vectors = [];
        for (let transform of ["t", "r", "s"]) {
            let vector = new ƒ.Vector3();
            for (let dimension of ["x", "y", "z"]) {
                let id = transform + dimension;
                let input = document.querySelector("#" + id);
                vector[dimension] = parseFloat(input.value);
            }
            vectors.push(vector);
        }
        setTransform(vectors);
    }
    function setTransform(_vectors) {
        let matrix = ƒ.Matrix4x4.IDENTITY;
        matrix.translate(_vectors[0]);
        matrix.rotateZ(_vectors[1].z);
        matrix.rotateY(_vectors[1].y);
        matrix.rotateX(_vectors[1].x);
        matrix.scale(_vectors[2]);
        coSys.cmpTransform.local = matrix;
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
        coSys.cmpTransform.local.translate(vector);
    }
    function scale(_input) {
        let vector = calcInputVector(_input);
        vector.scale(0.1);
        vector.add(new ƒ.Vector3(1, 1, 1));
        coSys.cmpTransform.local.scale(vector);
    }
    function rotate(_input) {
        let vector = calcInputVector(_input);
        vector.scale(5);
        coSys.cmpTransform.local.rotateY(vector.y);
        coSys.cmpTransform.local.rotateX(vector.x);
        coSys.cmpTransform.local.rotateZ(vector.z);
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
        let vectors = [_matrix.translation, _matrix.rotation, _matrix.scaling];
        for (let transform of ["t", "r", "s"]) {
            let vector = vectors.shift();
            for (let dimension of ["x", "y", "z"]) {
                let id = transform + dimension;
                let input = document.querySelector("#" + id);
                input.value = vector[dimension].toFixed(2);
            }
        }
    }
})(MarixTest || (MarixTest = {}));
//# sourceMappingURL=Matrix.js.map