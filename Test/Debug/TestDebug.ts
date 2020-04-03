namespace TestDebug {
  import ƒ = FudgeCore;

  let filters: Map<ƒ.DEBUG_FILTER, Function> = new Map([
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
  let targets: ƒ.DebugTarget[] = [ƒ.DebugConsole, ƒ.DebugTextArea, ƒ.DebugAlert];

  window.addEventListener("load", init);

  function init(_event: Event): void {
    let form: HTMLFormElement = document.forms[0];
    form.appendChild(createTable());
    form.addEventListener("change", createMessage);
    ƒ.DebugTextArea.textArea = document.querySelector("textarea");
  }

  function createTable(): HTMLTableElement {
    console.log(filters, targets);

    let table: HTMLTableElement = document.createElement("table");
    table.addEventListener("click", hndClickCell);

    let row: HTMLTableRowElement = document.createElement("tr");
    table.appendChild(row);
    row.appendChild(document.createElement("td"));
    for (let filter of filters) {
      let head: HTMLTableHeaderCellElement = document.createElement("th");
      head.textContent = ƒ.DEBUG_FILTER[filter[0]];
      head.setAttribute("toggle", "false");
      head.setAttribute("name", filter[0].toString());
      head.addEventListener("click", toggleColumn);
      row.appendChild(head);
    }

    let countRow: number = 0;
    for (let target of targets) {
      row = document.createElement("tr");
      table.appendChild(row);
      let head: HTMLTableHeaderCellElement = document.createElement("th");
      head.textContent = getTargetName(target);
      head.setAttribute("toggle", "false");
      head.addEventListener("click", toggleRow);
      row.appendChild(head);

      let countColumn: number = 0;
      for (let filter of filters) {
        let cell: HTMLTableCellElement = document.createElement("td");
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
      let cell: HTMLTableCellElement = document.createElement("td");
      let button: HTMLButtonElement = document.createElement("button");
      cell.appendChild(button);
      button.innerText = "Send";
      button.type = "button";
      button.addEventListener("click", sendMessage);
      button.setAttribute("filter", filter[0].toString());
      row.appendChild(cell);
    }

    return table;
  }

  function createMessage(_event: Event): Object {
    let message: Object = {};

    for (let index in targets) {
      let filterResult: number = ƒ.DEBUG_FILTER.NONE;
      let target: ƒ.DebugTarget = targets[index];
      message[getTargetName(target)] = [];

      for (let filter of filters) {
        let type: ƒ.DEBUG_FILTER = <ƒ.DEBUG_FILTER>filter[0];
        let checkbox: HTMLInputElement = document.forms[0].querySelector(`input[name="${type}|${index}"]`);
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

  function hndClickCell(_event: MouseEvent): void {
    let target: HTMLElement = <HTMLElement>_event.target;
    if (target.tagName == "TD") {
      let checkbox: HTMLInputElement = <HTMLInputElement>target.children[0];
      checkbox.checked = !checkbox.checked;
    }
    createMessage(null);
  }

  function sendMessage(_event: MouseEvent): void {
    let target: HTMLElement = <HTMLElement>_event.target;
    let filter: string = target.getAttribute("filter");
    let debug: Function = filters.get(parseInt(filter));
    // console.log(debug);
    let message: Object = createMessage(null);
    debug(JSON.stringify(message), message);
  } 

  function getTargetName(_target: ƒ.DebugTarget): string {
    return Reflect.getOwnPropertyDescriptor(_target, "name").value;
  }

  function toggleRow(_event: Event): void {
    let target: HTMLElement = <HTMLElement>_event.target;
    let boxes: NodeListOf<HTMLInputElement> = target.parentElement.querySelectorAll("input");
    toggle(target, boxes);
  }

  function toggleColumn(_event: Event): void {
    let target: HTMLElement = <HTMLElement>_event.target;
    let selector: string = `input[name^="${target.getAttribute("name")}|"]`;
    let boxes: NodeListOf<HTMLInputElement> = document.forms[0].querySelectorAll(selector);
    toggle(target, boxes);
  }

  function toggle(_head: HTMLHeadElement, _boxes: NodeListOf<HTMLInputElement>): void {
    let toggle: boolean = _head.getAttribute("toggle") == "false";
    for (let box of _boxes)
      box.checked = toggle;
    _head.setAttribute("toggle", toggle.toString());

  }
}