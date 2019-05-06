namespace RenderManagerRendering {
    import ƒ = Fudge;
    let map: ƒ.MapRectangle = new ƒ.MapRectangle();
    let uiResult: UI.Rectangle;
    let frame: ƒ.Rectangle = { x: 0, y: 0, width: 100, height: 100 };

    window.addEventListener("load", init);

    function init(): void {
        let menu: HTMLDivElement = document.getElementsByTagName("div")[0];

        let uiRectangle: UI.Rectangle = new UI.Rectangle("Frame");
        uiRectangle.addEventListener("input", hndChange);
        menu.appendChild(uiRectangle);
        uiRectangle.set(frame);

        let uiAnchor: UI.Border = new UI.Border("Anchor", 0.1);
        uiAnchor.addEventListener("input", hndChange);
        menu.appendChild(uiAnchor);
        uiAnchor.set(map.normAnchor);

        let uiBorder: UI.Border = new UI.Border("Border");
        uiBorder.addEventListener("input", hndChange);
        menu.appendChild(uiBorder);
        uiBorder.set(map.pixelBorder);

        uiResult = new UI.Rectangle("Result");
        menu.appendChild(uiResult);

        uiResult.set(map.getRect(frame));
    }



    function hndChange(_event: Event): void {
        let target: UI.Rectangle | UI.Border = <UI.Rectangle | UI.Border>_event.currentTarget;
        setValues(target);
        console.log(map);
    }

    function setValues(_uiValue: UI.Rectangle | UI.Border): void {
        let value: ƒ.Rectangle | ƒ.Border = _uiValue.get();
        switch (_uiValue.name) {
            case "Frame":
                frame = <ƒ.Rectangle>value;
                break;
            case "Anchor":
                map.normAnchor = <ƒ.Border>value;
                break;
            case "Border":
                map.pixelBorder = <ƒ.Border>value;
                break;
            default:
                throw (new Error("Invalid name: " + _uiValue.name));
        }

        uiResult.set(map.getRect(frame));
    }
}