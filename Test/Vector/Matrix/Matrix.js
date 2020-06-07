var MatrixTest;
(function (MatrixTest) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    let coSys = [];
    let viewport = new ƒ.Viewport();
    let root = new ƒ.Node("Root");
    window.addEventListener("load", init);
    function init(_event) {
        for (let i = 0; i < 2; i++) {
            coSys.push(new ƒAid.NodeCoordinateSystem("CoSys", ƒ.Matrix4x4.IDENTITY()));
            root.addChild(coSys[i]);
            createUI(i);
        }
        document.querySelector("fieldset#Hierarchy").addEventListener("change", hndHierarchy);
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.pivot.translate(new ƒ.Vector3(1, 2, 2));
        cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        viewport.initialize("Viewport", root, cmpCamera, document.querySelector("canvas"));
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, animate);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 5);
    }
    function animate() {
        for (let i = 0; i < 2; i++) {
            displayMatrix(i, coSys[i].mtxLocal);
            move(i);
        }
        viewport.draw();
        let relative = calculateRelativeMatrix(coSys[1].mtxWorld, coSys[0].mtxWorld);
        console.log(relative.toString());
    }
    function move(_which) {
        let fieldset = document.querySelector("fieldset#Interact" + _which);
        let formData = new FormData(fieldset.querySelector("form"));
        // console.log(formData.get("t").valueOf(), formData.get("tValue"), formData.get("tDirection"));
        // console.log(formData.get("r"), formData.get("rValue"), formData.get("rDirection"));
        // console.log(formData.get("s"), formData.get("sValue"), formData.get("sDirection"));
        let translate = calcVector(String(formData.get("t")), Number(formData.get("tValue")), Number(formData.get("tDirection")));
        let rotate = calcVector(String(formData.get("r")), Number(formData.get("rValue")), Number(formData.get("rDirection")));
        let scale = calcVector(String(formData.get("s")), Number(formData.get("sValue")), Number(formData.get("sDirection")));
        coSys[_which].mtxLocal.translate(translate, false);
        coSys[_which].mtxLocal.rotate(rotate, false);
        scale.add(ƒ.Vector3.ONE());
        coSys[_which].mtxLocal.scale(scale);
    }
    function createUI(_which) {
        let fieldset;
        fieldset = document.querySelector("fieldset#Matrix" + _which);
        let element = 0;
        for (let prefix of ["X", "Y", "Z", "T"])
            for (let postfix of ["x", "y", "z", "w"]) {
                fieldset.innerHTML += `<span>${prefix}${postfix}&nbsp;<input id='m${element}' type='number' disabled /></span>`;
                if (++element % 4 == 0)
                    fieldset.innerHTML += "<br />";
            }
        fieldset = document.querySelector("fieldset#Interact" + _which);
        let table = "<form><table>";
        for (let transform of ["t", "r", "s"]) {
            let step = transform == "r" ? 1 : 0.1;
            let value = transform == "r" ? 5 : 0.1;
            table += `<tr><th>${transform}</th>`;
            for (let dimension of ["x", "y", "z"]) {
                let id = transform + dimension;
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
    async function hndKey(_event) {
        let slider = _event.target;
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
    async function tick() {
        animate();
        await ƒ.Time.game.delay(100);
        ƒ.Loop.continue();
    }
    function hndHierarchy(_event) {
        let hierarchy = Number(_event.target.value);
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
    function calcVector(_dimension, _value, _factor) {
        let vector = new ƒ.Vector3();
        vector[_dimension] = _factor * _value;
        return vector;
    }
    function displayMatrix(_which, _matrix) {
        let fieldset = document.querySelector("fieldset#Matrix" + _which);
        let data = _matrix.get();
        for (let index in data) {
            let input = fieldset.querySelector("#m" + index);
            input.value = data[index].toFixed(2);
        }
    }
    function calculateRelativeMatrix(_matrix, _relativeTo) {
        let result;
        result = ƒ.Matrix4x4.INVERSION(_relativeTo);
        result = ƒ.Matrix4x4.MULTIPLICATION(result, _matrix);
        return result;
    }
})(MatrixTest || (MatrixTest = {}));
//# sourceMappingURL=Matrix.js.map