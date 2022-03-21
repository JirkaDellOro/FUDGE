// namespace FudgeCore {
    
//     /**
//      * Enumerator for all possible Oscillator Types
//      */
//     type OSCILLATOR_TYPE = "sine" | "square" | "sawtooth" | "triangle" | "custom";

//     /**
//      * Interface to create Custom Oscillator Types.
//      * Start-/Endpoint of a custum curve e.g. sine curve.
//      * Both parameters need to be inbetween -1 and 1.
//      * @param startpoint startpoint of a curve 
//      * @param endpoint Endpoint of a curve 
//      */
//     interface OscillatorWave {
//         startpoint: number;
//         endpoint: number;
//     }
//     /**
//      * Add an {@link AudioFilter} to an {@link Audio]]
//      * @authors Thomas Dorner, HFU, 2019
//      */
//     export class AudioOscillator {

//         public audioOscillator: OscillatorNode; 

//         private frequency: number;
//         private oscillatorType: OSCILLATOR_TYPE;
//         private oscillatorWave: PeriodicWave;

//         private localGain: GainNode;
//         private localGainValue: number;

//         constructor(_audioSettings: AudioSettings, _oscillatorType?: OSCILLATOR_TYPE) {
//             this.audioOscillator = _audioSettings.getAudioContext().createOscillator();
//             this.localGain = _audioSettings.getAudioContext().createGain();
//             this.oscillatorType = _oscillatorType;
//             if (this.oscillatorType != "custom") {
//                 this.audioOscillator.type = this.oscillatorType;
//             }
//             else {
//                 if (!this.oscillatorWave) {
//                     this.audioOscillator.setPeriodicWave(this.oscillatorWave);
//                 }
//                 else {
//                     console.log("Create a Custom Periodic Wave first to use Custom Type");
//                 }
//             }
//         }

//         public setOscillatorType(_oscillatorType: OSCILLATOR_TYPE): void {
//             if (this.oscillatorType != "custom") {
//                 this.audioOscillator.type = this.oscillatorType;
//             }
//             else {
//                 if (!this.oscillatorWave) {
//                     this.audioOscillator.setPeriodicWave(this.oscillatorWave);
//                 }
//             }
//         }

//         public getOscillatorType(): OSCILLATOR_TYPE {
//             return this.oscillatorType;
//         }

//         public createPeriodicWave(_audioSettings: AudioSettings, _real: OscillatorWave, _imag: OscillatorWave): void {
//             let waveReal: Float32Array = new Float32Array(2);
//             waveReal[0] = _real.startpoint;
//             waveReal[1] = _real.endpoint;

//             let waveImag: Float32Array = new Float32Array(2);
//             waveImag[0] = _imag.startpoint;
//             waveImag[1] = _imag.endpoint;

//             this.oscillatorWave = _audioSettings.getAudioContext().createPeriodicWave(waveReal, waveImag);
//         }

//         public setLocalGain(_localGain: GainNode): void {
//             this.localGain = _localGain;
//         }

//         public getLocalGain(): GainNode {
//             return this.localGain;
//         }

//         public setLocalGainValue(_localGainValue: number): void {
//             this.localGainValue = _localGainValue;
//             this.localGain.gain.value = this.localGainValue;
//         }

//         public getLocalGainValue(): number {
//             return this.localGainValue;
//         }

//         public setFrequency(_audioSettings: AudioSettings, _frequency: number): void {
//             this.frequency = _frequency;
//             this.audioOscillator.frequency.setValueAtTime(this.frequency, _audioSettings.getAudioContext().currentTime);
//         }

//         public getFrequency(): number {
//             return this.frequency;
//         }

//         public createSnare(_audioSettings: AudioSettings): void {
//             this.setOscillatorType("triangle");
//             this.setFrequency(_audioSettings, 100);
//             this.setLocalGainValue(0);
//             this.localGain.gain.setValueAtTime(0, _audioSettings.getAudioContext().currentTime);
//             this.localGain.gain.exponentialRampToValueAtTime(0.01, _audioSettings.getAudioContext().currentTime + .1);

//             this.audioOscillator.connect(this.localGain);
//         }
//     }
// }