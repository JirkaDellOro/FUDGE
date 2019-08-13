var FileIo;
(function (FileIo) {
    var ƒ = Fudge;
    ƒ.Serializer.registerNamespace(FileIo);
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        document.querySelector("button").addEventListener("click", handleStart);
    }
    function handleStart() {
        let material = new ƒ.Material("Material_1", ƒ.ShaderFlat, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1)));
        // ƒ.ResourceManager.register(material);
        let mesh = new ƒ.MeshPyramid();
        // ƒ.ResourceManager.register(mesh);
        let node;
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
    async function testFileIo(_branch) {
        console.group("Original");
        console.log(_branch);
        console.groupEnd();
        console.group("Serialized");
        let serialization = ƒ.Serializer.serialize(_branch);
        console.log(serialization);
        console.groupEnd();
        console.groupCollapsed("Stringified");
        let json = ƒ.Serializer.stringify(serialization);
        console.log(json);
        console.groupEnd();
        console.group("Save");
        let map = { "TestFileIo.ƒ": json };
        await ƒ.FileIoBrowserLocal.save(map);
        console.log(map);
        console.groupEnd();
        console.group("Load");
        let loaded;
        function handleLoad(_event) {
            map = _event.detail.mapFilenameToContent;
            console.log(map);
            loaded = map["TestFileIo.ƒ"];
            console.log(loaded);
            ƒ.FileIoBrowserLocal.removeEventListener("fileLoaded" /* FILE_LOADED */, handleLoad);
        }
        ƒ.FileIoBrowserLocal.addEventListener("fileLoaded" /* FILE_LOADED */, handleLoad);
        await ƒ.FileIoBrowserLocal.load();
        console.groupEnd();
        while (!loaded)
            ;
        console.group("Parsed");
        let deserialization = ƒ.Serializer.parse(loaded);
        console.log(deserialization);
        console.groupEnd();
        console.group("Reconstructed");
        let reconstruction = ƒ.ResourceManager.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();
    }
})(FileIo || (FileIo = {}));
//# sourceMappingURL=FileIo.js.map