/// <reference types="../../../Core/Build/FudgeCore"/>
namespace AudioSounds {
  import ƒ = FudgeCore;
  window.addEventListener("load", start);
  window.addEventListener("keydown", handleKeydown);
  let cmpAudio: ƒ.ComponentAudio;
  let distortion: WaveShaperNode = ƒ.AudioManager.default.createWaveShaper();

  async function start(_event: Event): Promise<void> {
    let audioBeep: ƒ.Audio = await ƒ.Audio.load("Sound/Beep.mp3");
    cmpAudio = new ƒ.ComponentAudio(audioBeep, false, false);
    cmpAudio.connect(true);
    cmpAudio.volume = 30;

    function makeDistortionCurve(amount: number = 50): Float32Array {
      let samples: number = 44100;
      let curve: Float32Array = new Float32Array(samples);
      let deg: number = Math.PI / 180;
      let x: number;
      for (let i: number = 0; i < samples; ++i) {
        x = i * 2 / samples - 1;
        curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
      }
      return curve;
    }

    distortion.curve = makeDistortionCurve(400);
    distortion.oversample = "4x";
  }

  function handleKeydown(_event: KeyboardEvent): void {
    switch (_event.code) {
      case ƒ.KEYBOARD_CODE.ENTER:
        ƒ.Debug.log("Play");
        cmpAudio.play(true);
        break;
      case ƒ.KEYBOARD_CODE.ARROW_UP:
        ƒ.Debug.log("Insert")
        cmpAudio.insertAudioNodes(distortion, distortion);
        break;
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          ƒ.Debug.log("Remove")
        cmpAudio.insertAudioNodes(null, null);
        break;
    }
  }
}