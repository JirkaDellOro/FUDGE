///<reference path="Script/Script.ts"/>
var ResourceManager;
///<reference path="Script/Script.ts"/>
(function (ResourceManager) {
    ResourceManager.ƒ = FudgeCore;
    ResourceManager.ƒAid = FudgeAid;
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
        async deserialize(_serialization) {
            this.idResource = _serialization.idResource;
            if (_serialization.idReference)
                this.reference = await ResourceManager.ƒ.ResourceManager.get(_serialization.idReference);
            return this;
        }
    }
    ResourceManager.Resource = Resource;
    function init(_event) {
        for (let call of [TestCustomResource, CreateTestScene, LoadScene]) {
            let button = document.createElement("button");
            button.addEventListener("click", call);
            button.innerText = call.name;
            document.body.appendChild(button);
        }
        document.body.appendChild(document.createElement("hr"));
    }
    async function TestCustomResource() {
        let a = new Resource();
        let c = new Resource();
        let b = new Resource();
        ResourceManager.ƒ.ResourceManager.register(a);
        ResourceManager.ƒ.ResourceManager.register(c);
        ResourceManager.ƒ.ResourceManager.register(b);
        a.reference = b;
        c.reference = b;
        // b.reference = b; // cyclic references disallowed at this point in time
        let result = await testSerialization();
        console.group("Comparison");
        Compare.compare(ResourceManager.ƒ.ResourceManager.resources, result);
        console.groupEnd();
    }
    async function CreateTestScene() {
        // let texture: ƒ.TextureImage = new ƒ.TextureImage();
        // await texture.load("Image/Fudge_360.png");
        // let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
        // coatTextured.texture = texture;
        // coatTextured.color = ƒ.Color.CSS("red");
        // let mtrTexture: ƒ.Material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
        let pyramid = new ResourceManager.ƒ.MeshPyramid();
        ResourceManager.ƒ.ResourceManager.register(pyramid);
        let cube = new ResourceManager.ƒ.MeshCube();
        ResourceManager.ƒ.ResourceManager.register(cube);
        let mtrFlat = new ResourceManager.ƒ.Material("Flat", ResourceManager.ƒ.ShaderUniColor, new ResourceManager.ƒ.CoatColored(ResourceManager.ƒ.Color.CSS("lightblue")));
        let audio = new ResourceManager.ƒ.Audio("Audio/hypnotic.mp3");
        let cmpAudio = new ResourceManager.ƒ.ComponentAudio(audio, true, true);
        let source = new ResourceManager.ƒAid.Node("Source", ResourceManager.ƒ.Matrix4x4.IDENTITY(), mtrFlat, pyramid);
        // TODO: dynamically load Script! Is it among Resources?
        source.addComponent(new ResourceManager.Script());
        source.addComponent(cmpAudio);
        let child = new ResourceManager.ƒAid.Node("Cube", ResourceManager.ƒ.Matrix4x4.TRANSLATION(ResourceManager.ƒ.Vector3.Y()), mtrFlat, cube);
        child.getComponent(ResourceManager.ƒ.ComponentMesh).pivot.scale(ResourceManager.ƒ.Vector3.ONE(0.5));
        source.addChild(child);
        let graph = await ResourceManager.ƒ.ResourceManager.registerNodeAsResource(source, true);
        let instance = await ResourceManager.ƒ.ResourceManager.createGraphInstance(graph);
        console.log("Source", source);
        console.log("Graph", graph);
        console.log("Instance", instance);
        graph.name = "Graph";
        instance.name = "Instance";
        let id = graph.idResource;
        let old = ResourceManager.ƒ.ResourceManager.resources;
        let reconstruction = await testSerialization();
        // for (let id in old) {
        //   if (id.startsWith("Node"))
        //     old[id]["name"] = "Test";
        // }
        console.groupCollapsed("Comparison");
        // console.group("Comparison");
        ResourceManager.ƒ.Debug.setFilter(ResourceManager.ƒ.DebugConsole, ResourceManager.ƒ.DEBUG_FILTER.WARN | ResourceManager.ƒ.DEBUG_FILTER.ERROR);
        let comparison = await Compare.compare(old, reconstruction);
        ResourceManager.ƒ.Debug.setFilter(ResourceManager.ƒ.DebugConsole, ResourceManager.ƒ.DEBUG_FILTER.ALL);
        // console.log("Originael resources: ", old);
        // console.log("Reconstructed: ", reconstruction);
        console.groupEnd();
        if (comparison)
            console.error("Comparison failed");
        else
            console.log("Comparison succeeded");
        ResourceManager.ƒ.AudioManager.default.listenTo(instance);
        let reconstrucedGraph = reconstruction[id];
        reconstrucedGraph.name = "ReconstructedGraph";
        let reconstructedInstance = await ResourceManager.ƒ.ResourceManager.createGraphInstance(reconstrucedGraph);
        reconstructedInstance.name = "ReconstructedInstance";
        tweakGraphs(10, reconstructedInstance, [source, graph, instance, reconstrucedGraph, reconstructedInstance]);
        showGraphs([source, graph, instance, reconstrucedGraph, reconstructedInstance]);
    }
    async function LoadScene() {
        let response = await fetch("Test.json");
        let content = await response.text();
        console.groupCollapsed("Content");
        console.log(content);
        console.groupEnd();
        let serialization = ResourceManager.ƒ.Serializer.parse(content);
        console.groupCollapsed("Parsed");
        console.log(serialization);
        console.groupEnd();
        console.groupCollapsed("Reconstructed");
        let reconstruction = await ResourceManager.ƒ.ResourceManager.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();
        for (let id in reconstruction) {
            let resource = reconstruction[id];
            if (resource instanceof ResourceManager.ƒ.NodeResource) {
                resource.name = "ReconstructedGraph";
                let reconstructedInstance = await ResourceManager.ƒ.ResourceManager.createGraphInstance(resource);
                reconstructedInstance.name = "ReconstructedInstance";
                tweakGraphs(10, reconstructedInstance, [resource, reconstructedInstance]);
                showGraphs([resource, reconstructedInstance]);
                ResourceManager.ƒ.AudioManager.default.listenTo(reconstructedInstance);
            }
        }
        return reconstruction;
    }
    function tweakGraphs(_angleIncrement, _keepScript, _graphs) {
        let angle = 0;
        for (let node of _graphs) {
            node.getChild(0).getComponent(ResourceManager.ƒ.ComponentMesh).pivot.rotateX(angle);
            node.mtxLocal.rotateY(angle);
            angle += _angleIncrement;
            if (node != _keepScript)
                node.removeComponent(node.getComponent(ResourceManager.Script));
        }
    }
    function showGraphs(_graphs) {
        let cmpCamera = new ResourceManager.ƒ.ComponentCamera();
        cmpCamera.pivot.translate(new ResourceManager.ƒ.Vector3(1, 1, -2));
        cmpCamera.pivot.lookAt(ResourceManager.ƒ.Vector3.Y(0.4));
        for (let node of _graphs) {
            console.log(node.name, node);
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
    async function testSerialization() {
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
        let reconstruction = await ResourceManager.ƒ.ResourceManager.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();
        return reconstruction;
    }
})(ResourceManager || (ResourceManager = {}));
//# sourceMappingURL=ResourceManager.js.map