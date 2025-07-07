import React, { useRef, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import io from "socket.io-client";


const socket = io("http://192.168.0.235:5002", {
    autoConnect: false,
});


const VideoChat = () => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const [isCalling, setIsCalling] = useState(false);
    const token = useSelector((state) => state.auth.token)

    socket.auth = { token };

    socket.connect();


    useEffect(() => {
        peerConnection.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("candidate", event.candidate);
            }
        };

        peerConnection.current.ontrack = (event) => {
            remoteVideoRef.current.srcObject = event.streams[0];
        };

        socket.on("offer", async (offer) => {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socket.emit("answer", answer);
        });

        socket.on("answer", async (answer) => {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("candidate", async (candidate) => {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        });

        return () => {
            socket.off("offer");
            socket.off("answer");
            socket.off("candidate");
        };
    }, []);

    const startCall = async () => {
        setIsCalling(true);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        localVideoRef.current.srcObject = stream;

        stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

        const offer = await peerConnection.current.createOffer();

        await peerConnection.current.setLocalDescription(offer);

        socket.emit("offer", offer);
    };

    return (
        <div>
            <h2>WebRTC Video Chat</h2>
            <video ref={localVideoRef} autoPlay playsInline style={{ width: "300px" }} />
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "300px" }} />
            <button onClick={startCall} disabled={isCalling}>Start Call</button>
        </div>
    );
};

export default VideoChat;
