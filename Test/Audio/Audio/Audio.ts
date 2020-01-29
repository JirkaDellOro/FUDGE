/// <reference types="../../../Core/Build/FudgeCore"/>
namespace AudioTest {
  import ƒ = FudgeCore;
  window.addEventListener("click", start);
  window.addEventListener("keydown", toggle)
  let cmpAudio: ƒ.ComponentAudio;
  let toggled: boolean = false;

  async function start(_event: Event): Promise<void> {
    let audio: ƒ.Audio = await ƒ.Audio.load("mario_piano.mp3");
    ƒ.Debug.log(audio);

    cmpAudio = new ƒ.ComponentAudio(audio);
    ƒ.Debug.log(cmpAudio);

    cmpAudio.play(true);
  }

  function toggle(_event: Event): void {
    ƒ.Debug.log("Toggle");
    if (toggled)
      cmpAudio.dispatchEvent(new Event(ƒ.EVENT.COMPONENT_REMOVE));
    else
      cmpAudio.dispatchEvent(new Event(ƒ.EVENT.COMPONENT_ADD));
  }
}