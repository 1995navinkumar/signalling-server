export default function AudioPlayer(src) {
    var audio = new Audio();
    audio.srcObject = src;
    function play() {
        audio.play();
    }
    function pause() {
        audio.pause();
    }
    function stop() {

    }
    var player = {
        play,
        pause,
        stop
    }
    window.AudioPlayer = player;
    return player;
}