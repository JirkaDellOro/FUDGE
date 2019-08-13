document.addEventListener("copy", copy);
document.addEventListener("paste", paste);
function copy(_e) {
    let data = { name: "Lukas", age: "24" };
    console.log(JSON.stringify(data));
    _e.clipboardData.setData("text/plain", JSON.stringify(data));
    _e.preventDefault();
    console.log(_e);
}
function paste(_e) {
    let data = _e.clipboardData.getData("text/plain");
    console.log(data);
}
//# sourceMappingURL=CopyPaste.js.map