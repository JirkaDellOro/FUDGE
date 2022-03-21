namespace Random {
  import ƒ = FudgeCore;

  class Result {
    result: unknown;
    comment: unknown;
  }

  let seed: number = parseFloat(location.search.slice(1)) || undefined;
  console.log("Seed = " + seed);
  let random: ƒ.Random = new ƒ.Random(seed);
  let results: { [command: string]: Result } = {};

  window.addEventListener("load", hndload);

  function hndload(): void {
    addResult("getNorm [0,1[", random.getNorm());
    addResult("getRange [-1,1[", random.getRange(-1, 1));
    addResult("getRangeFloored [-10, 10]", random.getRangeFloored(-10, 10));
    addResult("getBoolean", random.getBoolean());
    addResult("getSign", random.getSign());

    let array: string[] = ["a", "b", "c"];
    let i: number = random.getIndex(array);
    addResult("getIndex", i, array[i]);

    let j: string = random.getElement(array);
    addResult("getElement", j, array.indexOf(j));

    let k: string = random.splice(array);
    addResult("splice", k, array.toString());

    let s1: symbol = Symbol("ƒudge1");
    let s2: symbol = Symbol("ƒudge2");
    let object: {} = { x: 10, b: true, s: "ƒudge" };
    object[s1] = "ƒudge1";
    object[s2] = "ƒudge2";
    let property: PropertyKey = random.getPropertyName(object);
    addResult("getPropertyName", property, object[property]);

    let symbol: PropertyKey = random.getPropertySymbol(object);
    addResult("getPropertySymbol", symbol, object[symbol]);

    let map: Map<Object | string[], String> = new Map();
    map.set(array, "Array");
    map.set(object, "Object");
    let key: Object | string[] = random.getKey(map);
    addResult("getKey", key, map.get(key));

    let corner0: ƒ.Vector3 = ƒ.Vector3.ONE(-3);
    let corner1: ƒ.Vector3 = ƒ.Vector3.ONE(5);
    let randomVector2: ƒ.Vector2 = random.getVector2(corner0.toVector2(), corner1.toVector2());
    addResult("getVector2", randomVector2.toString());
    let randomVector3: ƒ.Vector3 = random.getVector3(corner0, corner1);
    addResult("getVector3", randomVector3.toString());

    console.table(results);
  }

  function addResult(...args: unknown[]): void {
    let result: Result = new Result();
    let i: number = 0;
    results[<string>args[0]] = { result: args[1], comment: args[2] ? args[2] : null };
  }
}
