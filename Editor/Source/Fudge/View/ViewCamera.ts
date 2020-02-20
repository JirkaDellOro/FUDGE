namespace Fudge {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    /**
     * View displaying all information of any selected entity and offering simple controls for manipulation
     */
    enum Menu {
        COMPONENTMENU = "Add Components"
    }

    export class ViewCamera extends View {
        camera: ƒ.ComponentCamera;

        constructor(_panel: Panel) {
            super(_panel);
            this.parentPanel.addEventListener(ƒui.UIEVENT.ACTIVEVIEWPORT, this.setCamera);
            let div: HTMLDivElement = document.createElement("div");
            this.content.appendChild(div);
        }

        fillContent(): void {
            let div: HTMLDivElement = document.createElement("div");
            let inspector: ƒui.UINodeData = new ƒui.UINodeData(this.camera, div);
            this.content.replaceChild(div, this.content.firstChild);
        }        
        
        deconstruct(): void {
            throw new Error("Method not implemented.");
        }

        private setCamera = (_event: CustomEvent): void => {
            this.camera = _event.detail;
            this.fillContent();
        }
        
    }
}