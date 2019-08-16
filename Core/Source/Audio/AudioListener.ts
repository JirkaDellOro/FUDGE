namespace FudgeCore {
    /**
     * Describes a [[AudioListener]] attached to a [[Node]]
     * @authors Thomas Dorner, HFU, 2019
     */
    export class AudioListener {
        public audioListener: AudioListener;

        private position: Vector3;
        private orientation: Vector3;

        //##TODO AudioListener
        constructor(_audioContext: AudioContext) {
            //this.audioListener = _audioContext.listener;
            
        }

        /**
         * We will call setAudioListenerPosition whenever there is a need to change Positions.
         * All the position values should be identical to the current Position this is atteched to.
         */
        // public setAudioListenerPosition(_position: Vector3): void {
        //     this.audioListener.positionX.value = _position.x;
        //     this.audioListener.positionY.value = _position.y;
        //     this.audioListener.positionZ.value = _position.z;

        //     this.position = _position;
        // }

        /**
         * getAudioListenerPosition
         */
        public getAudioListenerPosition(): Vector3 {
            return this.position;
        }

        /**
         * setAudioListenerOrientation
         */
        // public setAudioListenerOrientation(_orientation: Vector3): void {
        //     this.audioListener.orientationX.value = _orientation.x;
        //     this.audioListener.orientationY.value = _orientation.y;
        //     this.audioListener.orientationZ.value = _orientation.z;

        //     this.orientation = _orientation;
        // }

        /**
         * getAudioListenerOrientation
         */
        public getAudioListenerOrientation(): Vector3 {
            return this.orientation;
        }

        /**
         * Use Position from Parent Node to update own Position accordingly
         */
        // private getParentNodePosition() {
            
        // }
    }
}