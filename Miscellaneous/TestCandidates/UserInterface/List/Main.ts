namespace ListControl {
  // import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  let list: ExpendableList = new ExpendableList("Vectors", data);
  document.body.appendChild(list);
  ƒUi.Controller.updateUserInterface(list.mutable, list);

  let details: HTMLDetailsElement = document.createElement("details");
  document.body.appendChild(details);
  details.innerHTML="<ol><li>this</li><li>is a</li><li>list</li></ol><summary>ABC</summary><h1>Test</h1>";
  details.open = true;
}