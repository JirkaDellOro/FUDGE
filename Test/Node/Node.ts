namespace NodeTest {
  import ƒ = FudgeCore;
  window.addEventListener("DOMContentLoaded", init);

  function init(): void {
    let branch: ƒ.Node = new ƒ.Node("branch");
    let node1: ƒ.Node = new ƒ.Node("node1");
    let node2: ƒ.Node = new ƒ.Node("node2");
    let child1: ƒ.Node = new ƒ.Node("child1");
    let child2: ƒ.Node = new ƒ.Node("child2");

    branch.addChild(node1);
    branch.addChild(node2);
    node1.addChild(child1);
    node2.addChild(child2);

    for (let node of branch.branch)
      ƒ.Debug.log(node.name);

    node1.addChild(child2);

    for (let node of branch.branch)
      ƒ.Debug.log(node.name);
  }
} 