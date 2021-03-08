namespace ListControl {
  // import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  let list: ƒUi.List = new ƒUi.List("Vectors", data);
  document.body.appendChild(list);
  ƒUi.Controller.updateUserInterface(list.mutable, list);
}