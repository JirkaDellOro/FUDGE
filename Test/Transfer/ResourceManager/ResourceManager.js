///<reference path="Script.ts"/>
var ResourceManager;
///<reference path="Script.ts"/>
(function (ResourceManager) {
    ResourceManager.ƒ = FudgeCore;
    // register namespace of custom resources
    ResourceManager.ƒ.Serializer.registerNamespace(ResourceManager);
    // window.addEventListener("DOMContentLoaded", init);
    document.addEventListener("click", init);
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
                this.reference = ResourceManager.ƒ.ResourceManager.get(_serialization.idReference);
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
        ResourceManager.ƒ.ResourceManager.register(a);
        ResourceManager.ƒ.ResourceManager.register(c);
        ResourceManager.ƒ.ResourceManager.register(b);
        a.reference = b;
        c.reference = b;
        // b.reference = b; // cyclic references disallowed at this point in time
        let result = testSerialization();
        console.group("Comparison");
        Compare.compare(ResourceManager.ƒ.ResourceManager.resources, result);
        console.groupEnd();
    }
    async function CreateTestScene() {
        let material = new ResourceManager.ƒ.Material("TestMaterial", ResourceManager.ƒ.ShaderFlat, new ResourceManager.ƒ.CoatColored(new ResourceManager.ƒ.Color(1, 1, 1, 1)));
        ResourceManager.ƒ.ResourceManager.register(material);
        let mesh = new ResourceManager.ƒ.MeshPyramid();
        ResourceManager.ƒ.ResourceManager.register(mesh);
        let node = new ResourceManager.ƒ.Node("TestNode");
        node.addComponent(new ResourceManager.ƒ.ComponentMesh(mesh));
        node.addComponent(new ResourceManager.ƒ.ComponentMaterial(material));
        node.addComponent(new ResourceManager.Script());
        let audio = new ResourceManager.ƒ.Audio("Audio/hypnotic.mp3");
        let cmpAudio = new ResourceManager.ƒ.ComponentAudio(audio, true, true);
        node.addComponent(cmpAudio);
        let nodeResource = ResourceManager.ƒ.ResourceManager.registerNodeAsResource(node, true);
        // ƒ.Debug.log(node);
        // ƒ.Debug.log(nodeResource);
        let instance = new ResourceManager.ƒ.NodeResourceInstance(nodeResource);
        // ƒ.Debug.log(instance);
        let result = testSerialization();
        console.groupCollapsed("Comparison");
        let comparison = Compare.compare(ResourceManager.ƒ.ResourceManager.resources, result);
        console.groupEnd();
        if (!comparison)
            console.error("Comparison failed");
        // let s: Script;
        // s = node.getComponent(Script);
        // node.removeComponent(s);
        // s = nodeResource.getComponent(Script);
        // nodeResource.removeComponent(s);
        // node.getComponent(ƒ.ComponentAudio).activate(false);
        ResourceManager.ƒ.AudioManager.default.listenTo(instance);
        // console.log(instance);
        console.log(ResourceManager.ƒ.Serializer.stringify(instance.serialize()));
    }
    function testSerialization() {
        console.groupCollapsed("Original");
        console.log(ResourceManager.ƒ.ResourceManager.resources);
        console.groupEnd();
        console.groupCollapsed("Serialized");
        let serialization = ResourceManager.ƒ.ResourceManager.serialize();
        console.log(serialization);
        console.groupEnd();
        console.group("Stringified");
        let json = ResourceManager.ƒ.Serializer.stringify(serialization);
        console.log(json);
        console.groupEnd();
        console.groupCollapsed("Parsed");
        serialization = ResourceManager.ƒ.Serializer.parse(json);
        console.log(serialization);
        console.groupEnd();
        console.groupCollapsed("Reconstructed");
        let reconstruction = ResourceManager.ƒ.ResourceManager.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();
        return reconstruction;
    }
})(ResourceManager || (ResourceManager = {}));
//# sourceMappingURL=ResourceManager.js.map