namespace ListControl {
  // import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  let list: List = new List("Vectors", data);
  document.body.appendChild(list);
  ƒUi.Controller.updateUserInterface(list.mutable, list);
}