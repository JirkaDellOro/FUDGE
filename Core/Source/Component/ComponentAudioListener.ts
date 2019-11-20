namespace FudgeCore {
    /**
     * Attaches an [[AudioListener]] to the node
     * @authors Thomas Dorner, HFU, 2019
     */
    export class ComponentAudioListener extends Component {

        private audioListener: AudioListener;
        private positionBase: Vector3;
        private positionUP: Vector3;
        private positionFW: Vector3;

        /**
         * Constructor of the AudioListener class
         * @param _audioContext Audio Context from AudioSessionData
         */
        constructor(_audioSettings: AudioSettings) {
            super();
            this.audioListener = _audioSettings.getAudioContext().listener;
        }

        public setAudioListener(_audioSettings: AudioSettings): void {
            this.audioListener = _audioSettings.getAudioContext().listener;
        }

        public getAudioListener(): AudioListener {
            return this.audioListener;
        }

        /**
         * We will call setAudioListenerPosition whenever there is a need to change Positions.
         * All the position values should be identical to the current Position this is attached to.
         *       
         *     __|___
         *    |  |  |
         *    |  °--|--
         *    |/____|
         *   /
         * 
         */
        public setListenerPosition(_position: Vector3): void {
            this.positionBase = _position;

            this.audioListener.positionX.value = this.positionBase.x;
            this.audioListener.positionY.value = -this.positionBase.z;
            this.audioListener.positionZ.value = this.positionBase.y;

            console.log("Set Listener Position: X: " + this.audioListener.positionX.value + " | Y: " + this.audioListener.positionY.value + " | Z: " + this.audioListener.positionZ.value);
        }

        public getListenerPosition(): Vector3 {
            return this.positionBase;
        }

        /**
         * FUDGE SYSTEM
         * 
         *      UP (Y)
         *       ^
         *     __|___
         *    |  |  |
         *    |  O--|--> FORWARD (Z)
         *    |_____|
         */
        public setListenerPositionForward(_position: Vector3): void {
            this.positionFW = _position;
            //Set forward looking position of the AudioListener
            this.audioListener.forwardX.value = this.positionFW.x;
            this.audioListener.forwardY.value = -this.positionFW.z + 1;
            this.audioListener.forwardZ.value = this.positionFW.y;
        }

        public getListenerPositionForward(): Vector3 {
            return this.positionFW;
        }

        /**
         *      UP (Z)
         *       ^
         *     __|___
         *    |  |  |
         *    |  O--|--> FORWARD (X)
         *    |_____|
         */
        public setListenerPostitionUp(_position: Vector3): void {
            this.positionUP = _position;
            //Set upward looking position of the AudioListener
            this.audioListener.upX.value = this.positionUP.x;
            this.audioListener.upY.value = -this.positionUP.z;
            this.audioListener.upZ.value = this.positionUP.y + 1;
        }

        public getListenerPositionUp(): Vector3 {
            return this.positionUP;
        }

        /**
         * Set all positional Values based on a single Position
         * @param _position position of the Object
         */
        public updatePositions(_position: Vector3/*, _positionForward: Vector3, _positionUp: Vector3*/): void {
            this.setListenerPosition(_position);
            this.setListenerPositionForward(_position);
            this.setListenerPostitionUp(_position);
        }

        /**
         * Show all Settings inside of [[ComponentAudioListener]].
         * Method only for Debugging Purposes.
         */
        public showListenerSettings(): void {
            console.log("------------------------------");
            console.log("Show all Settings of Listener");
            console.log("------------------------------");
            console.log("Listener Position Base: X: " + this.audioListener.positionX.value + " | Y: " + this.audioListener.positionY.value + " | Z: " + this.audioListener.positionZ.value);
            console.log("Listener Position Up: X: " + this.audioListener.upX.value + " | Y: " + this.audioListener.upY.value + " | Z: " + this.audioListener.upZ.value);
            console.log("Listener Position Forward: X: " + this.audioListener.forwardX.value + " | Y: " + this.audioListener.forwardY.value + " | Z: " + this.audioListener.forwardZ.value);
            console.log("------------------------------");
        }

        //#region Transfer
        public serialize(): Serialization {
            let serialization: Serialization = {
                audioListener: this.audioListener,
                posBase: this.positionBase,
                posFW: this.positionFW,
                posUP: this.positionUP
            };
            return serialization;
        }
       
        public deserialize(_serialization: Serialization): Serializable {
            this.audioListener = _serialization.audioListener;
            this.positionBase = _serialization.posBase;
            this.positionFW = _serialization.posFW;
            this.positionUP = _serialization.posUP;

            return this;
        }

        protected reduceMutator(_mutator: Mutator): void {
            delete this.audioListener;
            delete this.positionBase;
            delete this.positionFW;
            delete this.positionUP;
        }
        //#endregion
    }
}
