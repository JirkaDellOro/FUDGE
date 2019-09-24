///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
var FudgeTest;
///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
(function (FudgeTest) {
    /**
     * View displaying a Node and the hierarchical relation to its parents and children.
     * Consists of a viewport and a tree-control.
     */
    class ViewNode extends FudgeTest.View {
        constructor(_parent) {
            super(_parent);
            this.fillContent();
        }
        deconstruct() {
            //TODO: desconstruct
        }
        fillContent() {
            let element = document.createElement("div");
            element.innerText = "I'm a ViewNode, don't question why I have nothing more to say than that.";
            this.content.append(element);
        }
    }
    FudgeTest.ViewNode = ViewNode;
})(FudgeTest || (FudgeTest = {}));
//# sourceMappingURL=ViewNode.js.map