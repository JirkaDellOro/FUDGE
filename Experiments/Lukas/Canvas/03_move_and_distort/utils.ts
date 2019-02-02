module Utils {

    export function RandomRange(min: number, max: number): number {
        return Math.floor((Math.random() * (max + min)) - min);
    }

    export function RandomColor(includeAlpha: boolean = false): string {
        let c: string = "rgba(";
        c += RandomRange(0, 255) + ",";
        c += RandomRange(0, 255) + ",";
        c += RandomRange(0, 255) + ",";
        c += includeAlpha ? RandomRange(0,255) + ")" : "1)" ;

        return c;
    }

    export class Vector2 {
		public x: number;
		public y: number;

		constructor(x: number, y: number = 0) {
			this.x = x;
			this.y = y;
		}

		equals(obj: Vector2): boolean {
			if (this.x != obj.x) return false;
			if (this.y != obj.y) return false;
			return true;
		}
	}
}