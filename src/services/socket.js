
import { io, Socket } from "socket.io-client";

let socket = null;

export const getSocket = () => socket;
export const setSocket = (newSocket) => {
    socket = newSocket;
};
