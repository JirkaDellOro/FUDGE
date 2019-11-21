namespace FudgeCore {
    /**
     * Describes the [[Audio]] class in which all Audio Data is stored.
     * Audio will be given to the [[ComponentAudio]] for further usage.
     * @authors Thomas Dorner, HFU, 2019
     */
    export class Audio {

        public url: string;

        public audioBuffer: AudioBuffer;
        private bufferSource: AudioBufferSourceNode;

        private localGain: GainNode;
        private localGainValue: number;

        private isLooping: boolean;

        /**
         * Constructor for the [[Audio]] Class
         * @param _audioContext from [[AudioSettings]]
         * @param _gainValue 0 for muted | 1 for max volume
         */
        constructor(_audioSettings: AudioSettings, _url: string, _gainValue: number, _loop: boolean) {
            this.init(_audioSettings, _url, _gainValue, _loop);
        }

        public async init(_audioSettings: AudioSettings, _url: string, _gainValue: number, _loop: boolean): Promise<void> {
            this.url = _url;
            // Get AudioBuffer
            const bufferProm: Promise<AudioBuffer> = _audioSettings.getAudioSession().urlToBuffer(_audioSettings.getAudioContext(), _url);
            while (!bufferProm) {
                console.log("Waiting for Promise..");
            }
            await bufferProm.then(val => {
                this.audioBuffer = val;
            });
            
            this.localGain = _audioSettings.getAudioContext().createGain();
            this.localGainValue = _gainValue;
            this.localGain.gain.value = this.localGainValue;
            this.createAudio(_audioSettings, this.audioBuffer);
            this.isLooping = _loop;
        }

        public initBufferSource(_audioSettings: AudioSettings): void {
            this.bufferSource = _audioSettings.getAudioContext().createBufferSource();
            this.bufferSource.buffer = this.audioBuffer;
            this.beginLoop();
        }

        public setBufferSourceNode(_bufferSourceNode: AudioBufferSourceNode): void {
            this.bufferSource = _bufferSourceNode;
        }

        public getBufferSourceNode(): AudioBufferSourceNode {
            return this.bufferSource;
        }

        public setLocalGain(_localGain: GainNode): void {
            this.localGain = _localGain;
        }

        public getLocalGain(): GainNode {
            return this.localGain;
        }

        public setLocalGainValue(_localGainValue: number): void {
            this.localGainValue = _localGainValue;
            this.localGain.gain.value = this.localGainValue;
        }

        public getLocalGainValue(): number {
            return this.localGainValue;
        }

        public setLooping(_isLooping: boolean): void {
            this.isLooping = _isLooping;
        }

        public getLooping(): boolean {
            return this.isLooping;
        }

        public setBufferSource(_buffer: AudioBuffer): void {
            this.audioBuffer = _buffer;
            this.bufferSource.buffer = _buffer;
        }

        public getBufferSource(): AudioBuffer {
            return this.audioBuffer;
        }

        /**
         * createAudio builds an [[Audio]] to use with the [[ComponentAudio]]
         * @param _audioContext from [[AudioSettings]]
         * @param _audioBuffer from [[AudioSessionData]]
         */
        private createAudio(_audioSettings: AudioSettings, _audioBuffer: AudioBuffer): AudioBuffer {
            this.audioBuffer = _audioBuffer;
            this.initBufferSource(_audioSettings);
            return this.audioBuffer;
        }

        private beginLoop(): void {
            this.bufferSource.loop = this.isLooping;
        }
    }
}