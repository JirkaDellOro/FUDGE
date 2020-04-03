namespace FudgeUserInterface {
    // import ƒ = FudgeCore;

    export class ToggleButton extends HTMLButtonElement {
        private toggleState: boolean;

        public constructor(style: string) {
            super();
            this.type = "button";
            this.toggleState = true;
            this.classList.add(style);
            this.classList.add("ToggleOn");
            this.addEventListener("click", this.switchToggleState);
        }
        public setToggleState(toggleState: boolean): void {
            this.toggleState = toggleState;
            if (this.toggleState == true) {
                this.classList.add("ToggleOn");
                this.classList.remove("ToggleOff");
            }
            else {
                this.classList.remove("ToggleOn");
                this.classList.add("ToggleOff");
            }
        }
        public getToggleState(): boolean {
            return this.toggleState;
        }
        public toggle(): void {
            this.setToggleState(!this.toggleState);
        }
        private switchToggleState = (_event: MouseEvent): void => {
            this.setToggleState(!this.toggleState);
        }
    }
    customElements.define("ui-toggle-button", ToggleButton, { extends: "button" });
}
