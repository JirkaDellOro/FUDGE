var Marix3x3;
(function (Marix3x3) {
    var ƒ = FudgeCore;
    window.addEventListener("load", handeLoad);
    let crc2;
    function handeLoad(_event) {
        crc2 = document.querySelector("canvas").getContext("2d");
        crc2.fillStyle = "white";
        crc2.fillRect(0, 0, crc2.canvas.width, crc2.canvas.height);
        crc2.translate(crc2.canvas.width / 2, crc2.canvas.height / 2);
        crc2.scale(1, -1);
        crc2.scale(100, 100);
        crc2.lineWidth = 1 / 100;
        let m0 = ƒ.Matrix3x3.IDENTITY();
        let m1 = new ƒ.Matrix3x3();
        printComparison("Start", m0, m1);
        draw(m0);
        m0.translateX(1);
        syncMatrix(m0, m1);
        printComparison("TranslateX", m0, m1);
        m0.translateY(1);
        syncMatrix(m0, m1);
        printComparison("TranslateY", m0, m1);
        m0.translate(new ƒ.Vector2(-1, -1));
        syncMatrix(m0, m1);
        printComparison("Translate", m0, m1);
        m0.rotate(45);
        syncMatrix(m0, m1);
        printComparison("Rotate", m0, m1);
        m0.translate(new ƒ.Vector2(-1, -1));
        syncMatrix(m0, m1);
        printComparison("Translate", m0, m1);
        m0.scaleX(2);
        syncMatrix(m0, m1);
        printComparison("ScaleX", m0, m1);
        m0.scaleY(2);
        syncMatrix(m0, m1);
        printComparison("ScaleY", m0, m1);
        m0.scale(ƒ.Vector2.ONE(0.5));
        syncMatrix(m0, m1);
        printComparison("Scale", m0, m1);
        m0.rotate(-45);
        syncMatrix(m0, m1);
        printComparison("Rotate", m0, m1);
        m0.translate(new ƒ.Vector2(1, 1));
        syncMatrix(m0, m1);
        printComparison("Translate", m0, m1);
        draw(m0);
        draw(m1);
    }
    function printComparison(_group, _m0, _m1) {
        let mtt0 = _m0.getMutatorForUserInterface();
        let mtt1 = _m1.getMutatorForUserInterface();
        console.group(_group);
        console.log("Translation", mtt0["translation"], mtt1["translation"]);
        console.log("Rotation", mtt0["rotation"], mtt1["rotation"]);
        console.log("Scaling", mtt0["scaling"], mtt1["scaling"]);
        console.groupEnd();
    }
    function syncMatrix(_m0, _m1) {
        let mtt0 = _m0.getMutatorForUserInterface();
        _m1.mutate(mtt0);
    }
    function draw(_m) {
        let vectors = [new ƒ.Vector2(-1, -1), new ƒ.Vector2(-1, 1), new ƒ.Vector2(0, 2), new ƒ.Vector2(1, 1), new ƒ.Vector2(1, -1), new ƒ.Vector2(-1, 1), new ƒ.Vector2(1, 1), new ƒ.Vector2(-1, -1), new ƒ.Vector2(1, -1)];
        crc2.beginPath();
        for (let vector of vectors) {
            let transformed = vector.copy;
            transformed.transform(_m);
            crc2.lineTo(transformed.x, transformed.y);
        }
        crc2.closePath();
        crc2.stroke();
    }
})(Marix3x3 || (Marix3x3 = {}));
//# sourceMappingURL=Matrix.js.map