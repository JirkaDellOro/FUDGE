/// <reference types="../../../Core/Build/FudgeCore"/>
namespace AudioComponent {
  import ƒ = FudgeCore;
  window.addEventListener("click", start);
  window.addEventListener("keydown", handleKeydown);
  let cmpAudio: ƒ.ComponentAudio;
  let attached: boolean = false;
  let branched: boolean = false;

  async function start(_event: Event): Promise<void> {
    let audio: ƒ.Audio = await ƒ.Audio.load("mario_piano.mp3");
    ƒ.Debug.log(audio);

    cmpAudio = new ƒ.ComponentAudio(audio);

    cmpAudio.play(true);
    cmpAudio.activate(false);
    log();
  }

  function log(): void {
    ƒ.Debug.log(`active: ${cmpAudio.isActive}, branched: ${branched}, attached: ${attached}`);
  }

  function handleKeydown(_event: KeyboardEvent): void {
    switch (_event.code) {
      case ƒ.KEYBOARD_CODE.A:
        cmpAudio.activate(!cmpAudio.isActive);
        ƒ.Debug.log("Toggle active");
        break;
      case ƒ.KEYBOARD_CODE.B:
        if (branched)
          cmpAudio.dispatchEvent(new Event(ƒ.EVENT_AUDIO.CHILD_REMOVE));
        else
          cmpAudio.dispatchEvent(new Event(ƒ.EVENT_AUDIO.CHILD_APPEND));
        branched = !branched;
        break;
      case ƒ.KEYBOARD_CODE.C:
        if (attached)
          cmpAudio.dispatchEvent(new Event(ƒ.EVENT.COMPONENT_REMOVE));
        else
          cmpAudio.dispatchEvent(new Event(ƒ.EVENT.COMPONENT_ADD));
        attached = !attached;
        break;
    }
    log();
  }
}