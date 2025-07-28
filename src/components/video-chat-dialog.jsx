/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Play, Pause, Phone, Mic, Volume2, Video } from 'lucide-react';
import avatar from "../assets/images/avatar.jpg"
import { useSelector } from 'react-redux';
import { useLocalMedia } from "../hooks/useLocalMedia";
import {
    DialogContent,
    DialogClose
} from "@/components/ui/dialog"

const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function VideoChatDialog({ socket, toneref, calltoneref }) {
    const [isCalling, setIsCalling] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const [callAnswered, setCallAnswered] = useState(false);
    const [partnerId, setPartnerId] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);

    //const user = useSelector((state) => state.auth.user);
    const partner = useSelector((state) => state.chat.partner);

    //console.log("partner", partner);

    const localStream = useRef(null);
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const peerConnection = useRef(null);
    const iceCandidatesQueue = useRef([]);

    // const { videoRef, localStream } = useLocalMedia({ video: true, audio: true });

    const setVideoRef = (el) => {
        if (el) {
            localVideo.current = el;
            console.log("Manually assigned video element:", el);
        }
    };

    const getLocalStream = async () => {
        if (localStream.current) {
            console.log("Local stream already initialized");
            if (!localVideo.current) {
                const el = document.getElementById("localVideo");
                localVideo.current = el;
            }

            localVideo.current.srcObject = localStream.current;
            localVideo.current.onloadedmetadata = () => {
                localVideo.current.play().catch((err) =>
                    console.error("Manual play failed:", err)
                );
            };
            return;
        }

        console.log('Local stream not initialized', localStream.current);
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            localStream.current = stream;
            if (localVideo.current) localVideo.current.srcObject = stream;

            localVideo.current.onloadedmetadata = () => {
                localVideo.current.play().catch((err) =>
                    console.error("Manual play failed:", err)
                );
            };
        });
    }


    const initPeerConnection = () => {
        // console.log('local video', localVideo.current.srcObject)
        peerConnection.current = new RTCPeerConnection(config);

        localStream.current.getTracks().forEach((track) => {
            peerConnection.current.addTrack(track, localStream.current);
        });

        peerConnection.current.ontrack = ({ streams }) => {
            if (remoteVideo.current) remoteVideo.current.srcObject = streams[0];
        };

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("video-ice-candidate", {
                    to: partner.id,
                    candidate: event.candidate,
                });
            }
        };
    }

    const ringing = (toneref, ring) => {
        if (ring) {
            if (toneref.current) {
                toneref.current.loop = true;
                toneref.current.play().catch((err) => console.error("Ringtone play error:", err));
            }
        } else {
            if (toneref.current) {
                toneref.current.pause();
                toneref.current.currentTime = 0;
            }
        }
    }



    const callUser = async () => {
        getLocalStream();
        setIsCalling(true);
        initPeerConnection();

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        // ringing(calltoneref, true);

        socket.emit("video-call-user", {
            offer,
            to: partner.id,
        });
    };


    const acceptCall = async () => {
        setIsCalling(true);
        initPeerConnection();

        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

        for (const candidate of iceCandidatesQueue.current) {
            try {
                await peerConnection.current.addIceCandidate(candidate);
            } catch (err) {
                console.error("Error adding queued ICE candidate:", err);
            }
        }
        iceCandidatesQueue.current = [];

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        socket.emit("video-make-answer", {
            answer,
            to: incomingCall.from,
        });

        // ringing(toneref, false)

        setIncomingCall(null);
    };



    const rejectCall = () => {
        // ringing(toneref, false)

        setIncomingCall(null);

        socket.emit("video-reject-call", {
            to: partner.id,
        })
    };


    const hangUp = () => {
        peerConnection.current?.close();
        peerConnection.current = null;
        setIsCalling(false);
        setPartnerId("");
        if (remoteVideo.current) remoteVideo.current.srcObject = null;

        socket.emit("video-end-call", {
            to: partner.id,
        })

        // ringing(calltoneref, false)
    };


    const toggleVideo = async () => {
        // if (!localVideo.current) return;

        // // If video already has a stream attached, toggle play/pause
        // const isPlaying = !localVideo.current.paused && localVideo.current.srcObject;

        // if (isPlaying) {
        //     localVideo.current.srcObject = null;
        //     setIsPlaying(false);
        // } else {
        //     // Only get stream if none exists
        //     if (!localVideo.current.srcObject) {
        //         try {
        //             const mediaStream = await navigator.mediaDevices.getUserMedia({
        //                 video: true,
        //                 audio: false
        //             });
        //             localVideo.current.srcObject = mediaStream;
        //         } catch (err) {
        //             console.error("Error accessing camera:", err);
        //             return;
        //         }
        //     }

        //     // Now play the video
        //     localVideo.current.play().then(() => {
        //         setIsPlaying(true);
        //     }).catch((err) => {
        //         console.error("Play failed:", err);
        //     });
        // }
    };


    useEffect(() => {
        console.log('Video Ref in useEffect', localVideo.current);
    }, [localVideo])


    useEffect(() => {
        //getLocalStream();

        socket.on("video-call-made", async (data) => {
            console.log("video-call-made");
            //getLocalStream();

            if (!localVideo.current) localVideo.current = document.getElementById('localVideo');

            console.log('local stream', localStream.current);

            if (!localVideo.current?.srcObject) {
                if (!localStream.current) {
                    try {
                        const mediaStream = await navigator.mediaDevices.getUserMedia({
                            video: true,
                            audio: true
                        });
                        localStream.current = mediaStream;
                        console.log("[SET STREAM] About to assign srcObject 1");
                        localVideo.current.pause();
                        localVideo.current.srcObject = mediaStream;
                        console.log("Video tracks 1:", localStream.current.getVideoTracks());
                    } catch (err) {
                        console.error("Error accessing camera:", err);
                        return;
                    }
                } else {
                    if (!localVideo.current.paused) return;
                    console.log("[SET STREAM] About to assign srcObject 2");
                    localVideo.current.pause();
                    localVideo.current.srcObject = localStream.current;
                    console.log("Video tracks 2:", localStream.current.getVideoTracks());

                }
            }

            // localVideo.current.onloadedmetadata = () => {
            console.log('src object tracks', localVideo.current.srcObject.getVideoTracks())
            console.log('paused', localVideo.current.paused)
            if (localVideo.current.paused)
                localVideo.current.play()
                    .then(() => console.log("Video started"))
                    .catch((err) => console.error("Play failed", err));
            // };

            console.log('Local video ref incoming', localVideo.current)
            setIncomingCall({ from: data.from, offer: data.offer });

            console.log("Incoming call from:")
            console.log(data.from);

            // ringing(toneref, true);
        });

        socket.on("video-answer-made", async (data) => {
            const pc = peerConnection.current;

            if (!pc) return;

            // Only accept answer if we’re in “have-local-offer” state
            if (pc.signalingState !== "have-local-offer") {
                console.warn("Skipping setRemoteDescription: invalid signaling state:", pc.signalingState);
                return;
            }

            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));

                // Add any queued ICE candidates
                for (const candidate of iceCandidatesQueue.current) {
                    try {
                        await pc.addIceCandidate(candidate);
                    } catch (err) {
                        console.error("Error adding queued ICE candidate:", err);
                    }
                }

                iceCandidatesQueue.current = [];

                setCallAnswered(true);
                // ringing(calltoneref, false);
            } catch (err) {
                console.error("Failed to set remote description:", err);
            }
        });

        socket.on("video-ice-candidate", async (data) => {
            const candidate = new RTCIceCandidate(data.candidate);
            const pc = peerConnection.current;

            if (!pc || !pc.remoteDescription || !pc.remoteDescription.type) {
                iceCandidatesQueue.current.push(candidate);
            } else {
                try {
                    await pc.addIceCandidate(candidate);
                } catch (err) {
                    console.error("Error adding received ICE candidate:", err);
                }
            }
        });

        socket.on("video-call-ended", () => {
            peerConnection.current?.close();
            peerConnection.current = null;
            setIsCalling(false);
            setIncomingCall(false);
            setPartnerId("");
            if (remoteVideo.current) remoteVideo.current.srcObject = null;
            localVideo.current.pause();
            localVideo.current.srcObject = null;

            setCallAnswered(false);

            // ringing(toneref, false)
        })


        socket.on("video-call-rejected", () => {
            console.log("Call rejected");
            peerConnection.current?.close();
            peerConnection.current = null;
            setIsCalling(false);
            setIncomingCall(false);
            setPartnerId("");
            if (remoteVideo.current) remoteVideo.current.srcObject = null;
            localVideo.current.pause();
            localVideo.current.srcObject = null;

            // ringing(calltoneref, false)
        })
    })

    return (
        <DialogContent
            className="sm:max-w-[425px] p-0"
            onInteractOutside={(event) => event.preventDefault()}
        >
            {/* {callAnswered ? (
                <div className="flex flex-col items-center justify-center py-6 bg-gray-100">
                    <div className="flex gap-4 mt-4">
                      
                        <video ref={localVideo} autoPlay playsInline width={300} muted />
                    </div>
                </div>
            ) : ( */}
            <div className="w-[90%] sm:w-full flex flex-col items-center justify-center py-6 px-8 bg-gray-200">
                <div className="text-center relative">
                    <video ref={remoteVideo} autoPlay playsInline className="w-full" />
                    <video id="localVideo" ref={setVideoRef} preload="none" autoPlay playsInline muted className="d-block ml-auto w-40 h-40" />
                </div>

                {/* Action Icons (Mute / Loudspeaker) */}
                <div className="flex justify-between items-center gap-20 sm:gap-32 mt-5 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                        <button
                            className="flex justify-center items-center w-fit aspect-square p-4 rounded-full border-2 border-gray-400 transition-transform duration-300 active:scale-90"
                            aria-label="Mute Microphone"
                            onClick={toggleVideo}
                        >
                            {/* <Mic /> */}
                            {
                                isPlaying ? <Pause /> : <Play />
                            }
                        </button>
                        <p className="text-xs">MUTE</p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <button
                            className="flex justify-center items-center w-fit aspect-square p-4 rounded-full border-2 border-gray-400 transition-transform duration-300 active:scale-90"
                            aria-label="Toggle Loudspeaker"
                        >
                            <Volume2 />
                        </button>
                        <p className="text-xs">LOUDSPEAKER</p>
                    </div>
                </div>

                {/* Call Controls */}
                <div className="mt-5">
                    {incomingCall && (
                        <div className="flex items-center justify-center gap-20 sm:gap-32">
                            <button
                                className="flex justify-center items-center aspect-square bg-green-600 p-4 rounded-full text-white transition-transform duration-300 active:scale-90"
                                onClick={acceptCall}
                                aria-label="Accept Call"
                            >
                                <Video />
                            </button>

                            <DialogClose asChild>
                                <button
                                    className="flex justify-center items-center aspect-square bg-red-600 p-4 rounded-full text-white transition-transform duration-300 active:scale-90"
                                    onClick={rejectCall}
                                    aria-label="Reject Call"
                                >
                                    <Video />
                                </button>
                            </DialogClose>
                        </div>
                    )}

                    {isCalling && (
                        <div className="flex items-center justify-center">
                            <DialogClose asChild>
                                <button
                                    className="flex justify-center items-center aspect-square bg-red-600 p-4 rounded-full text-white transition-transform duration-300 active:scale-90"
                                    onClick={hangUp}
                                    aria-label="Hang Up"
                                >
                                    <Video />
                                </button>
                            </DialogClose>
                        </div>
                    )}

                    {!isCalling && !incomingCall && (
                        <div className="flex items-center justify-center">
                            <button
                                className="flex justify-center items-center aspect-square bg-green-600 p-4 rounded-full text-white transition-transform duration-300 active:scale-90"
                                onClick={callUser}
                                aria-label="Start Call"
                            >
                                <Video />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* )} */}
        </DialogContent>
    );
}

export default VideoChatDialog;
