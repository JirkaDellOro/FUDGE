var RenderManagerRendering;
(function (RenderManagerRendering) {
    var ƒ = Fudge;
    let map = new ƒ.MapRectangle();
    let uiResult;
    let frame = { x: 0, y: 0, width: 100, height: 100 };
    window.addEventListener("load", init);
    function init() {
        let menu = document.getElementsByTagName("div")[0];
        let uiRectangle = new UI.Rectangle("Frame");
        uiRectangle.addEventListener("input", hndChange);
        menu.appendChild(uiRectangle);
        uiRectangle.set(frame);
        let uiAnchor = new UI.Border("Anchor", 0.1);
        uiAnchor.addEventListener("input", hndChange);
        menu.appendChild(uiAnchor);
        uiAnchor.set(map.normAnchor);
        let uiBorder = new UI.Border("Border");
        uiBorder.addEventListener("input", hndChange);
        menu.appendChild(uiBorder);
        uiBorder.set(map.pixelBorder);
        uiResult = new UI.Rectangle("Result");
        menu.appendChild(uiResult);
        uiResult.set(map.getRect(frame));
    }
    function hndChange(_event) {
        let target = _event.currentTarget;
        setValues(target);
        console.log(map);
    }
    function setValues(_uiValue) {
        let value = _uiValue.get();
        switch (_uiValue.name) {
            case "Frame":
                frame = value;
                break;
            case "Anchor":
                map.normAnchor = value;
                break;
            case "Border":
                map.pixelBorder = value;
                break;
            default:
                throw (new Error("Invalid name: " + _uiValue.name));
        }
        uiResult.set(map.getRect(frame));
    }
})(RenderManagerRendering || (RenderManagerRendering = {}));
//# sourceMappingURL=MapRectangles.js.map