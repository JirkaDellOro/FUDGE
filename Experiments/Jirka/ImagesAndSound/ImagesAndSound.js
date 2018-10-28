var ImagesAndSound;
(function (ImagesAndSound) {
    var coin = new Audio("coin-jingle.mp3");
    var music = new Audio("C_trance.mp3");
    document.addEventListener("click", play);
    let started = false;
    Setup.size(120, 60);
    var img = new Image();
    img.addEventListener("load", drawImage);
    img.src = "bmp.png";
    function drawImage() {
        crc2.drawImage(img, 10, 10);
    }
    function play() {
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
})(ImagesAndSound || (ImagesAndSound = {}));
//# sourceMappingURL=ImagesAndSound.js.map