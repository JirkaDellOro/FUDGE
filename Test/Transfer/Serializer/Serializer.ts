namespace TestSerializer {
  import ƒ = FudgeCore;

  window.addEventListener("DOMContentLoaded", init);

  function init(): void {
    Scenes.createMiniScene();

    let result: ƒ.Serializable = testSerialization(Scenes.node);
    console.group("Comparison");
    Compare.compare(Scenes.node, result);
    console.groupEnd();

    // let v: ƒ.Vector3 = new ƒ.Vector3(1, 2, 3);
    // let result2: ƒ.Serializable = testSerialization(v);
    // console.group("Comparison");
    // Compare.compare(v, result2);
    // console.groupEnd();
  }

  function testSerialization(_object: ƒ.Serializable): ƒ.Serializable {
    console.group("Original");
    console.log(_object);
    console.groupEnd();

    console.group("Serialized");
    let serialization: ƒ.Serialization = ƒ.Serializer.serialize(_object);
    console.log(serialization);
    console.groupEnd();

    console.groupCollapsed("Stringified");
    let json: string = ƒ.Serializer.stringify(serialization);
    console.log(json);
    console.groupEnd();

    console.group("Parsed");
    serialization = ƒ.Serializer.parse(json);
    console.log(serialization);
    console.groupEnd();

    console.group("Reconstructed");
    let reconstruction: ƒ.Serializable = ƒ.Serializer.deserialize(serialization);
    console.log(reconstruction);
    console.groupEnd();

    return reconstruction;
  }
}