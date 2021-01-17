namespace HeightMap {
    export class Transition {
        public static async get(_url: RequestInfo): Promise<Uint8ClampedArray> {
            let transition: Uint8ClampedArray = Transition.transitions.get(_url);
            if (transition)
            return transition;
    
            let txtTransition = new ƒ.TextureImage();
            await txtTransition.load(_url);
    
            // TODO: move to get(...)
            let canvasTransition: HTMLCanvasElement = document.createElement("canvas");
            canvasTransition.width = Stage.viewport.getCanvas().width;
            canvasTransition.height = Stage.viewport.getCanvas().height;
            let crcTransition: CanvasRenderingContext2D = canvasTransition.getContext("2d");
            crcTransition.imageSmoothingEnabled = false;
            crcTransition.drawImage(txtTransition.image, 0, 0, txtTransition.image.width, txtTransition.image.height, 0, 0, 1280, 720);
            transition = crcTransition.getImageData(0, 0, 1280, 720).data;
    
            Transition.transitions.set(_url, transition);
            return transition;
        }
    }
}
