var ResourceManager;
(function (ResourceManager) {
    var ƒ = FudgeCore;
    // register namespace of custom resources
    ƒ.Serializer.registerNamespace(ResourceManager);
    window.addEventListener("DOMContentLoaded", init);
    // Test custom resource
    class Resource {
        constructor() {
            this.idResource = null;
            this.reference = null;
        }
        serialize() {
            return {
                idResource: this.idResource,
                idReference: (this.reference) ? this.reference.idResource : null
            };
        }
        deserialize(_serialization) {
            this.idResource = _serialization.idResource;
            if (_serialization.idReference)
                this.reference = ƒ.ResourceManager.get(_serialization.idReference);
            return this;
        }
    }
    ResourceManager.Resource = Resource;
    function init(_event) {
        CreateTestScene();
    }
    function TestCustomResource() {
        let a = new Resource();
        let c = new Resource();
        let b = new Resource();
        ƒ.ResourceManager.register(a);
        ƒ.ResourceManager.register(c);
        ƒ.ResourceManager.register(b);
        a.reference = b;
        c.reference = b;
        // b.reference = b; // cyclic references disallowed at this point in time
        let result = testSerialization();
        console.group("Comparison");
        Compare.compare(ƒ.ResourceManager.resources, result);
        console.groupEnd();
    }
    function CreateTestScene() {
        let material = new ƒ.Material("TestMaterial", ƒ.ShaderFlat, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1)));
        ƒ.ResourceManager.register(material);
        let mesh = new ƒ.MeshPyramid();
        ƒ.ResourceManager.register(mesh);
        let node = new ƒ.Node("TestNode");
        node.addComponent(new ƒ.ComponentMesh(mesh));
        node.addComponent(new ƒ.ComponentMaterial(material));
        node.addComponent(new ResourceManager.Script());
        let nodeResource = ƒ.ResourceManager.registerNodeAsResource(node, true);
        ƒ.Debug.log(node);
        ƒ.Debug.log(nodeResource);
        // let instance: ƒ.NodeResourceInstance = new ƒ.NodeResourceInstance(nodeResource);
        // ƒ.Debug.log(instance);
        let result = testSerialization();
        console.group("Comparison");
        Compare.compare(ƒ.ResourceManager.resources, result);
        console.groupEnd();
        let s;
        s = node.getComponent(ResourceManager.Script);
        node.removeComponent(s);
        s = nodeResource.getComponent(ResourceManager.Script);
        nodeResource.removeComponent(s);
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
        let json = ƒ.Serializer.stringify(serialization);
        console.log(json);
        console.groupEnd();
        console.group("Parsed");
        serialization = ƒ.Serializer.parse(json);
        console.log(serialization);
        console.groupEnd();
        console.group("Reconstructed");
        let reconstruction = ƒ.ResourceManager.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();
        return reconstruction;
    }
})(ResourceManager || (ResourceManager = {}));
//# sourceMappingURL=ResourceManager.js.map