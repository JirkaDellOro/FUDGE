namespace FileIo {
    import ƒ = Fudge;
    ƒ.Serializer.registerNamespace(FileIo);
    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        document.querySelector("button").addEventListener("click", handleStart);
    }
    function handleStart(): void {
        let material: ƒ.Material = new ƒ.Material("Material_1", ƒ.ShaderFlat, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1)));
        // ƒ.ResourceManager.register(material);

        let mesh: ƒ.Mesh = new ƒ.MeshPyramid();
        // ƒ.ResourceManager.register(mesh);

        let node: ƒ.Node;
        node = Scenes.createCompleteMeshNode("Node", material, mesh);
        // let nodeResource: ƒ.NodeResource = ƒ.ResourceManager.registerNodeAsResource(node);

        // let instance: ƒ.NodeResourceInstance = new ƒ.NodeResourceInstance(nodeResource);
        // ƒ.Debug.log(instance);

        // let result: ƒ.Resources = testFileIo(node);
        testFileIo(node);
        console.group("Comparison");
        // Compare.compare(node, instance); 
        // Compare.compare(ƒ.ResourceManager.resources, result);
        console.groupEnd();
    }

    async function testFileIo(_branch: ƒ.Node): Promise<void> {
        console.group("Original");
        console.log(_branch);
        console.groupEnd();

        console.group("Serialized");
        let serialization: ƒ.Serialization = ƒ.Serializer.serialize(_branch);
        console.log(serialization);
        console.groupEnd();

        console.groupCollapsed("Stringified");
        let json: string = ƒ.Serializer.stringify(serialization);
        console.log(json);
        console.groupEnd();

        console.group("Save");
        let map: ƒ.MapFilenameToContent = { "TestFileIo.ƒ": json };
        ƒ.FileIoBrowserLocal.save(map);
        console.log(map);
        console.groupEnd();

        console.group("Load");
        let loaded: string;
        function handleLoad(_event: CustomEvent): void {
            map = _event.detail.mapFilenameToContent;
            console.log(map);
            loaded = map["TestFileIo.ƒ"];
            console.log(loaded);
            ƒ.FileIoBrowserLocal.removeEventListener(ƒ.EVENT.FILE_LOADED, handleLoad);
        }
        ƒ.FileIoBrowserLocal.addEventListener(ƒ.EVENT.FILE_LOADED, handleLoad);
        await ƒ.FileIoBrowserLocal.load();
        console.groupEnd();

        while (!loaded);

        console.group("Parsed");
        let deserialization: ƒ.Serialization = ƒ.Serializer.parse(loaded);
        console.log(deserialization);
        console.groupEnd();

        console.group("Reconstructed");
        let reconstruction: ƒ.Resources = ƒ.ResourceManager.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();
    }
}