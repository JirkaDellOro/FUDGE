/// <reference types="../../../Core/Build/FudgeCore"/>
namespace AudioGraph {
  import ƒ = FudgeCore;
  window.addEventListener("click", start);
  let nodes: ƒ.Node[] = [];
  let nodeControlled: ƒ.Node;


  async function start(_event: Event): Promise<void> {
    window.removeEventListener("click", start);
    window.addEventListener("keydown", handleKeydown);
    let audioMario: ƒ.Audio = new ƒ.Audio("Sound/mario_piano.mp3");
    let audioTrancy: ƒ.Audio = new ƒ.Audio("Sound/trancyvania.mp3");
    let audioHypno: ƒ.Audio = new ƒ.Audio("Sound/hypnotic.mp3");
    // await audioHypno.asyncLoad("Sound/hypnotic.mp3");


    for (let i: number = 0; i < 10; i++)
      nodes.push(new ƒ.Node("Node" + i));

    let cmpAudio: ƒ.ComponentAudio = new ƒ.ComponentAudio(audioHypno, true, true);
    cmpAudio.mtxPivot.translateX(2);
    nodes[0].addComponent(cmpAudio);
    
    cmpAudio = new ƒ.ComponentAudio(audioTrancy, true, true);
    cmpAudio.mtxPivot.translateX(-2);
    nodes[1].addComponent(cmpAudio);
    
    cmpAudio = new ƒ.ComponentAudio(audioMario, true, true);
    cmpAudio.mtxPivot.translateX(0);
    nodes[2].addComponent(cmpAudio);

    nodeControlled = nodes[0];

    ƒ.AudioManager.default.listenTo(nodes[0]);
    log();
  }

  function log(): void {
    ƒ.Debug.group(`Listening to ${ƒ.AudioManager.default.getGraphListeningTo().name}, controlling ${nodeControlled.name}`);
    for (let node of nodes) {
      let out: string = `node: ${node.name}`;
      if (node.getParent())
        out += ` [child of ${node.getParent().name}]`;
      let cmpAudioList: ƒ.ComponentAudio[] = node.getComponents(ƒ.ComponentAudio);
      for (let cmpAudio of cmpAudioList)
        out += ` | ComponentAudio is active: ${cmpAudio.isActive}, listened: ${cmpAudio.isListened}, attached: ${cmpAudio.isAttached}`;

      ƒ.Debug.log(out);
    }
    ƒ.Debug.groupEnd();
  }

  function handleKeydown(_event: KeyboardEvent): void {
    let cmpAudio: ƒ.ComponentAudio = nodeControlled.getComponent(ƒ.ComponentAudio);
    if (_event.code >= ƒ.KEYBOARD_CODE.ZERO && _event.code <= ƒ.KEYBOARD_CODE.NINE)
      nodeControlled = nodes[_event.keyCode - 48];
    switch (_event.code) {
      case ƒ.KEYBOARD_CODE.A:
        if (cmpAudio) {
          cmpAudio.activate(!cmpAudio.isActive);
          // cmpAudio.play(cmpAudio.isActive);
        }
        break;
      case ƒ.KEYBOARD_CODE.P:
        let parent: number = parseInt(prompt("Enter the number of the node that will become the parent", "0"));
        if (parent < 0 || parent > 9)
          throw (new Error("Index out of bounds"));
        nodes[parent].addChild(nodeControlled);
        break;
      case ƒ.KEYBOARD_CODE.C:
        if (!cmpAudio)
          throw (new Error("No ComponentAudio attached"));
        let container: number = parseInt(prompt("Enter the number of the node the component attaches to", "0"));
        if (container < 0 || container > 9)
          throw (new Error("Index out of bounds"));
        nodes[container].addComponent(cmpAudio);
        break;
      case ƒ.KEYBOARD_CODE.L:
        ƒ.AudioManager.default.listenTo(nodeControlled);
        break;
      case ƒ.KEYBOARD_CODE.U:
        ƒ.AudioManager.default.update();
        break;
    }
    log();
  }
}