namespace ListControl {
  // import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;


  let controller: ListControlData = new ListControlData();
  let table: ƒui.Table<ƒ.Mutable> = new ƒui.Table<ƒ.Mutable>(controller, data);


  document.body.appendChild(table);
}