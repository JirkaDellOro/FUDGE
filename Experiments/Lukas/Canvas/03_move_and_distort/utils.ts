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
}