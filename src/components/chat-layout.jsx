
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import Chat from "@/pages/chat"
import { io } from "socket.io-client";
import { useSelector } from 'react-redux';

const socket = io(import.meta.env.VITE_CHAT_URL, {
    path: '/chat',
    autoConnect: false,
    transports: ["websocket"]
});

export default function ChatLayout() {
    const token = useSelector((state) => state.auth.token)

    socket.auth = { token };

    socket.connect();

    return (
        <SidebarProvider>
            <AppSidebar socket={socket} />
            <SidebarInset>
                <Chat socket={socket} />
            </SidebarInset>
        </SidebarProvider>
    )
}

