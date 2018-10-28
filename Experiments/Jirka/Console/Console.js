function toWords(_value, _hyphen) {
    var word = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    var res = "";
    for (; !(_value < 1); _value /= 10) {
        _value = Math.floor(_value);
        var digit = _value % 10;
        res = (res.length > 0 ? (_hyphen ? "-" : " ") : "") + res;
        res = word[digit] + res;
    }
    return res;
}
var words = toWords(4362, true);
console.log(words);
/*/
console.time("test");
console.log("log");
console.error("error");
console.info("info");
console.warn("warn");
console.log(console);
console.trace();
console.groupCollapsed("group");
console.log("groupEntry");
console.log("groupEntry");
console.log("groupEntry");
console.groupEnd();
console.timeEnd("test");
//*/
//# sourceMappingURL=Console.js.map