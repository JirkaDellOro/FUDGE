"use strict";
// /<reference path="Panel.ts"/>
var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    window.addEventListener("load", start);
    let configPanel = {
        content: [{
                type: "row",
                content: [
                    {
                        type: "component",
                        componentName: "Panel",
                        componentState: { text: "Panel 1" },
                        title: "Panel1"
                        // }, {
                        //   type: "component",
                        //   componentName: "Panel",
                        //   componentState: { text: "Panel 2" },
                        //   title: "Panel2"
                    }
                ]
            }]
    };
    function start() {
        let btnAdd = document.querySelector("button");
        btnAdd.addEventListener("click", GoldenLayoutTest.Panel.add);
        GoldenLayoutTest.glDoc = new GoldenLayout(configPanel);
        GoldenLayoutTest.glDoc.registerComponent("Panel", GoldenLayoutTest.Panel);
        GoldenLayoutTest.glDoc.init();
    }
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=GoldenLayoutTest.js.map