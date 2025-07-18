import { useEffect, useRef, useState } from "react";


const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function MediaChatDialog({ socket }) {
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);

    const [myId, setMyId] = useState("");
    const [partnerId, setPartnerId] = useState("");
    const [isCalling, setIsCalling] = useState(false);

    const localStream = useRef(null);
    const peerConnection = useRef(null);

    useEffect(() => {
        socket.on("connect", () => {
            setMyId(socket.id);
        });

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            localStream.current = stream;
            if (localVideo.current) localVideo.current.srcObject = stream;
        });

        socket.on("call-made", async (data) => {
            peerConnection.current = new RTCPeerConnection(config);

            localStream.current.getTracks().forEach((track) => {
                peerConnection.current.addTrack(track, localStream.current);
            });

            peerConnection.current.ontrack = ({ streams }) => {
                if (remoteVideo.current) remoteVideo.current.srcObject = streams[0];
            };

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice-candidate", {
                        to: data.from,
                        candidate: event.candidate,
                    });
                }
            };

            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            socket.emit("make-answer", { answer, to: data.from });
        });

        socket.on("answer-made", async (data) => {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        socket.on("ice-candidate", async (data) => {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        });
    }, []);

    const callUser = async () => {
        setIsCalling(true);
        peerConnection.current = new RTCPeerConnection(config);

        localStream.current.getTracks().forEach((track) => {
            peerConnection.current.addTrack(track, localStream.current);
        });

        peerConnection.current.ontrack = ({ streams }) => {
            if (remoteVideo.current) remoteVideo.current.srcObject = streams[0];
        };

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    to: partnerId,
                    candidate: event.candidate,
                });
            }
        };

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit("call-user", {
            offer,
            to: partnerId,
        });
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>My ID: {myId}</h2>
            <input
                type="text"
                placeholder="Enter partner ID"
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                disabled={isCalling}
            />
            <button onClick={callUser} disabled={isCalling || !partnerId}>
                Call
            </button>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <video ref={localVideo} autoPlay muted width={300} />
                <video ref={remoteVideo} autoPlay width={300} />
            </div>
        </div>
    );
}

export default MediaChatDialog;
