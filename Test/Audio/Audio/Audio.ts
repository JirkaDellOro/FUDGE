/// <reference types="../../../Core/Build/FudgeCore"/>
namespace AudioTest {
  import ƒ = FudgeCore;
  window.addEventListener("click", start);

  async function start(): Promise<void> {
    let audio: ƒ.Audio = await ƒ.Audio.load("mario_piano.mp3");
    ƒ.Debug.log(audio);

    let cmpAudio: ƒ.ComponentAudio = new ƒ.ComponentAudio(audio);
    ƒ.Debug.log(cmpAudio);

    cmpAudio.play(true);
  }
}