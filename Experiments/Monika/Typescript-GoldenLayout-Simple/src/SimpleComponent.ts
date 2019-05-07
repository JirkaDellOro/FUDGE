namespace GoldenLayoutTest {
    export class SimpleComponent{
        public constructor(container: any, state: any) {
            let element: HTMLSpanElement = document.createElement("span");
            element.innerHTML = "<h2>Hallo liebe Menschen, Ich funktioniere.</h2>";
            container.getElement().html(element);
        }
        // public static create(container: any, state: any) {
        //     let element: HTMLSpanElement = document.createElement("span");
        //     element.innerHTML = "<h2>Hallo liebe Menschen, Ich funktioniere.</h2>";
        //     container.getElement().html(element);
        // }
    }

}