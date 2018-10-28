var ImagesAndSound;
(function (ImagesAndSound) {
    Setup.size(800, 600);
    var img = new Image();
    img.addEventListener("load", drawImage);
    img.src = "bmp.png";
    function drawImage() {
        crc2.drawImage(img, 10, 10);
    }
    var audio = new Audio("C_trance.mp3");
    console.log(audio.canPlayType("audio/mpeg"));
    audio.loop = true;
    audio.play();
    var audio2 = new Audio("coin-jingle.mp3");
    while (true) {
        alert("Hit OK to hear the sound of money!");
        audio2.pause();
        audio2.currentTime = 0;
        audio2.play();
    }
})(ImagesAndSound || (ImagesAndSound = {}));
//# sourceMappingURL=ImagesAndSound.js.map