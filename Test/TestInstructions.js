var TestInstructions;
(function (TestInstructions) {
    // TODO: extend with form for comment. POST with automatically collected data to https://api.github.com/repos/JirkaDellOro/FUDGE/issues
    // see: https://developer.github.com/v3/issues/#create-an-issue
    let dialog;
    let instructions;
    function display(_instructions, _open = true) {
        instructions = _instructions;
        dialog = document.createElement("dialog");
        dialogPolyfill.registerDialog(dialog);
        dialog.innerHTML += "<small>Press Ctrl+F1 to toggle this dialog</small>";
        window.addEventListener("keyup", handleKeypress);
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
                    ul.id = key;
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
            dialog.style.zIndex = "100";
            if (_open)
                //@ts-ignore
                dialog.show();
        }
        dialog.className = "dialog";
    }
    TestInstructions.display = display;
    function handleKeypress(_event) {
        if (_event.code == "F1" && _event.ctrlKey)
            //@ts-ignore
            if (dialog.open)
                //@ts-ignore
                dialog.close();
            else
                //@ts-ignore
                dialog.show();
    }
    function get(_key) {
        return dialog.querySelector("ul#" + _key);
    }
    TestInstructions.get = get;
})(TestInstructions || (TestInstructions = {}));
//# sourceMappingURL=TestInstructions.js.map