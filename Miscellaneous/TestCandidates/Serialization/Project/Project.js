///<reference path="./Code/Build/Compiled.d.ts"/>
var Project;
///<reference path="./Code/Build/Compiled.d.ts"/>
(function (Project) {
    Project.ƒ = FudgeCore;
    Project.ƒAid = FudgeAid;
    // register namespace of custom resources
    Project.ƒ.Serializer.registerNamespace(Project);
    Project.ƒ.Project.baseURL = new URL(location.href);
    console.log(Project.ƒ.Project.baseURL);
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
                this.reference = await Project.ƒ.Project.getResource(_serialization.idReference);
            return this;
        }
    }
    Project.Resource = Resource;
    function init(_event) {
        for (let call of [TestCustomResource, CreateTestScene, LoadScene, TestColor]) {
            let button = document.createElement("button");
            button.addEventListener("click", call);
            button.innerText = call.name;
            document.body.appendChild(button);
        }
        document.body.appendChild(document.createElement("hr"));
    }
    async function TestColor() {
        let color = new Project.ƒ.Color(0.1, 0.2, 0.3, 0.4);
        console.log("Source", color);
        console.log("Mutator", color.getMutator());
        let serialization = color.serialize();
        console.log("Serialization", serialization);
        let json = Project.ƒ.Serializer.stringify(serialization);
        // let json: string = JSON.stringify(serialization);
        console.log("Stringified", json);
        serialization = JSON.parse(json);
        // serialization = JSON.parse(serialization.toString());
        console.log("Parsed", serialization);
        let reconstruct = new Project.ƒ.Color();
        console.log("Empty Reconstruction", reconstruct);
        reconstruct.deserialize(serialization);
        console.log("Reconstruction", reconstruct);
    }
    async function TestCustomResource() {
        let a = new Resource();
        let c = new Resource();
        let b = new Resource();
        Project.ƒ.Project.register(a);
        Project.ƒ.Project.register(c);
        Project.ƒ.Project.register(b);
        a.reference = b;
        c.reference = b;
        // b.reference = b; // cyclic references disallowed at this point in time
        let result = await testSerialization();
        console.group("Comparison");
        Compare.compare(Project.ƒ.Project.resources, result);
        console.groupEnd();
    }
    async function CreateTestScene() {
        let texture = new Project.ƒ.TextureImage();
        await texture.load("Image/Fudge_360.png");
        let coatTextured = new Project.ƒ.CoatTextured();
        coatTextured.texture = texture;
        coatTextured.color = Project.ƒ.Color.CSS("red");
        let mtrTexture = new Project.ƒ.Material("Textured", Project.ƒ.ShaderTexture, coatTextured);
        let pyramid = new Project.ƒ.MeshPyramid();
        // ƒ.Project.register(pyramid);
        let sphere = new Project.ƒ.MeshSphere("Sphere", 8, 5);
        // ƒ.Project.register(sphere);
        let mtrFlat = new Project.ƒ.Material("Flat", Project.ƒ.ShaderFlat, new Project.ƒ.CoatColored(Project.ƒ.Color.CSS("white")));
        let audio = new Project.ƒ.Audio("Audio/hypnotic.mp3");
        let cmpAudio = new Project.ƒ.ComponentAudio(audio, true, true);
        let lightAmbient = new Project.ƒ.ComponentLight(new Project.ƒ.LightAmbient(Project.ƒ.Color.CSS("grey")));
        let lightDirectional = new Project.ƒ.ComponentLight(new Project.ƒ.LightDirectional(Project.ƒ.Color.CSS("yellow")));
        lightDirectional.pivot.lookAt(new Project.ƒ.Vector3(1, -1, 1), Project.ƒ.Vector3.X());
        let source = new Project.ƒAid.Node("Source", Project.ƒ.Matrix4x4.IDENTITY(), mtrTexture, pyramid);
        // TODO: dynamically load Script! Is it among Resources?
        source.addComponent(new Script.TimerMessage());
        source.addComponent(cmpAudio);
        source.addComponent(lightAmbient);
        source.addComponent(lightDirectional);
        source.getComponent(Project.ƒ.ComponentMaterial).pivot.translate(Project.ƒ.Vector2.ONE(0.5));
        source.getComponent(Project.ƒ.ComponentMaterial).pivot.rotate(45);
        source.getComponent(Project.ƒ.ComponentMaterial).pivot.scale(new Project.ƒ.Vector2(12, 5));
        let child = new Project.ƒAid.Node("Ball", Project.ƒ.Matrix4x4.TRANSLATION(Project.ƒ.Vector3.Y()), mtrFlat, sphere);
        child.getComponent(Project.ƒ.ComponentMesh).pivot.scale(Project.ƒ.Vector3.ONE(0.5));
        source.addChild(child);
        let graph = await Project.ƒ.Project.registerAsGraph(source, true);
        let instance = await Project.ƒ.Project.createGraphInstance(graph);
        console.log("Source", source);
        console.log("Graph", graph);
        console.log("Instance", instance);
        graph.name = "Graph";
        instance.name = "Instance";
        let id = graph.idResource;
        let old = Project.ƒ.Project.resources;
        let reconstruction = await testSerialization();
        // for (let id in old) {
        //   if (id.startsWith("Node"))
        //     old[id]["name"] = "Test";
        // }
        console.groupCollapsed("Comparison");
        // console.group("Comparison");
        Project.ƒ.Debug.setFilter(Project.ƒ.DebugConsole, Project.ƒ.DEBUG_FILTER.WARN | Project.ƒ.DEBUG_FILTER.ERROR);
        let comparison = await Compare.compare(old, reconstruction);
        Project.ƒ.Debug.setFilter(Project.ƒ.DebugConsole, Project.ƒ.DEBUG_FILTER.ALL);
        // console.log("Originael resources: ", old);
        // console.log("Reconstructed: ", reconstruction);
        console.groupEnd();
        if (comparison)
            console.error("Comparison failed");
        else
            console.log("Comparison succeeded");
        Project.ƒ.AudioManager.default.listenTo(instance);
        let reconstrucedGraph = reconstruction[id];
        reconstrucedGraph.name = "ReconstructedGraph";
        let reconstructedInstance = await Project.ƒ.Project.createGraphInstance(reconstrucedGraph);
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
        let serialization = Project.ƒ.Serializer.parse(content);
        console.groupCollapsed("Parsed");
        console.log(serialization);
        console.groupEnd();
        console.groupCollapsed("Reconstructed");
        let reconstruction = await Project.ƒ.Project.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();
        for (let id in reconstruction) {
            let resource = reconstruction[id];
            if (resource instanceof Project.ƒ.Graph) {
                resource.name = "ReconstructedGraph";
                let reconstructedInstance = await Project.ƒ.Project.createGraphInstance(resource);
                reconstructedInstance.name = "ReconstructedInstance";
                tweakGraphs(10, reconstructedInstance, [resource, reconstructedInstance]);
                showGraphs([resource, reconstructedInstance]);
                Project.ƒ.AudioManager.default.listenTo(reconstructedInstance);
            }
        }
        return reconstruction;
    }
    function tweakGraphs(_angleIncrement, _keepScript, _graphs) {
        let angle = 0;
        for (let node of _graphs) {
            node.getChild(0).getComponent(Project.ƒ.ComponentMesh).pivot.rotateX(angle);
            node.mtxLocal.rotateY(angle);
            angle += _angleIncrement;
            if (node != _keepScript)
                node.removeComponent(node.getComponent(Script.TimerMessage));
        }
    }
    function showGraphs(_graphs) {
        let cmpCamera = new Project.ƒ.ComponentCamera();
        cmpCamera.pivot.translate(new Project.ƒ.Vector3(0, 1, -2));
        cmpCamera.pivot.lookAt(Project.ƒ.Vector3.Y(0.4));
        for (let node of _graphs) {
            console.log(node.name, node);
            let viewport = new Project.ƒ.Viewport();
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
        console.log(Project.ƒ.Project.resources);
        console.groupEnd();
        console.groupCollapsed("Serialized");
        let serialization = Project.ƒ.Project.serialize();
        console.log(serialization);
        console.groupEnd();
        console.log(Project.ƒ.Project.resources);
        console.log(Project.ƒ.Project.serialization);
        Project.ƒ.Project.clear();
        console.log(Project.ƒ.Project.resources);
        console.log(Project.ƒ.Project.serialization);
        console.group("Stringified");
        let json = Project.ƒ.Serializer.stringify(serialization);
        console.log(json);
        console.groupEnd();
        console.groupCollapsed("Parsed");
        serialization = Project.ƒ.Serializer.parse(json);
        console.log(serialization);
        console.groupEnd();
        console.groupCollapsed("Reconstructed");
        let reconstruction = await Project.ƒ.Project.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();
        return reconstruction;
    }
})(Project || (Project = {}));
//# sourceMappingURL=Project.js.map