var audio = new Audio();
const AudioPlayer = {
    play() {
        audio.play()
    },
    pause() {
        audio.pause()
    },
    setStream(stream) {
        audio.srcObject = stream;
    }
}
export default AudioPlayer;
window.AudioPlayer = AudioPlayer;