/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Mic, Volume2 } from 'lucide-react';
import avatar from "../assets/images/avatar.jpg"
import { useSelector } from 'react-redux';
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"

const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function CallChatDialog({ socket, toneref, calltoneref }) {
    const [isCalling, setIsCalling] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const [partnerId, setPartnerId] = useState("");

    //const user = useSelector((state) => state.auth.user);
    const partner = useSelector((state) => state.chat.partner);

    console.log("partner", partner);

    const localStream = useRef(null);
    const remoteAudio = useRef(null);
    const ringtone = toneref;
    const peerConnection = useRef(null);
    const iceCandidatesQueue = useRef([]);


    const initPeerConnection = () => {
        peerConnection.current = new RTCPeerConnection(config);

        localStream.current.getTracks().forEach((track) => {
            peerConnection.current.addTrack(track, localStream.current);
        });

        peerConnection.current.ontrack = ({ streams }) => {
            if (remoteAudio.current) remoteAudio.current.srcObject = streams[0];
        };

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    to: partner.id,
                    candidate: event.candidate,
                });
            }
        };
    }


    const callUser = async () => {
        setIsCalling(true);
        initPeerConnection();

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        if (calltoneref.current) {
            calltoneref.current.loop = true;
            calltoneref.current.play().catch((err) => console.error("Ringtone play error:", err));
        }

        socket.emit("call-user", {
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

        socket.emit("make-answer", {
            answer,
            to: incomingCall.from,
        });

        // 🔇 Stop ringtone
        if (ringtone.current) {
            ringtone.current.pause();
            ringtone.current.currentTime = 0;
        }

        setIncomingCall(null);
    };



    const rejectCall = () => {
        if (ringtone.current) {
            ringtone.current.pause();
            ringtone.current.currentTime = 0;
        }

        setIncomingCall(null);

        socket.emit("reject-call", {
            to: partner.id,
        })
    };


    const hangUp = () => {
        peerConnection.current?.close();
        peerConnection.current = null;
        setIsCalling(false);
        setPartnerId("");
        remoteAudio.current.srcObject = null;

        socket.emit("end-call", {
            to: partner.id,
        })

        // 🔇 Stop ringtone
        if (calltoneref.current) {
            calltoneref.current.pause();
            calltoneref.current.currentTime = 0;
        }
    };

    // useEffect(() => {
    //     console.log("Ringtone ref value:", ringtone.current);
    // }, [ringtone]);



    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            localStream.current = stream;
        });

        socket.on("call-made", (data) => {
            setIncomingCall({ from: data.from, offer: data.offer });

            if (ringtone.current) {
                ringtone.current.loop = true;
                ringtone.current.play().catch((err) => console.error("Ringtone play error:", err));
            }
        });

        socket.on("answer-made", async (data) => {
            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));

            for (const candidate of iceCandidatesQueue.current) {
                try {
                    await peerConnection.current.addIceCandidate(candidate);
                } catch (err) {
                    console.error("Error adding queued ICE candidate:", err);
                }
            }

            iceCandidatesQueue.current = [];

            // 🔇 Stop ringtone
            if (calltoneref.current) {
                calltoneref.current.pause();
                calltoneref.current.currentTime = 0;
            }
        });

        socket.on("ice-candidate", async (data) => {
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

        socket.on("call-ended", () => {
            peerConnection.current?.close();
            peerConnection.current = null;
            setIsCalling(false);
            setPartnerId("");
            remoteAudio.current.srcObject = null;

            if (ringtone.current) {
                ringtone.current.pause();
                ringtone.current.currentTime = 0;
            }
        })


        socket.on("call-rejected", () => {
            peerConnection.current?.close();
            peerConnection.current = null;
            setIsCalling(false);
            setPartnerId("");
            remoteAudio.current.srcObject = null;

            // 🔇 Stop ringtone
            if (calltoneref.current) {
                calltoneref.current.pause();
                calltoneref.current.currentTime = 0;
            }
        })
    })

    return (
        <DialogContent className="sm:max-w-[425px] p-0" onInteractOutside={(event) => event.preventDefault()}>
            <div className="w-[90%] sm:w-full flex flex-col items-center justify-center py-4 px-8 bg-gray-200">
                <div className="text-center">
                    <Avatar className={"w-48 h-48 aspect-square"}>
                        <AvatarImage src={avatar} />
                        <AvatarFallback className={"bg-blue-500 text-white font-bold"}>FB</AvatarFallback>
                    </Avatar>

                    <p className="uppercase text-lg font-bold mt-4">Calling...</p>
                    <h2 className="text-xl pt-2">{partner.profile.firstName} {partner.profile.lastName}</h2>
                    <p className="text-sm mt-1"><MapPin className="text-red-400 inline-block" /> {partner.location.lga?.trim() || "Unknown LGA"}, {partner.location.state?.trim() || "Unknown State"}
                    </p>
                </div>

                <div>
                    <audio ref={remoteAudio} autoPlay controls style={{ marginTop: 20 }} />
                </div>

                <div className="flex justify-between items-center gap-20 sm:gap-32 mt-10">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <div className="flex justify-center items-center w-fit aspect-square p-4 rounded-full border-2 border-gray-400 cursor-pointer transition-transform duration-300 active:scale-90">
                            <Mic />
                        </div>

                        <p className="text-xs">MUTE</p>
                    </div>


                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <div className="flex justify-center items-center w-fit aspect-square p-4 rounded-full border-2 border-gray-400 cursor-pointer transition-transform duration-300 active:scale-90">
                            <Volume2 />
                        </div>

                        <p className="text-xs">LOUDSPEAKER</p>
                    </div>
                </div>

                {
                    incomingCall && (
                        <div className="flex items-center mt-16 gap-20 sm:gap-32">
                            <div className="flex justify-center items-center w-fit aspect-square bg-green-600 p-4 rounded-full text-white cursor-pointer transition-transform duration-300 active:scale-90"
                                onClick={acceptCall}
                            >
                                <Phone />
                            </div>


                            <DialogClose asChild>
                                <div className="flex justify-center items-center w-fit aspect-square bg-red-600 p-4 rounded-full text-white cursor-pointer transition-transform duration-300 active:scale-90"
                                    onClick={rejectCall}
                                >
                                    <Phone />
                                </div>
                            </DialogClose>
                        </div>
                    )
                }

                {
                    isCalling && (
                        <div className="flex items-center justify-center">
                            <DialogClose asChild>
                                <div className="flex justify-center items-center w-fit aspect-square bg-red-600 p-4 rounded-full text-white cursor-pointer transition-transform duration-300 active:scale-90"
                                    onClick={hangUp}
                                >
                                    <Phone />
                                </div>
                            </DialogClose>
                        </div>
                    )
                }

                {
                    !isCalling && !incomingCall && (
                        <div className="flex items-center justify-center">
                            <div className="flex justify-center items-center w-fit aspect-square bg-green-600 p-4 rounded-full text-white cursor-pointer transition-transform duration-300 active:scale-90"
                                onClick={callUser}
                            >
                                <Phone />
                            </div>
                        </div>
                    )
                }
            </div>
        </DialogContent>
    );
}

export default CallChatDialog;
