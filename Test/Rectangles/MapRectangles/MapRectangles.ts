namespace RenderManagerRendering {
    import ƒ = Fudge;
    let map: ƒ.Framing = new ƒ.Framing();
    let uiResult: UI.Rectangle;
    let frame: ƒ.Rectangle = { x: 0, y: 0, width: 100, height: 100 };
    let uiMap: UI.MapRectangle;

    window.addEventListener("load", init);

    function init(): void {
        let menu: HTMLDivElement = document.getElementsByTagName("div")[0];

        uiMap = new UI.MapRectangle();
        menu.appendChild(uiMap);
        uiMap.addEventListener("input", hndChange); 
        uiMap.set({ Anchor: map.normAnchor, Border: map.pixelBorder });

        let uiRectangle: UI.Rectangle = new UI.Rectangle("Frame");
        uiRectangle.addEventListener("input", hndChange);
        menu.appendChild(uiRectangle);
        uiRectangle.set(frame);
        
        uiMap.set({ Result: map.getRect(frame) });
    }

    function hndChange(_event: Event): void {
        let target: UI.FieldSet<null> = <UI.FieldSet<null>>_event.currentTarget;
        setValues(target);
    }

    function setValues(_uiSet: UI.FieldSet<null>): void {
        let type: string = _uiSet.constructor.name;
        if (type == "Rectangle") {
            frame = <ƒ.Rectangle>_uiSet.get();
        }
        else {
            let value: {} = _uiSet.get();
            for (let key in value) {
                switch (key) {
                    case "Anchor":
                        map.normAnchor = <ƒ.Border>value[key];
                        break;
                    case "Border":
                        map.pixelBorder = <ƒ.Border>value[key];
                        break;
                    case "Result":
                        break;
                    default:
                        throw (new Error("Invalid name: " + _uiSet.name));
                }
            }
        }
        uiMap.set({ Result: map.getRect(frame) });
    }
}