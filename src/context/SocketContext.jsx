import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux';

const SocketContext = createContext(null); // Creating context

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const token = useSelector((state) => state.auth.token)

    useEffect(() => {
        const socket = io("http://localhost:5002", {
            autoConnect: false,
        });

        socket.auth = { token };

        socket.connect();

        setSocket(socket);

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);

    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }

    return context;
};

