function AudioPlayer() {
    var audio = new Audio();
    audio.autoplay = true;
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
       return audio.srcObject;
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