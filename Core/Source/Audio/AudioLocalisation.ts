namespace FudgeCore {
    /**
     * 
     * @authors Thomas Dorner, HFU, 2019
     */
    enum PANNING_MODEL_TYPE {
        EQUALPOWER = "EQUALPOWER",
        HRFT = "HRFT"
    }

    enum DISTANCE_MODEL_TYPE {
        LINEAR = "LINEAR",
        INVERSE = "INVERSE",
        EXPONENTIAL = "EXPONENTIAL"
    }

    export class AudioLocalisation {

        public pannerNode: PannerNode;
        public panningModel: PANNING_MODEL_TYPE;
        public distanceModel: DISTANCE_MODEL_TYPE;
        public refDistance: number;
        public maxDistance: number;
        public rolloffFactor: number;
        public connerInnerAngle: number;
        public coneOuterAngle: number;
        public coneOuterGain: number;
        public position: Vector3;
        public orientation: Vector3;
        
        /**
         * Constructor for the [[AudioLocalisation]] Class
         * @param _audioContext from [[AudioSettings]]
         */
        constructor(_audioContext: AudioContext) {
           this.pannerNode = _audioContext.createPanner();
        }

         /**
         * We will call setPannerPosition whenever there is a need to change Positions.
         * All the position values should be identical to the current Position this is atteched to.
         */
        // public setPannePosition(_position: Vector3): void {
        //     this.pannerNode.positionX.value = _position.x;
        //     this.pannerNode.positionY.value = _position.y;
        //     this.pannerNode.positionZ.value = _position.z;

        //     this.position = _position;
        // }

        /**
         * getPannerPosition
         */
        public getPannerPosition(): Vector3 {
            return this.position;
        }

        /**
         * setPanneOrientation
         */
        // public setPannerOrientation(_orientation: Vector3): void {
        //     this.pannerNode.orientationX.value = _orientation.x;
        //     this.pannerNode.orientationY.value = _orientation.y;
        //     this.pannerNode.orientationZ.value = _orientation.z;

        //     this.orientation = _orientation;
        // }

        /**
         * getPanneOrientation
         */
        public getPanneOrientation(): Vector3 {
            return this.orientation;
        }

    }
}