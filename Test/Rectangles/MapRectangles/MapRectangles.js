var RenderRendering;
(function (RenderRendering) {
    var ƒ = FudgeCore;
    let map = new ƒ.FramingComplex();
    let frame = new ƒ.Rectangle(0, 0, 100, 100);
    let uiMap;
    /*  let crc2: CanvasRenderingContext2D; */
    window.addEventListener("load", init);
    function init() {
        /*  let canvas: HTMLCanvasElement = document.querySelector("canvas");
         crc2 = canvas.getContext("2d"); */
        let menu = document.querySelector("div[name=menu]");
        uiMap = new UI.FramingComplex();
        menu.appendChild(uiMap);
        uiMap.addEventListener("input", hndChange);
        uiMap.set({ Anchor: map.margin, Border: map.padding });
        let uiRectangle = new UI.Rectangle("Frame");
        uiRectangle.addEventListener("input", hndChange);
        menu.appendChild(uiRectangle);
        uiRectangle.set(frame);
        uiMap.set({ Result: map.getRect(frame) });
    }
    function hndChange(_event) {
        let target = _event.currentTarget;
        setValues(target);
    }
    function setValues(_uiSet) {
        let type = _uiSet.constructor.name;
        if (type == "Rectangle") {
            frame = _uiSet.get();
        }
        else {
            let value = _uiSet.get();
            for (let key in value) {
                switch (key) {
                    case "Margin":
                        map.margin = value[key];
                        break;
                    case "Padding":
                        map.padding = value[key];
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
})(RenderRendering || (RenderRendering = {}));
//# sourceMappingURL=MapRectangles.js.map