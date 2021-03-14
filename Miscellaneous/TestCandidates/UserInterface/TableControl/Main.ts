namespace TableControl {
  // import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;


  let controller: TableControlData = new TableControlData();
  let table: ƒui.Table<DATA> = new ƒui.Table<DATA>(controller, Object.values(assoc));


  document.body.appendChild(table);
}