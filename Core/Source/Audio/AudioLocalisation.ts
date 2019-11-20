namespace FudgeCore {
    
    /**
     * Panning Model Type for 3D localisation of a [[ComponentAudio]].
     * @param HRFT Usually used for 3D world space, this will be the default setting
     */
    type PANNING_MODEL_TYPE = "equalpower" | "HRTF";

    /**
     * Distance Model Type for 3D localisation of a [[ComponentAudio]].
     * @param inverse Usually used for volume drop of sound in 3D world space
     */
    type DISTANCE_MODEL_TYPE = "linear" | "inverse" | "exponential";

    /**
     * [[AudioLocalisation]] describes the Audio Panner used in [[ComponentAudio]], 
     * which contains data for Position, Orientation and other data needed to localize the Audio in a 3D space.
     * @authors Thomas Dorner, HFU, 2019
     */
    export class AudioLocalisation {

        public pannerNode: PannerNode;

        private panningModel: PANNING_MODEL_TYPE;
        private distanceModel: DISTANCE_MODEL_TYPE;

        private refDistance: number;
        private maxDistance: number;
        private rolloffFactor: number;
        private coneInnerAngle: number;
        private coneOuterAngle: number;
        private coneOuterGain: number;

        private position: Vector3;
        private orientation: Vector3;
        
        /**
         * Constructor for the [[AudioLocalisation]] Class
         * @param _audioContext from [[AudioSettings]]
         */
        constructor(_audioSettings: AudioSettings) {
           this.pannerNode = _audioSettings.getAudioContext().createPanner();
           this.initDefaultValues();
        }

        public updatePositions(_position: Vector3, _orientation: Vector3): void {
            this.setPannerPosition(_position);
            this.setPannerOrientation(_orientation);
        }
         /**
         * We will call setPannerPosition whenever there is a need to change Positions.
         * All the position values should be identical to the current Position this is attached to.
         *
         *      |     
         *      o---
         *    /  __
         *      |_| Position
         * 
         */
        public setPannerPosition(_position: Vector3): void {
            this.position = _position;

            this.pannerNode.positionX.value = -this.position.x;
            this.pannerNode.positionY.value = -this.position.z;
            this.pannerNode.positionZ.value = this.position.y;
        }

        public getPannerPosition(): Vector3 {
            return this.position;
        }

        /**
         * Set Position for orientation target
         * 
         *      |     
         *      o---
         *    /  __
         *      |_|
         *        \
         *       Target
         */
        public setPannerOrientation(_orientation: Vector3): void {
            this.orientation = _orientation;

            this.pannerNode.orientationX.value = this.orientation.x;
            this.pannerNode.orientationY.value = -this.orientation.z;
            this.pannerNode.orientationZ.value = this.orientation.y;
        }

        public getPannerOrientation(): Vector3 {
            return this.orientation;
        }

        public setDistanceModel(_distanceModelType: DISTANCE_MODEL_TYPE): void {
            this.distanceModel = _distanceModelType;
            this.pannerNode.distanceModel = this.distanceModel;
        }

        public getDistanceModel(): DISTANCE_MODEL_TYPE {
            return this.distanceModel;
        }

        public setPanningModel(_panningModelType: PANNING_MODEL_TYPE): void {
            this.panningModel = _panningModelType;
            this.pannerNode.panningModel = this.panningModel;
        }

        public getPanningModel(): PANNING_MODEL_TYPE {
            return this.panningModel;
        }

        public setRefDistance(_refDistance: number): void {
            this.refDistance = _refDistance;
            this.pannerNode.refDistance = this.refDistance;
        }

        public getRefDistance(): number {
            return this.refDistance;
        }

        public setMaxDistance(_maxDistance: number): void {
            this.maxDistance = _maxDistance;
            this.pannerNode.maxDistance = this.maxDistance;
        }

        public getMaxDistance(): number {
            return this.maxDistance;
        }

        public setRolloffFactor(_rolloffFactor: number): void {
            this.rolloffFactor = _rolloffFactor;
            this.pannerNode.rolloffFactor = this.rolloffFactor;
        }

        public getRolloffFactor(): number {
            return this.rolloffFactor;
        }

        public setConeInnerAngle(_coneInnerAngle: number): void {
            this.coneInnerAngle = _coneInnerAngle;
            this.pannerNode.coneInnerAngle = this.coneInnerAngle;
        }

        public getConeInnerAngle(): number {
            return this.coneInnerAngle;
        }

        public setConeOuterAngle(_coneOuterAngle: number): void {
            this.coneOuterAngle = _coneOuterAngle;
            this.pannerNode.coneOuterAngle = this.coneOuterAngle;
        }

        public getConeOuterAngle(): number {
            return this.coneOuterAngle;
        }

        public setConeOuterGain(_coneOuterGain: number): void {
            this.coneOuterGain = _coneOuterGain;
            this.pannerNode.coneOuterGain = this.coneOuterGain;
        }

        public getConeOuterGain(): number {
            return this.coneOuterGain;
        }

        /**
         * Show all Settings inside of [[AudioLocalisation]].
         * Use for Debugging purposes.
         */
        public showLocalisationSettings(): void {
            console.log("------------------------------");
            console.log("Show all Settings of Panner");
            console.log("------------------------------");
            console.log("Panner Position: X: " + this.pannerNode.positionX.value + " | Y: " + this.pannerNode.positionY.value + " | Z: " + this.pannerNode.positionZ.value);
            console.log("Panner Orientation: X: " + this.pannerNode.orientationX.value + " | Y: " + this.pannerNode.orientationY.value + " | Z: " + this.pannerNode.orientationZ.value);
            console.log("Distance Model Type: " + this.distanceModel);
            console.log("Panner Model Type: " + this.panningModel);
            console.log("Ref Distance: " + this.refDistance);
            console.log("Max Distance: " + this.maxDistance);
            console.log("Rolloff Factor: " + this.rolloffFactor);
            console.log("Cone Inner Angle: " + this.coneInnerAngle);
            console.log("Cone Outer Angle: " + this.coneOuterAngle);
            console.log("Cone Outer Gain: " + this.coneOuterGain);
            console.log("------------------------------");
        }

        private initDefaultValues(): void {
            this.setPanningModel("HRTF");
            this.setDistanceModel("inverse");
            this.setConeInnerAngle(90);
            this.setConeOuterAngle(270);
            this.setConeOuterGain(0);
            this.setRefDistance(1);
            this.setMaxDistance(5);
            this.setRolloffFactor(1);

            this.showLocalisationSettings();
        }
    }
}