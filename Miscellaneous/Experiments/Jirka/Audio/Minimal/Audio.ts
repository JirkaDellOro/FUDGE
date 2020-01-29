window.addEventListener("click", startAudio);
let starts: number = 0;
let audioContext: AudioContext = new AudioContext();
let audioContextData: AudioContext = new AudioContext();


async function startAudio(): Promise<void> {
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

  let source: AudioBufferSourceNode = audioContext.createBufferSource();
  let url: string = "mario_piano.mp3";

  const response: Response = await window.fetch(url);
  const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
  const decodedAudio: AudioBuffer = await audioContextData.decodeAudioData(arrayBuffer);
  // let c: AudioBuffer = new AudioBuffer({})
  source.buffer = decodedAudio;
  console.log(source);
  audioContextData.close();
  audioContextData = null;
  console.log(decodedAudio);

  // Connect the audio to source (multiple audio buffers can be connected!)
  // source.connect(audioContext.destination);

  let panner: PannerNode = audioContext.createPanner();
  panner.setPosition(1 - 2 * starts, 0, 0);
  // console.log(panner);

  audioContext.listener.setPosition(1, 0, 0);
  console.log(audioContext.listener);

  setTimeout((): void => { panner.disconnect(); source.disconnect(); }, 2500);

  source.connect(panner);
  panner.connect(audioContext.destination);

  source.loop = true;
  source.start(0);
  starts++;

  console.log(audioContext);
}