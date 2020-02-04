///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
var FudgeTest;
///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
(function (FudgeTest) {
    /**
     * View displaying all information of any selected entity and offering simple controls for manipulation
     */
    class ViewData extends FudgeTest.View {
        // TODO: adept view to selected object, update when selection changes etc.
        constructor(_parent) {
            super(_parent);
            this.fillContent();
        }
        deconstruct() {
            //TODO: Deconstruct;
        }
        fillContent() {
            let lblName = document.createElement("label");
            lblName.innerHTML = "Node Name";
            // TEST: button to emit message to panel. Should work when each panel holds a unique instance of GoldenLayout
            let btnMessage = document.createElement("button");
            btnMessage.innerText = "Send to panel";
            this.content.appendChild(lblName);
            this.content.appendChild(btnMessage);
        }
    }
    FudgeTest.ViewData = ViewData;
})(FudgeTest || (FudgeTest = {}));
//# sourceMappingURL=ViewData.js.map