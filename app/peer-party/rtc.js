import {
    pipe
} from "../peer-party/utils";

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
    constructor(iceServers, peerEvents) {
        /**
         * @property {RTCPeerConnection} rtcPeer rtc peer instance which is used to initiate a communication with other peers 
         */
        this.rtcPeer = new RTCPeerConnection({
            iceServers
        });

        let events = {
            onicecandidate: pipe(this._onicecandidate, peerEvents.onicecandidate),
            ontrack: pipe(this._ontrack, peerEvents.ontrack),
            onnegotiationneeded: pipe(this._onnegotiationneeded, peerEvents.onnegotiationneeded)
        }
        Object.assign(this.rtcPeer, ...events);
    }

    async _initiateConnection() {
        try {
            log("Negotiation started");
            const offer = await this.rtcPeer.createOffer(constraints);

            // If the connection hasn't yet achieved the "stable" state,
            // return to the caller. Another negotiationneeded event
            // will be fired when the state stabilizes.
            if (this.rtcPeer.signalingState != "stable") {
                log("     -- The connection isn't stable yet; postponing...")
                return;
            }

            log("Setting to local description");
            await this.rtcPeer.setLocalDescription(offer);

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

            let answer = await slavePeer.createAnswer(constraints);
            this.rtcPeer.setLocalDescription(answer);

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
}