/**
 * Testing JSON <-> Object conversion
 * The JSON-parser fully stringifies and reconstructs scene-hierarchies
 * It does not deal with objects that already have been serialized but referenced a number of times
 */
namespace JSONTest {
    window.addEventListener("load", init);

    function init(_event: Event): void {
        let parent: FudgeNode = new FudgeNode("Parent");
        let child0: FudgeNode = new FudgeNode("Child0");
        let child1: FudgeNode = new FudgeNode("Child1");
        let grand00: FudgeNode = new FudgeNode("Grand00");        
        let grand01: FudgeNode = new FudgeNode("Grand01");        

        child1.appendChild(grand00);
        child1.appendChild(grand01);
        child1.appendChild(grand01);
        child1.appendChild(grand01);
        child1.appendChild(grand01);
        parent.appendChild(child0);
        parent.appendChild(child1);

        console.dir(parent);

        let json: string = JSON.stringify(parent);
        console.log(json);

        let parsed: FudgeNode = JSON.parse(json);
        console.log(parsed);
    }

    class FudgeNode {
        name: string;
        children: FudgeNode[];

        constructor(_name: string) {
            this.name = _name;
            this.children = [];
        }

        appendChild(child: FudgeNode): void {
            this.children.push(child);
        }
    }
}