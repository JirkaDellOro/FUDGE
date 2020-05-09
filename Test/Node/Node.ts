namespace NodeTest {
  import ƒ = FudgeCore;
  window.addEventListener("DOMContentLoaded", init);

  function init(): void {
    let graph: ƒ.Node = new ƒ.Node("graph");
    let node1: ƒ.Node = new ƒ.Node("node1");
    let node2: ƒ.Node = new ƒ.Node("node2");
    let child1: ƒ.Node = new ƒ.Node("child1");
    let child2: ƒ.Node = new ƒ.Node("child2");

    graph.addChild(node1);
    graph.addChild(node2);
    node1.addChild(child1);
    node2.addChild(child2);

    for (let node of graph.graph)
      ƒ.Debug.log(node.name);

    node1.addChild(child2);

    for (let node of graph.graph)
      ƒ.Debug.log(node.name);
  }
} 