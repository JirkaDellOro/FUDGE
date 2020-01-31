/// <reference types="../../../Core/Build/FudgeCore"/>
namespace AudioBranch {
  import ƒ = FudgeCore;
  window.addEventListener("click", start);
  window.addEventListener("keydown", handleKeydown);
  let nodes: ƒ.Node[] = [];
  let nodeControlled: ƒ.Node;


  async function start(_event: Event): Promise<void> {
    let audioMario: ƒ.Audio = await ƒ.Audio.load("Sound/mario_piano.mp3");
    let audioTrancy: ƒ.Audio = await ƒ.Audio.load("Sound/trancyvania.mp3");
    let audioHypno: ƒ.Audio = await ƒ.Audio.load("Sound/hypnotic.mp3");

    // cmpAudio = new ƒ.ComponentAudio(audio);

    // cmpAudio.play(true);
    // cmpAudio.activate(false);
    // log();
    for (let i: number = 0; i < 10; i++)
      nodes.push(new ƒ.Node("Node" + i));

    nodes[0].addComponent(new ƒ.ComponentAudio(audioHypno, true, true));
    nodes[1].addComponent(new ƒ.ComponentAudio(audioTrancy, true, true));
    nodes[2].addComponent(new ƒ.ComponentAudio(audioMario, true, true));
    nodeControlled = nodes[0];

    ƒ.AudioManager.default.listenTo(nodes[0]);
    log();
  }

  function log(): void {
    ƒ.Debug.group(`Listening to ${ƒ.AudioManager.default.getBranchListeningTo().name}, controlling ${nodeControlled.name}`);
    for (let node of nodes) {
      let out: string = `node: ${node.name}`;
      if (node.getParent())
        out += ` [->${node.getParent().name}]`;
      let cmpAudio: ƒ.ComponentAudio = node.getComponent(ƒ.ComponentAudio);
      if (cmpAudio)
        out += `, active: ${cmpAudio.isActive}, branched: ${cmpAudio.isListened}, attached: ${cmpAudio.isAttached}`;

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
        if (cmpAudio)
          cmpAudio.activate(!cmpAudio.isActive);
        break;
      case ƒ.KEYBOARD_CODE.P:
        let parent: number = parseInt(prompt("Enter the number of the node that will become the parent", "0"));
        if (parent < 0 || parent > 9)
          throw (new Error("Index out of bounds"))
        nodes[parent].appendChild(nodeControlled);
        break;
      case ƒ.KEYBOARD_CODE.C:
        if (!cmpAudio)
          throw(new Error("No ComponentAudio attached"));
        let container: number = parseInt(prompt("Enter the number of the node the component attaches to", "0"));
        if (container < 0 || container > 9)
          throw (new Error("Index out of bounds"))
        nodes[container].addComponent(cmpAudio);
        // nodeControlled.removeComponent(cmpAudio);
        break;
      case ƒ.KEYBOARD_CODE.L:
        ƒ.AudioManager.default.listenTo(nodeControlled);
        break;
    }
    log();
  }
}