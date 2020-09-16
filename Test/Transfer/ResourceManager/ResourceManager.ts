///<reference path="Script/Script.ts"/>
namespace ResourceManager {
  export import ƒ = FudgeCore;

  // register namespace of custom resources
  ƒ.Serializer.registerNamespace(ResourceManager);

  window.addEventListener("DOMContentLoaded", init);
  // document.addEventListener("click", init);

  // Test custom resource
  export class Resource implements ƒ.SerializableResource {
    public idResource: string = null;
    public reference: Resource = null;

    public serialize(): ƒ.Serialization {
      return {
        idResource: this.idResource,
        idReference: (this.reference) ? this.reference.idResource : null
      };
    }
    public deserialize(_serialization: ƒ.Serialization): Resource {
      this.idResource = _serialization.idResource;
      if (_serialization.idReference)
        this.reference = <Resource>ƒ.ResourceManager.get(_serialization.idReference);
      return this;
    }
  }

  function init(_event: Event): void {
    for (let call of [TestCustomResource, CreateTestScene, LoadScene]) {
      let button: HTMLButtonElement = document.createElement("button");
      button.addEventListener("click", call);
      button.innerText = call.name;
      document.body.appendChild(button);
    }
    document.body.appendChild(document.createElement("hr"));
  }

  function TestCustomResource(): void {
    let a: Resource = new Resource();
    let c: Resource = new Resource();
    let b: Resource = new Resource();

    ƒ.ResourceManager.register(a);
    ƒ.ResourceManager.register(c);
    ƒ.ResourceManager.register(b);
    a.reference = b;
    c.reference = b;
    // b.reference = b; // cyclic references disallowed at this point in time

    let result: ƒ.Resources = testSerialization();
    console.group("Comparison");
    Compare.compare(ƒ.ResourceManager.resources, result);
    console.groupEnd();
  }


  async function CreateTestScene(): Promise<void> {
    let texture: ƒ.TextureImage = new ƒ.TextureImage();
    await texture.load("Image/Fudge_360.png");

    let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
    coatTextured.texture = texture;
    coatTextured.color = ƒ.Color.CSS("red");
    let material: ƒ.Material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);

    let mesh: ƒ.Mesh = new ƒ.MeshPyramid();
    // ƒ.ResourceManager.register(mesh);

    let audio: ƒ.Audio = new ƒ.Audio("Audio/hypnotic.mp3");
    let cmpAudio: ƒ.ComponentAudio = new ƒ.ComponentAudio(audio, true, true);


    let original: ƒ.Node = new ƒ.Node("Original");
    original.addComponent(new ƒ.ComponentMesh(mesh));
    original.addComponent(new ƒ.ComponentMaterial(material));
    // TODO: dynamically load Script! Is it among Resources?
    original.addComponent(new Script());
    original.addComponent(cmpAudio);

    let graph: ƒ.NodeResource = ƒ.ResourceManager.registerNodeAsResource(original, true);
    let instance: ƒ.NodeResourceInstance = new ƒ.NodeResourceInstance(graph);

    graph.name = "Resource";
    instance.name = "Instance";
    let id: string = graph.idResource;

    let reconstruction: ƒ.Resources = testSerialization();
    console.groupCollapsed("Comparison");
    let comparison: boolean = Compare.compare(ƒ.ResourceManager.resources, reconstruction);
    console.groupEnd();
    if (!comparison)
      console.error("Comparison failed");

    // let s: Script;
    // s = node.getComponent(Script);
    // node.removeComponent(s);
    // s = nodeResource.getComponent(Script);
    // nodeResource.removeComponent(s);
    // node.getComponent(ƒ.ComponentAudio).activate(false);

    ƒ.AudioManager.default.listenTo(instance);
    console.groupCollapsed("Serialized instance");
    console.log(ƒ.Serializer.stringify(instance.serialize()));
    console.groupEnd();


