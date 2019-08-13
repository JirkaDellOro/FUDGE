module Curves {
    import V2 = Vector.Vector2D;

    export class ControlPoint extends V2 {
        private radius: number = 5;
        private number: number; 

        constructor(_num: number, _position: V2) {
            super(_position.x, _position.y);
            this.number = _num;
        }

        /**
         * Display this object as a circle with its color and size
         */
        public display(): void {
            crc2.beginPath();
            crc2.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            crc2.fillText(this.number.toString(), this.x + this.radius, this.y - this.radius);
            crc2.stroke();
        }

        /**
       * Returns true if the coordinates given are within the size of this object
       */
        public testHit(_hit: V2): boolean {
            return this.getDistanceTo(_hit) < this.radius;
        }
    }
}