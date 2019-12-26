namespace Random {
  import ƒ = FudgeCore;
  let random: ƒ.Random = new ƒ.Random();

  ƒ.Debug.log("[0,1[", random.getNorm());
  ƒ.Debug.log("[-1,1[", random.getRange(-1, 1));
  ƒ.Debug.log("[-10, 10]", random.getRangeFloored(-10, 10));
  ƒ.Debug.log("Bool", random.getBoolean());
  ƒ.Debug.log("Sign", random.getSign());

  let array: string[] = ["a", "b", "c"];
  let i: number = random.getIndex(array);
  ƒ.Debug.log("Index", i, array[i]);

  let s1: symbol = Symbol("ƒudge1");
  let s2: symbol = Symbol("ƒudge2");
  let object: {} = { x: 10, b: true, s: "ƒudge" };
  object[s1] = "ƒudge1";
  object[s2] = "ƒudge2"
  let property: PropertyKey = random.getPropertyName(object);
  ƒ.Debug.log("Property", property, object[property]);

  let symbol: PropertyKey = random.getPropertySymbol(object);
  ƒ.Debug.log("Property", symbol, object[symbol]);

  let map: Map<Object | string[], String> = new Map();
  map.set(array, "Array");
  map.set(object, "Object");
  let key: Object | string[] = random.getKey(map);
  ƒ.Debug.log("Key", key, map.get(key));
} 