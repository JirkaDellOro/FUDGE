///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>

namespace Fudge {
    /**
     * View displaying all information of any selected entity and offering simple controls for manipulation
     */
    export class ViewData extends View {

        // TODO: adept view to selected object, update when selection changes etc.
        constructor(_container: GoldenLayout.Container, _state: Object) {
            super(_container, _state);
            let lblName: HTMLElement = document.createElement("label");
            lblName.innerHTML = "Node Name";
            let txtName: HTMLInputElement = document.createElement("input");
            txtName.value = "Hallo";
            _container.getElement().append(lblName);
            _container.getElement().append(txtName);

            // TEST: button to emit message to panel. Should work when each panel holds a unique instance of GoldenLayout
            let btnMessage: HTMLButtonElement = document.createElement("button");
            btnMessage.innerText = "Send to panel";
            _container.getElement().append(btnMessage);
            btnMessage.addEventListener("click", (_event: MouseEvent) => {
                // each container holds a reference to the layout manager, which is a GoldenLayout instance
                _container.layoutManager.emit("clickOnButtonInDataView");
            });
        }
    }
}