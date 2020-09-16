///<reference path="Script/Script.ts"/>
namespace ResourceManager {
  export import ƒ = FudgeCore;

  // register namespace of custom resources
  ƒ.Serializer.registerNamespace(ResourceManager);

  // window.addEventListener("DOMContentLoaded", init);
  document.addEventListener("click", init);

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
    CreateTestScene();
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

    let resource: ƒ.NodeResource = ƒ.ResourceManager.registerNodeAsResource(original, true);
    let instance: ƒ.NodeResourceInstance = new ƒ.NodeResourceInstance(resource);

    resource.name = "Resource";
    instance.name = "Instance";

    let result: ƒ.Resources = testSerialization();
    console.groupCollapsed("Comparison");
    let comparison: boolean = Compare.compare(ƒ.ResourceManager.resources, result);
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

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translate(new ƒ.Vector3(1, 1, -2));
    cmpCamera.pivot.lookAt(ƒ.Vector3.Y(0.4));

    for (let graph of [original, resource, instance]) {
      let viewport: ƒ.Viewport = new ƒ.Viewport();
      let canvas: HTMLCanvasElement = document.createElement("canvas");
      let figure: HTMLElement = document.createElement("figure");
      let caption: HTMLElement = document.createElement("figcaption");
      caption.textContent = graph.name;
      figure.appendChild(canvas);
      figure.appendChild(caption);
      document.body.appendChild(figure);
      viewport.initialize(graph.name, graph, cmpCamera, canvas);
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