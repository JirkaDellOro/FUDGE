"use strict";
window.addEventListener("click", startAudio);
let starts = 0;
async function startAudio() {
    let audioContext = new window.AudioContext();
    console.log("Play");
    let source = audioContext.createBufferSource();
    let url = "mario_piano.mp3";
    const response = await window.fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);
    source.buffer = decodedAudio;
    console.log(source);
    // Connect the audio to source (multiple audio buffers can be connected!)
    // source.connect(audioContext.destination);
    let panner = audioContext.createPanner();
    console.log(panner);
    audioContext.listener.setPosition(1 - 2 * starts, 0, 0);
    console.log(audioContext.listener);
    source.connect(panner);
    panner.connect(audioContext.destination);
    source.loop = true;
    source.start(0);
    starts++;
}
//# sourceMappingURL=Audio.js.map