///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>
var Fudge;
(function (Fudge) {
    /**
     * View displaying all information of any selected entity and offering simple controls for manipulation
     */
    class ViewData extends Fudge.View {
        // TODO: adept view to selected object, update when selection changes etc.
        constructor(_parent) {
            super(_parent);
            this.registerToLayout = (container, state) => {
                container.getElement().append(this.content);
            };
            this.fillContent();
        }
        deconstruct() {
            //TODO: Deconstruct;
        }
        fillContent() {
            let lblName = document.createElement("label");
            lblName.innerHTML = "Node Name";
            let txtName = document.createElement("input");
            txtName.value = "Hallo";
            // TEST: button to emit message to panel. Should work when each panel holds a unique instance of GoldenLayout
            let btnMessage = document.createElement("button");
            btnMessage.innerText = "Send to panel";
            this.content.appendChild(lblName);
            this.content.appendChild(btnMessage);
        }
    }
    Fudge.ViewData = ViewData;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=ViewData.js.map