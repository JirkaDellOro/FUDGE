var MarixTest;
(function (MarixTest) {
    var ƒ = Fudge;
    let coSys;
    let viewport = new ƒ.Viewport();
    window.addEventListener("load", init);
    function init(_event) {
        createUI();
        coSys = Scenes.createCoordinateSystem();
        coSys.addComponent(new ƒ.ComponentTransform());
        ƒ.RenderManager.initialize();
        let camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 2)); //, new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", coSys, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));
        update();
        displayVectors(coSys.cmpTransform.local);
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
    function update() {
        ƒ.RenderManager.update();
        viewport.draw();
        let local = coSys.cmpTransform.local;
        displayMatrix(local);
        // displayVectors(local);
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
        for (let transform of ["t", "s", "r"]) {
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
        let stepped = parseFloat(input.value) - parseFloat(input.getAttribute("lastValue"));
        input.setAttribute("stepped", stepped.toString());
        let absolute = document.querySelector("#absolute").checked;
        if (absolute)
            interactAbsolute(input);
        else
            interactRelative(input);
        update();
        input.setAttribute("lastValue", input.value);
    }
    function interactAbsolute(_input) {
        let vectors = [];
        for (let transform of ["t", "s", "r"]) {
            let vector = new ƒ.Vector3();
            for (let dimension of ["x", "y", "z"]) {
                let id = transform + dimension;
                let input = document.querySelector("#" + id);
                vector[dimension] = parseFloat(input.value);
            }
            vectors.push(vector);
        }
        let matrix = ƒ.Matrix4x4.IDENTITY;
        matrix.rotateX(vectors[2].x);
        matrix.rotateZ(vectors[2].z);
        matrix.rotateY(vectors[2].y);
        matrix.scale(vectors[1]);
        matrix.translate(vectors[0]);
        ƒ.Debug.log(matrix);
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
        for (let index in _matrix.data) {
            let input = document.querySelector("#m" + index);
            input.value = _matrix.data[index].toFixed(2);
        }
    }
    function displayVectors(_matrix) {
        let vectors = _matrix.getVectorRepresentation();
        for (let transform of ["t", "s", "r"]) {
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