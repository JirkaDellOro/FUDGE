var TestInstructions;
(function (TestInstructions) {
    // TODO: extend with form for comment. POST with automatically collected data to https://api.github.com/repos/JirkaDellOro/FUDGE/issues
    // see: https://developer.github.com/v3/issues/#create-an-issue
    let dialog;
    let closeButton;
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
        closeButton = document.createElement("div");
        closeButton.classList.add("dialog-button");
        closeButton.innerHTML = `<div class="a"></div><div class="b"></div><div class="c"></div>`;
        document.body.appendChild(closeButton);
        closeButton.classList.add("open");
        closeButton.addEventListener("click", toggleDialog);
        let viewportMeta = document.createElement("meta");
        viewportMeta.name = "viewport";
        viewportMeta.content = "width=device-width, initial-scale=1.0";
        // viewportMeta.outerHTML = `<meta name="viewport" content=>`;
        document.head.appendChild(viewportMeta);
    }
    TestInstructions.display = display;
    function handleKeypress(_event) {
        if (_event.code == "F1" && _event.ctrlKey)
            toggleDialog();
    }
    function toggleDialog() {
        //@ts-ignore
        if (dialog.open) {
            //@ts-ignore
            dialog.close();
            closeButton.classList.remove("open");
        }
        else {
            //@ts-ignore
            dialog.show();
            closeButton.classList.add("open");
        }
    }
    function get(_key) {
        return dialog.querySelector("ul#" + _key);
    }
    TestInstructions.get = get;
})(TestInstructions || (TestInstructions = {}));
//# sourceMappingURL=TestInstructions.js.map