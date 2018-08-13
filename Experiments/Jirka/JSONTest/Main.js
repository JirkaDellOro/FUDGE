/**
 * Testing JSON <-> Object conversion
 * The JSON-parser fully stringifies and reconstructs scene-hierarchies
 * It does not deal with objects that already have been serialized but referenced a number of times
 */
var JSONTest;
(function (JSONTest) {
    window.addEventListener("load", init);
    function init(_event) {
        let parent = new FudgeNode("Parent");
        let child0 = new FudgeNode("Child0");
        let child1 = new FudgeNode("Child1");
        let grand00 = new FudgeNode("Grand00");
        let grand01 = new FudgeNode("Grand01");
        child1.appendChild(grand00);
        child1.appendChild(grand01);
        child1.appendChild(grand01);
        child1.appendChild(grand01);
        child1.appendChild(grand01);
        parent.appendChild(child0);
        parent.appendChild(child1);
        console.dir(parent);
        let json = JSON.stringify(parent);
        console.log(json);
        let parsed = JSON.parse(json);
        console.log(parsed);
    }
    class FudgeNode {
        constructor(_name) {
            this.name = _name;
            this.children = [];
        }
        appendChild(child) {
            this.children.push(child);
        }
    }
})(JSONTest || (JSONTest = {}));
//# sourceMappingURL=Main.js.map