namespace Canvas3D {
    window.addEventListener("load", init);
    interface Rectangle {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    class WebGL {
        public content: number[] = [0, 0, 0, 1];
        private crc3: WebGL2RenderingContext = null;
        private canvas: HTMLCanvasElement = null;
        private readonly rect: Rectangle = null;

        constructor(/* size ? */) {
            this.canvas = document.createElement("canvas");
            console.log(this.canvas.width, this.canvas.height);
            this.getContextFromCanvas(this.canvas);
            this.rect = { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height };
            console.log(this.crc3.canvas.width, this.crc3.canvas.height);
        }

        public getContextFromCanvas(canvas: HTMLCanvasElement /*| OffscreenCanvas*/): WebGLRenderingContext {
            this.crc3 = canvas.getContext("webgl2");
            return this.crc3;
        }

        public getRect(): Rectangle {
            return this.rect;
        }

        public render(/* size */): void {
            this.crc3.clearColor(this.content[0], this.content[1], this.content[2], this.content[3]);
            this.crc3.clear(this.crc3.COLOR_BUFFER_BIT);
        }

        public copyToCanvas(_crc2: CanvasRenderingContext2D, _rectSource: Rectangle, _rectDestination: Rectangle): void {
            _crc2.drawImage(
                this.canvas,
                _rectSource.x, _rectSource.y, _rectSource.width, _rectSource.height,
                _rectDestination.x, _rectDestination.y, _rectDestination.width, _rectDestination.height);
        }

        public defineContent(_r: number, _g: number, _b: number, _a: number): void {
            this.content = [_r, _g, _b, _a];
        }
    }

    function init(_event: Event): void {
        let webGL: WebGL = new WebGL();

        let crc3: CanvasRenderingContext2D[] = [];
        for (let i: number = 0; i < 4; i++) {
            let canvas: HTMLCanvasElement = document.createElement("canvas");
            canvas.width = 400;
            canvas.height = 200;
            let c: CanvasRenderingContext2D = canvas.getContext("2d");
            document.body.appendChild(canvas);
            crc3.push(c);
        }

        for (let i: number = 0; i < 4; i++) {
            let c: CanvasRenderingContext2D = crc3[i];
            let rect: Rectangle = { x: 0, y: 0, width: c.canvas.width, height: c.canvas.height };
            rect.x = i * 10;
            rect.height = c.canvas.height - i * 10;
            webGL.defineContent(1, 0.3 * i, 0, 1);
            webGL.render();
            webGL.copyToCanvas(c, webGL.getRect(), rect);
        }
    }
}