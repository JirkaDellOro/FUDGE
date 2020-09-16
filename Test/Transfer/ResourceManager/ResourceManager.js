///<reference path="Script/Script.ts"/>
var ResourceManager;
///<reference path="Script/Script.ts"/>
(function (ResourceManager) {
    ResourceManager.ƒ = FudgeCore;
    // register namespace of custom resources
    ResourceManager.ƒ.Serializer.registerNamespace(ResourceManager);
    window.addEventListener("DOMContentLoaded", init);
    // document.addEventListener("click", init);
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
        TestCustomResource();
        CreateTestScene();
        LoadScene();
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
        let texture = new ResourceManager.ƒ.TextureImage();
        await texture.load("Image/Fudge_360.png");
        let coatTextured = new ResourceManager.ƒ.CoatTextured();
        coatTextured.texture = texture;
        coatTextured.color = ResourceManager.ƒ.Color.CSS("red");
        let material = new ResourceManager.ƒ.Material("Textured", ResourceManager.ƒ.ShaderTexture, coatTextured);
        let mesh = new ResourceManager.ƒ.MeshPyramid();
        // ƒ.ResourceManager.register(mesh);
        let audio = new ResourceManager.ƒ.Audio("Audio/hypnotic.mp3");
        let cmpAudio = new ResourceManager.ƒ.ComponentAudio(audio, true, true);
        let original = new ResourceManager.ƒ.Node("Original");
        original.addComponent(new ResourceManager.ƒ.ComponentMesh(mesh));
        original.addComponent(new ResourceManager.ƒ.ComponentMaterial(material));
        // TODO: dynamically load Script! Is it among Resources?
        original.addComponent(new ResourceManager.Script());
        original.addComponent(cmpAudio);
        let graph = ResourceManager.ƒ.ResourceManager.registerNodeAsResource(original, true);
        let instance = new ResourceManager.ƒ.NodeResourceInstance(graph);
        graph.name = "Resource";
        instance.name = "Instance";
        let id = graph.idResource;
        let reconstruction = testSerialization();
        console.groupCollapsed("Comparison");
        let comparison = Compare.compare(ResourceManager.ƒ.ResourceManager.resources, reconstruction);
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
        console.groupCollapsed("Serialized instance");
        console.log(ResourceManager.ƒ.Serializer.stringify(instance.serialize()));
        console.groupEnd();
        let reconstrucedGraph = reconstruction[id];
        reconstrucedGraph.name = "ReconstructedGraph";
        let cmpCamera = new ResourceManager.ƒ.ComponentCamera();
        cmpCamera.pivot.translate(new ResourceManager.ƒ.Vector3(1, 1, -2));
        cmpCamera.pivot.lookAt(ResourceManager.ƒ.Vector3.Y(0.4));
        for (let node of [original, graph, instance, reconstrucedGraph]) {
            let viewport = new ResourceManager.ƒ.Viewport();
            let canvas = document.createElement("canvas");
            let figure = document.createElement("figure");
            let caption = document.createElement("figcaption");
            caption.textContent = node.name;
            figure.appendChild(canvas);
            figure.appendChild(caption);
            document.body.appendChild(figure);
            viewport.initialize(node.name, node, cmpCamera, canvas);
            viewport.draw();
        }
    }
    function LoadScene() {
    }
    function testSerialization() {
        console.groupCollapsed("Original");
        console.log(ResourceManager.ƒ.ResourceManager.resources);
        console.groupEnd();
        console.groupCollapsed("Serialized");
        let serialization = ResourceManager.ƒ.ResourceManager.serialize();
        console.log(serialization);
        console.groupEnd();
        console.log(ResourceManager.ƒ.ResourceManager.resources);
        console.log(ResourceManager.ƒ.ResourceManager.serialization);
        ResourceManager.ƒ.ResourceManager.clear();
        console.log(ResourceManager.ƒ.ResourceManager.resources);
        console.log(ResourceManager.ƒ.ResourceManager.serialization);
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