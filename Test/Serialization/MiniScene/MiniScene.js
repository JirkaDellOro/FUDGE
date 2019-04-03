var MiniScene;
(function (MiniScene) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    let node;
    let camera;
    let viewPort;
    function init() {
        createScene();
        let result = testSerialization(node);
        // (<ƒ.Node>result).name = "nlksanfdv";
        console.groupCollapsed("Comparison");
        compare(node, result);
        console.groupEnd();
    }
    function compare(_object1, _object2, _level = 0, _checked = []) {
        if (_checked.indexOf(_object1) >= 0 || _checked.indexOf(_object2) >= 0)
            return true;
        _checked.push(_object1);
        _checked.push(_object2);
        for (var prefix = "", i = 0; i <= _level; prefix += "-", i++)
            ;
        for (let prop in _object1) {
            if (prop == "ComponentMaterial")
                return true;
            if (Number(prop).toString() != prop)
                console.log(`${prefix} Comparing ${prop}`);
            //Check property exists on both objects
            if (_object1.hasOwnProperty(prop) !== _object2.hasOwnProperty(prop)) {
                console.error(`Property mismatch ${prop} | ${_object1} : ${_object2}`);
                return false;
            }
            if ((typeof _object1[prop]) != (typeof _object2[prop])) {
                console.error(`Type mismatch ${_object1} : ${_object2}`);
                return false;
            }
            switch (typeof (_object1[prop])) {
                //Deep compare objects
                case "object":
                    if (!compare(_object1[prop], _object2[prop], _level + 1, _checked)) {
                        console.log(`Found in ${prop}`);
                        return false;
                    }
                    break;
                //Compare values
                default:
                    if (_object1[prop] != _object2[prop]) {
                        console.error(`Value mismatch ${prop}`);
                        return false;
                    }
            }
        }
        //Check object 2 for any extra properties
        for (let prop in _object2) {
            if (typeof (_object1[prop]) == "undefined") {
                console.error(`Property mismatch ${prop} | ${_object1} : ${_object2}`);
                return false;
            }
        }
        return true;
    }
    function createScene() {
        ƒ.GLUtil.initializeContext();
        let shdBasic = new ƒ.ShaderBasic();
        let mtrRed = new ƒ.Material("Red", new ƒ.Vector3(255, 0, 0), shdBasic);
        let cmpMesh = new ƒ.ComponentMesh();
        cmpMesh.setMesh(new ƒ.MeshCube(50, 50, 50));
        let cmpMaterial = new ƒ.ComponentMaterial();
        cmpMaterial.initialize(mtrRed);
        let cmpTransform = new ƒ.ComponentTransform();
        node = new ƒ.Node("Node");
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        node.addComponent(cmpTransform);
        cmpTransform.scaleX(2);
        camera = new ƒ.Node("Camera");
        cmpTransform = new ƒ.ComponentTransform();
        cmpTransform.translate(100, 100, 500);
        cmpTransform.lookAt(node.cmpTransform.position);
        camera.addComponent(cmpTransform);
        let cmpCamera = new ƒ.ComponentCamera();
        camera.addComponent(cmpCamera);
        viewPort = new ƒ.Viewport("MiniScene", node, cmpCamera);
        viewPort.drawScene();
        viewPort.showSceneGraph();
        let child = new ƒ.Node("Child");
        node.appendChild(child);
    }
    function testSerialization(_object) {
        console.group("Original");
        console.log(_object);
        console.groupEnd();
        console.group("Serialized");
        let serialization = ƒ.Serializer.serialize(_object);
        console.log(serialization);
        console.groupEnd();
        console.groupCollapsed("Stringified");
        let json = JSON.stringify(serialization, null, 2);
        console.log(json);
        console.groupEnd();
        console.group("Parsed");
        serialization = JSON.parse(json);
        console.log(serialization);
        console.groupEnd();
        console.group("Reconstructed");
        let reconstruction = ƒ.Serializer.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();
        return reconstruction;
    }
})(MiniScene || (MiniScene = {}));
//# sourceMappingURL=MiniScene.js.map