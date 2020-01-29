"use strict";
window.addEventListener("click", startAudio);
let starts = 0;
let audioContext = new AudioContext();
let audioContextData = new AudioContext();
async function startAudio() {
    // var contexts: AudioContext[] = [];
    // try {
    //   for (let i: number = 0; i < 48; i++) {
    //     let context: AudioContext = new AudioContext();
    //     contexts.push(context);
    //     context.createAnalyser();
    //     console.log(i);
    //   }
    // } catch (e) {
    //   console.log(e);
    // }
    // console.log(contexts);
    let source = audioContext.createBufferSource();
    let url = "mario_piano.mp3";
    const response = await window.fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const decodedAudio = await audioContextData.decodeAudioData(arrayBuffer);
    // let c: AudioBuffer = new AudioBuffer({})
    source.buffer = decodedAudio;
    console.log(source);
    audioContextData.close();
    audioContextData = null;
    console.log(decodedAudio);
    // Connect the audio to source (multiple audio buffers can be connected!)
    // source.connect(audioContext.destination);
    let panner = audioContext.createPanner();
    panner.setPosition(1 - 2 * starts, 0, 0);
    // console.log(panner);
    audioContext.listener.setPosition(1, 0, 0);
    console.log(audioContext.listener);
    setTimeout(() => { panner.disconnect(); source.disconnect(); }, 2500);
    source.connect(panner);
    panner.connect(audioContext.destination);
    source.loop = true;
    source.start(0);
    starts++;
    console.log(audioContext);
}
//# sourceMappingURL=Audio.js.map