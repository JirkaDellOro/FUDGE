namespace MiniScene {
    import ƒ = Fudge;

    window.addEventListener("DOMContentLoaded", init);

    let node: ƒ.Node;
    let camera: ƒ.Node;
    let viewPort: ƒ.Viewport;

    function init(): void {
        createScene();
        let result: ƒ.Serializable = testSerialization(camera);
        // (<ƒ.Node>result).name = "nlksanfdv";
        compare(camera, result);
    }

    function compare(_object1: ƒ.Serializable, _object2: ƒ.Serializable, _level: number = 0, _checked: ƒ.Serializable[] = []): boolean {
        if (_checked.indexOf(_object1) >= 0 || _checked.indexOf(_object2) >= 0)
            return true;
        _checked.push(_object1);
        _checked.push(_object2);

        for (var prefix: string = "", i: number = 0; i <= _level; prefix += "-", i++);

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

    function createScene(): void {

        ƒ.GLUtil.initializeContext();
        let shdBasic: ƒ.ShaderBasic = new ƒ.ShaderBasic();
        let mtrRed: ƒ.Material = new ƒ.Material("Red", new ƒ.Vector3(255, 0, 0), shdBasic);

        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh();
        cmpMesh.setMesh(new ƒ.MeshCube(50, 50, 50));
        let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial();
        cmpMaterial.initialize(mtrRed);
        let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
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
        let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
        camera.addComponent(cmpCamera);

        viewPort = new ƒ.Viewport("MiniScene", node, cmpCamera);
        viewPort.drawScene();
        viewPort.showSceneGraph();

        let child: ƒ.Node = new ƒ.Node("Child");
        node.appendChild(child);
    }

    function testSerialization(_object: ƒ.Serializable): ƒ.Serializable {
        console.group("Original");
        console.log(_object);
        console.groupEnd();

        console.group("Serialized");
        let serialization: ƒ.Serialization = ƒ.Serializer.serialize(_object);
        console.log(serialization);
        console.groupEnd();

        console.group("Stringified");
        let json: string = JSON.stringify(serialization);
        console.log(json);
        console.groupEnd();

        console.group("Parsed");
        serialization = JSON.parse(json);
        console.log(serialization);
        console.groupEnd();

        console.group("Reconstructed");
        let reconstruction: ƒ.Serializable = ƒ.Serializer.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();

        return reconstruction;
    }
}