///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>

namespace Fudge {

    export function createViewData(container: GoldenLayout.Container, state: Object): void {
        let lblName: HTMLElement = document.createElement("label");
        lblName.innerHTML = "Node Name";
        let txtName: HTMLInputElement = document.createElement("input");
        txtName.value = "Hallo";
        container.getElement().append(lblName);
        container.getElement().append(txtName);
    }

    export class ViewData {
        public static goldenLayout: GoldenLayout;

        constructor (container: GoldenLayout.Container, state: Object) {
            let lblName: HTMLElement = document.createElement("label");
            lblName.innerHTML = "Node Name";
            let txtName: HTMLInputElement = document.createElement("input");
            txtName.value = "Hallo";
            container.getElement().append(lblName);
            container.getElement().append(txtName);
        }

        public static getLayout(): GoldenLayout.Config {
            const config: GoldenLayout.Config = {
                content: [{
                    type: "component",
                    componentName: VIEW.DATA,
                    title: "Data"
                }]
            };
            return config;
        }
    }
}