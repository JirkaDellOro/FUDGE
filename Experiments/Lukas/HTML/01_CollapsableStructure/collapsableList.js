document.addEventListener("DOMContentLoaded", init);
let crc;
function init() {
    let root = document.getElementById("animatedProperties");
    prepareList(root);
    let canvas = document.getElementsByTagName("canvas")[0];
    crc = canvas.getContext("2d");
    crc.strokeStyle = "#000";
    crc.lineWidth = 2;
}
function prepareList(_root) {
    console.log(_root);
    for (let c of _root.children) {
        for (let gc of c.children) {
            if (gc instanceof HTMLUListElement) {
                c.addEventListener("click", toggleListObj);
                prepareList(gc);
            }
        }
    }
    // document.querySelector("li+ul");
}
function toggleListObj(_event) {
    _event.preventDefault();
    if (_event.target != _event.currentTarget)
        return;
    let target = _event.target;
    let child = target.children[0];
    let childNowVisible = child.style.display == "none" ? true : false;
    child.style.display = childNowVisible ? "block" : "none";
    childNowVisible ? target.classList.remove("expanded") : target.classList.add("expanded");
    updateCanvas(target.offsetTop);
}
function updateCanvas(_offset) {
    crc.resetTransform();
    console.log(crc.canvas.width, crc.canvas.height);
    crc.clearRect(0, 0, crc.canvas.width, crc.canvas.height);
    crc.rect(10, _offset, 10, 10);
    crc.stroke();
}
//# sourceMappingURL=collapsableList.js.map