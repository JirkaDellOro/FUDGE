namespace Random {
  import ƒ = FudgeCore;
  let random: ƒ.Random = new ƒ.Random();

  window.addEventListener("load", hndload);
  function hndload(): void {

    ƒ.Debug.log("[0,1[", random.getNorm());

    ƒ.Debug.log("[-1,1[", random.getRange(-1, 1));
    ƒ.Debug.log("[-10, 10]", random.getRangeFloored(-10, 10));
    ƒ.Debug.log("Bool", random.getBoolean());
    ƒ.Debug.log("Sign", random.getSign());

    let array: string[] = ["a", "b", "c"];
    let i: number = random.getIndex(array);
    ƒ.Debug.log("Index", i, array[i]);

    let j: string = random.getElement(array);
    ƒ.Debug.log("Element", j, array.indexOf(j));

    let k: string = random.splice(array);
    ƒ.Debug.log("splice", k, array);

    let s1: symbol = Symbol("ƒudge1");
    let s2: symbol = Symbol("ƒudge2");
    let object: {} = { x: 10, b: true, s: "ƒudge" };
    object[s1] = "ƒudge1";
    object[s2] = "ƒudge2";
    let property: PropertyKey = random.getPropertyName(object);
    ƒ.Debug.log("Property", property, object[property]);

    let symbol: PropertyKey = random.getPropertySymbol(object);
    ƒ.Debug.log("Property", symbol, object[symbol]);

    let map: Map<Object | string[], String> = new Map();
    map.set(array, "Array");
    map.set(object, "Object");
    let key: Object | string[] = random.getKey(map);
    ƒ.Debug.log("Key", key, map.get(key));


    let corner0: ƒ.Vector3 = ƒ.Vector3.ZERO();
    let corner1: ƒ.Vector3 = new ƒ.Vector3(5, 5, 5);
    let randomVector2: ƒ.Vector2 = random.getVector2(corner0.toVector2(), corner1.toVector2());
    ƒ.Debug.log("Vector2", randomVector2);
    let randomVector3: ƒ.Vector3 = random.getVector3(corner0, corner1);
    ƒ.Debug.log("Vector3", randomVector3);
  }

}
