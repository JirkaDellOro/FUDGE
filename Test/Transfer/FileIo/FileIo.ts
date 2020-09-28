namespace FileIo {
  import ƒ = FudgeCore;
  ƒ.Serializer.registerNamespace(FileIo);
  window.addEventListener("DOMContentLoaded", init);

  function init(): void {
    document.querySelector("button").addEventListener("click", handleStart);
  }
  async function handleStart(): Promise<void> {
    let material: ƒ.Material = new ƒ.Material("Material_1", ƒ.ShaderFlat, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1)));
    // ƒ.Project.register(material);

    let mesh: ƒ.Mesh = new ƒ.MeshPyramid();
    // ƒ.Project.register(mesh);

    let node: ƒ.Node;
    node = Scenes.createCompleteMeshNode("Node", material, mesh);
    testFileIo(node);
  }

  async function testFileIo(_graph: ƒ.Node): Promise<void> {
    console.group("Original");
    console.log(_graph);
    console.groupEnd();

    console.group("Serialized");
    let serialization: ƒ.Serialization = ƒ.Serializer.serialize(_graph);
    console.log(serialization);
    console.groupEnd();

    console.groupCollapsed("Stringified");
    let json: string = ƒ.Serializer.stringify(serialization);
    console.log(json);
    console.groupEnd();

    console.group("Save");
    let map: ƒ.MapFilenameToContent = { "TestFileIo.ƒ": json };
    await ƒ.FileIoBrowserLocal.save(map);
    console.log(map);
    console.groupEnd();

    console.group("Load");
    ƒ.FileIoBrowserLocal.addEventListener(ƒ.EVENT.FILE_LOADED, handleLoad);
    await ƒ.FileIoBrowserLocal.load();
    console.groupEnd();


    async function handleLoad(_event: CustomEvent): Promise<void> {
      map = _event.detail.mapFilenameToContent;
      console.log("Map", map);
      for (let filename in map) {

        let content: string = map[filename];
        ƒ.FileIoBrowserLocal.removeEventListener(ƒ.EVENT.FILE_LOADED, handleLoad);
        console.group("Parsed");
        let deserialization: ƒ.Serialization = ƒ.Serializer.parse(content);
        console.log(deserialization);
        console.groupEnd();

        console.group("Reconstructed");
        let reconstruction: ƒ.Serializable = await ƒ.Serializer.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();

        console.group("Comparison");
        Compare.compare(_graph, reconstruction);
        console.groupEnd();
      }
    }
  }
}