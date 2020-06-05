var MatrixTest;
(function (MatrixTest) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    let coSys;
    let viewport = new ƒ.Viewport();
    window.addEventListener("load", init);
    function init(_event) {
        createUI();
        coSys = new ƒAid.NodeCoordinateSystem("CoSys", ƒ.Matrix4x4.IDENTITY());
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.pivot.translate(new ƒ.Vector3(1, 2, 2));
        cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        viewport.initialize("Viewport", coSys, cmpCamera, document.querySelector("canvas"));
        update();
        displayVectors(coSys.mtxLocal);
        animate();
    }
    function animate() {
        window.setInterval(function () {
            let local = coSys.mtxLocal;
            // anim = [local.translation, local.rotation, local.scaling];
            // anim[2].x += 1;
            // anim[2].y += 1;
            // anim[2].z += 1;
            // setTransform(anim);
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
        let element = 0;
        for (let prefix of ["X", "Y", "Z", "T"])
            for (let postfix of ["x", "y", "z", "w"]) {
                fieldset.innerHTML += `<span>${prefix}${postfix}&nbsp;<input id='m${element}' type='number' disabled /></span>`;
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
        let matrix = ƒ.Matrix4x4.IDENTITY();
        matrix.translate(_vectors[0]);
        matrix.rotateZ(_vectors[1].z);
        matrix.rotateY(_vectors[1].y);
        matrix.rotateX(_vectors[1].x);
        matrix.scale(_vectors[2]);
        coSys.mtxLocal.set(matrix);
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
})(MatrixTest || (MatrixTest = {}));
//# sourceMappingURL=Matrix.js.map