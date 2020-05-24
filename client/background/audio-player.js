function AudioPlayer() {
    var audio = new Audio();
    function play() {
        audio.play();

    }
    function pause() {
        audio.pause();

    }
    function setStream(stream) {
        audio.srcObject = stream;
    }
    function getStream() {
        audio.srcObject;
    }
    return {
        play,
        pause,
        setStream,
        getStream
    }
}
var player = AudioPlayer();
window.AudioPlayer = player;
export default player;