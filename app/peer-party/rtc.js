/**
 * Used for abstraction of webrtc implementations
 * @module RTC_Connnector
 * @extends EventTarget
 */
class RTC_Connnector extends EventTarget {

    /**
     * @param {Object} iceServers 
     * @param {Object} peerEvents Set of actions that has to be called during the peer transmissions
     * @param {function} peerEvents.onicecandidate
     * @param {function} peerEvents.ontrack
     * @param {function} peerEvents.onnegotiationneeded  
     */
    constructor(iceServers, streams, peerEvents = {}) {
        /**
         * @property {RTCPeerConnection} rtcPeer rtc peer instance which is used to initiate a communication with other peers 
         */
        super();
        this.constraints = {
            audio: true
        };
        this.rtcPeer = new RTCPeerConnection({
            iceServers
        });

        this.signallingEvents = (eventName, data) => {
            return new CustomEvent(eventName, {detail: data})
        }

        console.log(this.rtcPeer);
        

        this.rtcPeer.onnegotiationneeded = this._initiateConnection.bind(this);
        this.rtcPeer.ontrack = this._ontrack.bind(this);
        this.rtcPeer.onicecandidate = this._onicecandidate.bind(this);

        if (streams) {
            for (const track of streams.getTracks()) {
                this.rtcPeer.addTrack(track, streams);
            }
        }
    }

    _ontrack(event) {
        log("track added in rtc");
        // if (event.candidate) {
        //     this.dispatchEvent(this.signallingEvents.candidate, event);
        // }
    }

    async _initiateConnection() {
        try {
            log("Negotiation started");
            const offer = await this.rtcPeer.createOffer(this.constraints);

            // If the connection hasn't yet achieved the "stable" state,
            // return to the caller. Another negotiationneeded event
            // will be fired when the state stabilizes.
            if (this.rtcPeer.signalingState != "stable") {
                log("     -- The connection isn't stable yet; postponing...")
                return;
            }

            log("Setting to local description");
            await this.rtcPeer.setLocalDescription(offer);

            this.dispatchEvent(this.signallingEvents("offerReady",this.rtcPeer.localDescription));
            // signal({
            //     action: "offer",
            //     offer: peerList[username].localDescription
            // });

        } catch (error) {
            log(`Failed in Negotiation ${error}`)
        }
    }

    async acceptOffer(offer) {
        var desc = new RTCSessionDescription(offer);

        // If the connection isn't stable yet, wait for it...

        if (this.rtcPeer.signalingState != "stable") {
            log("  - But the signaling state isn't stable, so triggering rollback");

            // Set the local and remove descriptions for rollback; don't proceed
            // until both return.
            await Promise.all([
                this.rtcPeer.setLocalDescription({
                    type: "rollback"
                }),
                this.rtcPeer.setRemoteDescription(desc)
            ]);
            return;
        } else {
            log("  - Setting remote description");
            // await sendAudio();
            await this.rtcPeer.setRemoteDescription(desc);

            let answer = await slavePeer.createAnswer(this.constraints);
            this.rtcPeer.setLocalDescription(answer);

            this.dispatchEvent(this.signallingEvents("answerReady", this.rtcPeer.localDescription));
            // signal({
            //     action: "answer",
            //     answer: slavePeer.localDescription
            // });
        }
    }

    setAnswer(answer) {
        var desc = new RTCSessionDescription(answer);
        this.rtcPeer.setRemoteDescription(desc).then(_ => {
            log("Master Remote Description is set");
        });
    }

    setRemoteCandidate(candidate) {
        if (this.rtcPeer.remoteDescription) {
            var candidate = new RTCIceCandidate(candidate);
            log("Adding received ICE candidate");
            this.rtcPeer.addIceCandidate(candidate)
        }
    }

    _onicecandidate(event) {
        log("ice candidate handling");
        if (event.candidate) {
            this.dispatchEvent(this.signallingEvents("candidateReady", event.candidate));
        }
    }
}