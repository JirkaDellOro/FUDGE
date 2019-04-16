namespace Maps {
    window.addEventListener("load", init);
    interface Rectangle {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    function init(): void {
        let map: Map<Rectangle, String> = new Map();
        let r1: Rectangle = { x: 0, y: 0, width: 0, height: 0 };
        let r2: Rectangle = { x: 1, y: 0, width: 0, height: 0 };

        map.set(r1, "Rect 1");
        map.set(r2, "Rect 2");

        console.log(map.get(r1));
        console.log(map.get(r2));
    }
}