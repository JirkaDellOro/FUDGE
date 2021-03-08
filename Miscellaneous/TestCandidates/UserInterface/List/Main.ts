namespace ListControl {
  // import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  let list: ƒUi.DetailsArray = new ƒUi.DetailsArray("Vectors", data);
  document.body.appendChild(list);
  ƒUi.Controller.updateUserInterface(list.mutable, list);
}