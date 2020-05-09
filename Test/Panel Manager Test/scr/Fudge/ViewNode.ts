///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>

namespace FudgeTest {
    import ƒ = FudgeCore;

    /**
     * View displaying a Node and the hierarchical relation to its parents and children.  
     * Consists of a viewport and a tree-control. 
     */
    export class ViewNode extends View {
        constructor(_parent: Panel) {
            super(_parent);
            this.fillContent();
        }
        deconstruct(): void {
            //TODO: desconstruct
        }

        fillContent(): void { 
           let element: HTMLElement = document.createElement("div");
           element.innerText = "I'm a ViewNode, don't question why I have nothing more to say than that.";
           this.content.append(element);
        }
    }
}
