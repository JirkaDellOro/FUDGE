///<reference types="../../../Core/Build/FudgeCore"/>
//<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>

namespace Fudge {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    /**
     * View displaying all information of any selected entity and offering simple controls for manipulation
     */
    export class ViewData extends View {
        private node: ƒ.Node;
        // TODO: adept view to selected object, update when selection changes etc.
        constructor(_parent: Panel) {
            super(_parent);
            this.parentPanel.addEventListener(ƒui.UIEVENT.SELECTION, this.setNode);
            this.fillContent();
        }
        deconstruct(): void {
            //TODO: Deconstruct;
        }
        fillContent(): void {
            if (this.node) {
                let cntHeader: HTMLElement = document.createElement("span");
                let lblNodeName: HTMLElement = document.createElement("label");
                lblNodeName.textContent = "Name";
                cntHeader.append(lblNodeName);
                this.content.append(cntHeader);
                let txtNodeName: HTMLInputElement = document.createElement("input");
                txtNodeName.value = this.node.name;
                cntHeader.append(txtNodeName);
                let cntComponents: HTMLDivElement = document.createElement("div");
                let nodeComponents: ƒ.Component[] = this.node.getAllComponents();
                console.group("Components of the node");
                console.log(nodeComponents);
                for (let nodeComponent of nodeComponents) {
                    let uiComponents: ƒui.UINodeData = new ƒui.UINodeData(nodeComponent, this.content);
                }
                console.groupEnd();

            }
            else {
                let cntEmpty: HTMLDivElement = document.createElement("div");
                this.content.append(cntEmpty);
            }
        }

        private setNode = (_event: CustomEvent): void => {
            console.log(this.content);
            this.node = _event.detail;
            while (this.content.firstChild != null) {
                this.content.removeChild(this.content.lastChild);
            }
            this.fillContent();
            console.log(this.content);
        }
    }
}