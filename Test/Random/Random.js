var Random;
(function (Random) {
    var ƒ = FudgeCore;
    class Result {
        result;
        comment;
    }
    let seed = parseFloat(location.search.slice(1)) || undefined;
    console.log("Seed = " + seed);
    let random = new ƒ.Random(seed);
    let results = {};
    window.addEventListener("load", hndload);
    function hndload() {
        addResult("getNorm [0,1[", random.getNorm());
        addResult("getRange [-1,1[", random.getRange(-1, 1));
        addResult("getRangeFloored [-10, 10]", random.getRangeFloored(-10, 10));
        addResult("getBoolean", random.getBoolean());
        addResult("getSign", random.getSign());
        let array = ["a", "b", "c"];
        let i = random.getIndex(array);
        addResult("getIndex", i, array[i]);
        let j = random.getElement(array);
        addResult("getElement", j, array.indexOf(j));
        let k = random.splice(array);
        addResult("splice", k, array.toString());
        let s1 = Symbol("ƒudge1");
        let s2 = Symbol("ƒudge2");
        let object = { x: 10, b: true, s: "ƒudge" };
        object[s1] = "ƒudge1";
        object[s2] = "ƒudge2";
        let property = random.getPropertyName(object);
        addResult("getPropertyName", property, object[property]);
        let symbol = random.getPropertySymbol(object);
        addResult("getPropertySymbol", symbol, object[symbol]);
        let map = new Map();
        map.set(array, "Array");
        map.set(object, "Object");
        let key = random.getKey(map);
        addResult("getKey", key, map.get(key));
        let corner0 = ƒ.Vector3.ONE(-3);
        let corner1 = ƒ.Vector3.ONE(5);
        let randomVector2 = random.getVector2(corner0.toVector2(), corner1.toVector2());
        addResult("getVector2", randomVector2.toString());
        let randomVector3 = random.getVector3(corner0, corner1);
        addResult("getVector3", randomVector3.toString());
        console.table(results);
    }
    function addResult(...args) {
        let result = new Result();
        let i = 0;
        results[args[0]] = { result: args[1], comment: args[2] ? args[2] : null };
    }
})(Random || (Random = {}));
//# sourceMappingURL=Random.js.map