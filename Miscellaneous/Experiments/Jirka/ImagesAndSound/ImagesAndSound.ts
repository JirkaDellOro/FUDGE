module ImagesAndSound {
    var coin: HTMLAudioElement = new Audio("coin-jingle.mp3");
    var music: HTMLAudioElement = new Audio("C_trance.mp3");
    document.addEventListener("click", play);
    let started: boolean = false;
    Setup.size(120, 60);

    var img: HTMLImageElement = new Image();
    img.addEventListener("load", drawImage);
    img.src = "bmp.png";

    function drawImage(): void {
        crc2.drawImage(img, 10, 10);
    }

    function play(): void {
        if (started) {
            coin.pause();
            coin.currentTime = 0;
            coin.play();
        }
        else {
            console.log(music.canPlayType("audio/mpeg"));
            music.loop = true;
            music.play();
            started = true;
        }
    }
}