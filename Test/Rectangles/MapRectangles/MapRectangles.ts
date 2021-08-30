namespace RenderRendering {
    import ƒ = FudgeCore;
    let map: ƒ.FramingComplex = new ƒ.FramingComplex();

    let frame: ƒ.Rectangle = new ƒ.Rectangle(0, 0, 100, 100);
    let uiMap: UI.FramingComplex;
   /*  let crc2: CanvasRenderingContext2D; */

    window.addEventListener("load", init);

    function init(): void {

       /*  let canvas: HTMLCanvasElement = document.querySelector("canvas");
        crc2 = canvas.getContext("2d"); */

        let menu: HTMLDivElement = document.querySelector("div[name=menu]");

        uiMap = new UI.FramingComplex();
        menu.appendChild(uiMap);
        uiMap.addEventListener("input", hndChange);
        uiMap.set({ Anchor: map.margin, Border: map.padding });

        let uiRectangle: UI.Rectangle = new UI.Rectangle("Frame");
        uiRectangle.addEventListener("input", hndChange);
        menu.appendChild(uiRectangle);
        uiRectangle.set(frame);

        uiMap.set({ Result: map.getRect(frame) });

    }

    function hndChange(_event: Event): void {
        let target: UI.FieldSet = <UI.FieldSet>_event.currentTarget;

        setValues(target);

    }

    function setValues(_uiSet: UI.FieldSet): void {
        let type: string = _uiSet.constructor.name;
        if (type == "Rectangle") {
            frame = <ƒ.Rectangle>_uiSet.get();
        }
        else {
            let value: {} = _uiSet.get();

            for (let key in value) {

                switch (key) {
                    case "Margin":
                        map.margin = <ƒ.Border>value[key];
                        break;
                    case "Padding":
                        map.padding = <ƒ.Border>value[key];
                        break;
                    case "Result":
                        break;
                    default:
                        throw (new Error("Invalid name: " + _uiSet.name));
                }
            }
        }
        uiMap.set({ Result: map.getRect(frame) });
       /*  drawRect(map.getRect(frame)); */
    }

   /*  function drawRect(_rect: ƒ.Rectangle): void {
        crc2.clearRect(0, 0, crc2.canvas.width, crc2.canvas.height)
        crc2.strokeRect(_rect.position.x, _rect.position.y, _rect.size.x, _rect.size.y);
    } */
}