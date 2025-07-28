import { useEffect, useRef, useCallback } from "react";

export function useLocalMedia({ audio = true, video = true } = {}) {
    const localStream = useRef(null);
    const videoRef = useRef(null);

    const getLocalStream = useCallback(async () => {
        if (localStream.current) {
            console.log("Local stream already initialized");
            return localStream.current;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
            localStream.current = stream;
            console.log("Local stream is ready");

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                console.log("Video ref is ready");
            } else {
                // Retry binding stream if videoRef is not ready
                setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        console.log("Video ref is ready after retry");
                    }
                }, 100);
            }

            return stream;
        } catch (err) {
            console.error("Error accessing media devices:", err);
            throw err;
        }
    }, [audio, video]);

    const stopStream = useCallback(() => {
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }
    }, []);

    useEffect(() => {
        getLocalStream();

        return () => stopStream();
    }, [getLocalStream, stopStream]);

    return {
        localStream,
        videoRef,
        getLocalStream,
        stopStream
    };
}
