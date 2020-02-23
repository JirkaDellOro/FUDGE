var TestInstructions;
(function (TestInstructions) {
    // TODO: extend with form for comment. POST with automatically collected data to https://api.github.com/repos/JirkaDellOro/FUDGE/issues
    // see: https://developer.github.com/v3/issues/#create-an-issue
    let dialog;
    function display(_modal, _instructions) {
        dialog = document.createElement("dialog");
        dialog.innerHTML += "<small>Press Ctrl+F1 to toggle this dialog</small>";
        window.addEventListener("keyup", handleKeypress);
        // makeModal(_modal);
        for (let key in _instructions) {
            let content = _instructions[key];
            switch (key) {
                case "Name":
                    document.title = content + "|Test";
                    dialog.innerHTML += "<h1>" + content + "</h1";
                    break;
                default:
                    let fieldset = document.createElement("fieldset");
                    let legend = document.createElement("legend");
                    legend.textContent = key;
                    let ul = document.createElement("ul");
                    for (let element of content)
                        ul.innerHTML += "<li class='dialog'>" + element + "</h1>";
                    fieldset.className = "dialog";
                    ul.className = "dialog";
                    legend.className = "dialog";
                    fieldset.appendChild(legend);
                    fieldset.appendChild(ul);
                    dialog.appendChild(fieldset);
                    break;
            }
            document.body.appendChild(dialog);
            dialog.show();
        }
        dialog.className = "dialog";
    }
    TestInstructions.display = display;
    function handleKeypress(_event) {
        if (_event.code == "F1" && _event.ctrlKey)
            if (dialog.open)
                dialog.close();
            else
                dialog.show();
    }
})(TestInstructions || (TestInstructions = {}));
//# sourceMappingURL=TestInstructions.js.map