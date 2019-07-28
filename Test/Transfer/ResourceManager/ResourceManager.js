var TestSerializer;
(function (TestSerializer) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    class Resource {
        constructor() {
            this.idResource = null;
            this.reference = null;
        }
        serialize() {
            return {
                [this.constructor.name]: {
                    idResource: this.idResource,
                    idReference: (this.reference) ? this.reference.idResource : null
                }
            };
        }
        deserialize(_serialization) {
            this.idResource = _serialization.idResource;
            if (_serialization.idReference)
                this.reference = ƒ.ResourceManager.get(_serialization.idReference);
            return this;
        }
    }
    function init() {
        Fudge["Resource"] = Resource;
        // let material: ƒ.Material = new ƒ.Material("Material_1", ƒ.ShaderFlat, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1)));
        // ƒ.ResourceManager.register(material);
        let mesh = new ƒ.MeshPyramid();
        ƒ.ResourceManager.register(mesh);
        let a = new Resource();
        let b = new Resource();
        ƒ.ResourceManager.register(a);
        ƒ.ResourceManager.register(b);
        a.reference = b;
        // b.reference = b; // cyclic references disallowed at this point in time
        // let node: ƒ.Node = new ƒ.Node("Node_1");
        // let nodeResource: ƒ.NodeResource = ƒ.ResourceManager.registerNodeAsResource(node);
        // ƒ.Debug.log(node);
        // ƒ.Debug.log(nodeResource);
        // let instance: ƒ.NodeResourceInstance = ƒ.ResourceManager.instantiateNodeResource(nodeResource);
        // ƒ.Debug.log(instance);
        let result = testSerialization();
        console.group("Comparison");
        // Compare.compare(node, instance);
        Compare.compare(ƒ.ResourceManager.resources, result);
        console.groupEnd();
    }
    function testSerialization() {
        console.group("Original");
        console.log(ƒ.ResourceManager.resources);
        console.groupEnd();
        console.group("Serialized");
        let serialization = ƒ.ResourceManager.serialize();
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
        let reconstruction = ƒ.ResourceManager.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();
        return reconstruction;
    }
})(TestSerializer || (TestSerializer = {}));
//# sourceMappingURL=ResourceManager.js.map