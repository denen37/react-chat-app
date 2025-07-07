import React, { useEffect, useRef } from 'react';
import { Phone, Video, NotepadText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger, SidebarRail } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import '../bubble.css'
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '@/store/chatSlice';
import { getInitials } from '@/utils/modules';
import { Separator } from '@/components/ui/separator';
import ChatInput from '@/components/chatinput';
import { Sent, Received } from '@/components/message';
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import InvoiceDialog from '@/components/invoice-dialog';
import { useNavigate } from 'react-router-dom';




const Chat = ({ socket }) => {
    const user = useSelector((state) => state.auth.user);
    console.log(user);
    const messages = useSelector((state) => state.chat.messages);
    const partner = useSelector((state) => state.chat.partner);
    const room = useSelector((state) => state.chat.room);

    const navigate = useNavigate();


    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);

    const handleInitiateCall = () => {
        navigate('/phone-call')
    }


    useEffect(() => {
        socket.on("receive_message", (data) => {
            dispatch(addMessage(data));
        });

        socket.on("receive_file", (data) => {
            dispatch(addMessage(data));
        })

        return () => {
            socket.off("receive_message");
            socket.off("receive_file");
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    return (
        partner ?
            <div className='h-screen flex flex-col relative'>
                <header className='absolute flex items-center bg-gray-200 px-4 py-2 top-0 left-0 right-0 z-10'>
                    <SidebarTrigger className="" />
                    <Separator orientation="vertical" className="mr-2 h-4" />

                    <div className='flex justify-between items-center flex-1'>
                        <div className='flex items-center gap-2'>
                            <Avatar className={"w-12 h-12 aspect-square"}>
                                <AvatarImage src={partner.profile?.avatar} />
                                <AvatarFallback className={"bg-blue-500 text-white font-bold"}>{getInitials(partner?.profile.firstName + ' ' + partner?.profile.lastName)}</AvatarFallback>
                            </Avatar>

                            <div>
                                <h2 className='font-semibold'>{partner.user?.profile?.fullName}</h2>
                                <p className='text-sm'>{partner.profession?.title}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Dialog>
                                <DialogTrigger>
                                    <Button variant="outline" size="icon">
                                        <NotepadText />
                                    </Button>
                                </DialogTrigger>
                                <InvoiceDialog socket={socket} />
                            </Dialog>


                            <Button variant="outline" size="icon" onClick={handleInitiateCall}>
                                <Phone />
                            </Button>

                            <Button variant="outline" size="icon">
                                <Video />
                            </Button>
                        </div>
                    </div>
                </header>

                <main className='p-4 flex-1 mt-[60px] mb-[70px] overflow-y-auto'>
                    {
                        messages.map((data, index) => {
                            if (data.from === user.id)
                                return <Sent key={index} user={user} msg={data} />
                            else
                                return <Received key={index} partner={partner} msg={data} />
                        })
                    }
                    <div ref={messagesEndRef} />
                </main>
                <ChatInput
                    socket={socket}
                    userId={user.id}
                    partnerId={partner.id}
                    room={room}
                />
            </div> :
            <div className='flex flex-col  h-full'>
                <div>
                    <SidebarTrigger className="" />
                </div>

                <div className='flex flex-1 justify-center items-center'>
                    <h1 className='text-2xl font-bold text-gray-300'>No Chat selected</h1>
                </div>
            </div>
    )
}


export default Chat
