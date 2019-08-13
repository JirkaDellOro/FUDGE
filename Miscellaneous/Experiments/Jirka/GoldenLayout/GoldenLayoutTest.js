"use strict";
var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    let dim1 = { borderWidth: 10 };
    let dim2 = { borderWidth: 10 };
    let config = { dimensions: dim1 };
    let golden = new GoldenLayout(config);
    console.log(dim1);
    console.log(dim2);
    console.log(golden);
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=GoldenLayoutTest.js.map