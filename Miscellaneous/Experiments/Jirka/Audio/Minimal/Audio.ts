window.addEventListener("click", startAudio);
let starts: number = 0;

async function startAudio(): Promise<void> {
  let audioContext: AudioContext = new window.AudioContext();
  console.log("Play");
  let source: AudioBufferSourceNode = audioContext.createBufferSource();
  let url: string = "mario_piano.mp3";

  const response: Response = await window.fetch(url);
  const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
  const decodedAudio: AudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  source.buffer = decodedAudio;
  console.log(source);

  // Connect the audio to source (multiple audio buffers can be connected!)
  // source.connect(audioContext.destination);

  let panner: PannerNode = audioContext.createPanner();
  console.log(panner);

  audioContext.listener.setPosition(1 - 2 * starts, 0, 0);
  console.log(audioContext.listener);


  source.connect(panner);
  panner.connect(audioContext.destination);

  source.loop = true;
  source.start(0);
  starts++;
}