    let reconstrucedGraph: ƒ.NodeResource = <ƒ.NodeResource>reconstruction[id];
    reconstrucedGraph.name = "ReconstructedGraph";
    let reconstructedInstance: ƒ.NodeResourceInstance = new ƒ.NodeResourceInstance(reconstrucedGraph);
    reconstructedInstance.name = "ReconstructedInstance";

    original.getComponent(ƒ.ComponentMesh).pivot.rotateX(10);
    graph.getComponent(ƒ.ComponentMesh).pivot.rotateX(20);
    instance.getComponent(ƒ.ComponentMesh).pivot.rotateX(30);
    reconstrucedGraph.getComponent(ƒ.ComponentMesh).pivot.rotateX(40);
    reconstructedInstance.getComponent(ƒ.ComponentMesh).pivot.rotateX(50);

    showGraphs([original, graph, instance, reconstrucedGraph, reconstructedInstance]);
  }


  async function LoadScene(): Promise<ƒ.Resources> {
    let response: Response = await fetch("Test.json");
    let content: string = await response.text();

    console.groupCollapsed("Content");
    console.log(content);
    console.groupEnd();

    let serialization: ƒ.Serialization = ƒ.Serializer.parse(content);

    console.groupCollapsed("Parsed");
    console.log(serialization);
    console.groupEnd();

    console.groupCollapsed("Reconstructed");
    let reconstruction: ƒ.Resources = ƒ.ResourceManager.deserialize(serialization);
    console.log(reconstruction);
    console.groupEnd();

    for (let id in reconstruction) {
      let resource: ƒ.SerializableResource = reconstruction[id];
      if (resource instanceof ƒ.NodeResource) {
        let reconstrucedGraph: ƒ.NodeResource = resource;
        reconstrucedGraph.name = "ReconstructedGraph";
        let reconstructedInstance: ƒ.NodeResourceInstance = new ƒ.NodeResourceInstance(reconstrucedGraph);
        reconstructedInstance.name = "ReconstructedInstance";

        showGraphs([reconstrucedGraph, reconstructedInstance]);
      }
    }
    return reconstruction;
  }

  function showGraphs(_graphs: ƒ.Node[]): void {
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translate(new ƒ.Vector3(1, 1, -2));
    cmpCamera.pivot.lookAt(ƒ.Vector3.Y(0.4));

    for (let node of _graphs) {
      let viewport: ƒ.Viewport = new ƒ.Viewport();
      let canvas: HTMLCanvasElement = document.createElement("canvas");
      let figure: HTMLElement = document.createElement("figure");
      let caption: HTMLElement = document.createElement("figcaption");
      caption.textContent = node.name;
      figure.appendChild(canvas);
      figure.appendChild(caption);
      document.body.appendChild(figure);
      viewport.initialize(node.name, node, cmpCamera, canvas);
      viewport.draw();
    }
  }

  function testSerialization(): ƒ.Resources {
    console.groupCollapsed("Original");
    console.log(ƒ.ResourceManager.resources);
    console.groupEnd();

    console.groupCollapsed("Serialized");
    let serialization: ƒ.SerializationOfResources = ƒ.ResourceManager.serialize();
    console.log(serialization);
    console.groupEnd();

    console.log(ƒ.ResourceManager.resources);
    console.log(ƒ.ResourceManager.serialization);
    ƒ.ResourceManager.clear();
    console.log(ƒ.ResourceManager.resources);
    console.log(ƒ.ResourceManager.serialization);

    console.group("Stringified");
    let json: string = ƒ.Serializer.stringify(serialization);
    console.log(json);
    console.groupEnd();

    console.groupCollapsed("Parsed");
    serialization = ƒ.Serializer.parse(json);
    console.log(serialization);
    console.groupEnd();

    console.groupCollapsed("Reconstructed");
    let reconstruction: ƒ.Resources = ƒ.ResourceManager.deserialize(serialization);
    console.log(reconstruction);
    console.groupEnd();

    return reconstruction;
  }
}