var TestDebug;
(function (TestDebug) {
    var ƒ = FudgeCore;
    let filters = new Map([
        [ƒ.DEBUG_FILTER.INFO, ƒ.Debug.info],
        [ƒ.DEBUG_FILTER.LOG, ƒ.Debug.log],
        [ƒ.DEBUG_FILTER.WARN, ƒ.Debug.warn],
        [ƒ.DEBUG_FILTER.ERROR, ƒ.Debug.error],
        [ƒ.DEBUG_FILTER.FUDGE, ƒ.Debug.fudge],
        [ƒ.DEBUG_FILTER.CLEAR, ƒ.Debug.clear],
        [ƒ.DEBUG_FILTER.GROUP, ƒ.Debug.group],
        [ƒ.DEBUG_FILTER.GROUPCOLLAPSED, ƒ.Debug.groupCollapsed],
        [ƒ.DEBUG_FILTER.GROUPEND, ƒ.Debug.groupEnd]
    ]);
    let targets = [ƒ.DebugConsole, ƒ.DebugTextArea, ƒ.DebugAlert];
    window.addEventListener("load", init);
    function init(_event) {
        let form = document.forms[0];
        form.appendChild(createTable());
        form.addEventListener("change", createMessage);
        ƒ.DebugTextArea.textArea = document.querySelector("textarea");
    }
    function createTable() {
        console.log(filters, targets);
        let table = document.createElement("table");
        table.addEventListener("click", hndClickCell);
        let row = document.createElement("tr");
        table.appendChild(row);
        row.appendChild(document.createElement("td"));
        for (let filter of filters) {
            let head = document.createElement("th");
            head.textContent = ƒ.DEBUG_FILTER[filter[0]];
            head.setAttribute("toggle", "false");
            head.setAttribute("name", filter[0].toString());
            head.addEventListener("click", toggleColumn);
            row.appendChild(head);
        }
        let countRow = 0;
        for (let target of targets) {
            row = document.createElement("tr");
            table.appendChild(row);
            let head = document.createElement("th");
            head.textContent = getTargetName(target);
            head.setAttribute("toggle", "false");
            head.addEventListener("click", toggleRow);
            row.appendChild(head);
            let countColumn = 0;
            for (let filter of filters) {
                let cell = document.createElement("td");
                cell.innerHTML = `<input name="${filter[0]}|${countRow}" type="checkbox"/>`;
                row.appendChild(cell);
                countColumn++;
            }
            countRow++;
        }
        row = document.createElement("tr");
        table.appendChild(row);
        row.appendChild(document.createElement("td"));
        for (let filter of filters) {
            let cell = document.createElement("td");
            let button = document.createElement("button");
            cell.appendChild(button);
            button.innerText = "Send";
            button.type = "button";
            button.addEventListener("click", sendMessage);
            button.setAttribute("filter", filter[0].toString());
            row.appendChild(cell);
        }
        return table;
    }
    function createMessage(_event) {
        let message = {};
        for (let index in targets) {
            let filterResult = ƒ.DEBUG_FILTER.NONE;
            let target = targets[index];
            message[getTargetName(target)] = [];
            for (let filter of filters) {
                let type = filter[0];
                let checkbox = document.forms[0].querySelector(`input[name="${type}|${index}"]`);
                // console.log(index, type, checkbox.checked);
                if (checkbox.checked) {
                    filterResult |= type;
                    message[getTargetName(target)].push(ƒ.DEBUG_FILTER[type]);
                }
            }
            ƒ.Debug.setFilter(target, filterResult);
        }
        document.querySelector("p#Message").textContent = JSON.stringify(message);
        return message;
    }
    function hndClickCell(_event) {
        let target = _event.target;
        if (target.tagName == "TD") {
            let checkbox = target.children[0];
            checkbox.checked = !checkbox.checked;
        }
        createMessage(null);
    }
    function sendMessage(_event) {
        let target = _event.target;
        let filter = target.getAttribute("filter");
        let debug = filters.get(parseInt(filter));
        // console.log(debug);
        let message = createMessage(null);
        debug(JSON.stringify(message), message);
    }
    function getTargetName(_target) {
        return Reflect.getOwnPropertyDescriptor(_target, "name").value;
    }
    function toggleRow(_event) {
        let target = _event.target;
        let boxes = target.parentElement.querySelectorAll("input");
        toggle(target, boxes);
    }
    function toggleColumn(_event) {
        let target = _event.target;
        let selector = `input[name^="${target.getAttribute("name")}|"]`;
        let boxes = document.forms[0].querySelectorAll(selector);
        toggle(target, boxes);
    }
    function toggle(_head, _boxes) {
        let toggle = _head.getAttribute("toggle") == "false";
        for (let box of _boxes)
            box.checked = toggle;
        _head.setAttribute("toggle", toggle.toString());
    }
})(TestDebug || (TestDebug = {}));
//# sourceMappingURL=TestDebug.js.map