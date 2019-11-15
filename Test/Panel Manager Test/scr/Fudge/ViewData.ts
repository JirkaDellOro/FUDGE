///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>

namespace FudgeTest {
    /**
     * View displaying all information of any selected entity and offering simple controls for manipulation
     */
    export class ViewData extends View {

        // TODO: adept view to selected object, update when selection changes etc.
        constructor(_parent: Panel) {
            super(_parent);
            this.fillContent();
        }
        deconstruct(): void {
            //TODO: Deconstruct;
        }
        fillContent(): void {
            let lblName: HTMLElement = document.createElement("label");
            lblName.innerHTML = "Node Name";

            // TEST: button to emit message to panel. Should work when each panel holds a unique instance of GoldenLayout
            let btnMessage: HTMLButtonElement = document.createElement("button");
            btnMessage.innerText = "Send to panel";
            this.content.appendChild(lblName);
            this.content.appendChild(btnMessage);
        }
    }
}