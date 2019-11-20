namespace FudgeCore {
    /**
     * Describes Global Audio Settings.
     * Is meant to be used as a Menu option.
     * @authors Thomas Dorner, HFU, 2019
     */
    export class AudioSettings {
        
        public masterGain: GainNode;
        private masterGainValue: number;

        private globalAudioContext: AudioContext;
        private audioSessionData: AudioSessionData;
        //
        /**
         * Constructor for the [[AudioSettings]] Class.
         * Main class for all Audio Classes.
         * Need to create this first, when working with sounds.
         */
        constructor() {
            this.setAudioContext(new AudioContext({ latencyHint: "interactive", sampleRate: 44100 }));
            //this.globalAudioContext.resume();
            this.masterGain = this.globalAudioContext.createGain();
            this.setMasterGainValue(1);

            this.setAudioSession(new AudioSessionData());
            this.masterGain.connect(this.globalAudioContext.destination);
        }

        public setMasterGainValue(_masterGainValue: number): void {
            this.masterGainValue = _masterGainValue;
            this.masterGain.gain.value = this.masterGainValue;
        }

        public getMasterGainValue(): number {
            return this.masterGainValue;
        }

        public getAudioContext(): AudioContext {
            return this.globalAudioContext;
        }

        public setAudioContext(_audioContext: AudioContext): void {
            this.globalAudioContext = _audioContext;
        }

        public getAudioSession(): AudioSessionData {
            return this.audioSessionData;
        }

        public setAudioSession(_audioSession: AudioSessionData): void {
            this.audioSessionData = _audioSession;
        }

        /**
         * Pauses the progression of time of the AudioContext.
         */
        public suspendAudioContext(): void {
            this.globalAudioContext.suspend();
        }

        /**
         * Resumes the progression of time of the AudioContext after pausing it.
         */
        public resumeAudioContext(): void {
            this.globalAudioContext.resume();
        }
    }
}