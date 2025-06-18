/* eslint-disable no-unused-vars */
import { Home, Search, MessageCircleMore, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/utils/modules";
import { setPartner, addPreviousChat, setRoom, setMessages, setPreviousChats } from "@/store/chatSlice";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuBadge,
    SidebarFooter,

} from "@/components/ui/sidebar"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Menu items.
// const items = [
//     {
//         title: "Home",
//         url: "#",
//         icon: Home,
//     },

// ]

export default function AppSidebar({ socket }) {
    //const [position, setPosition] = useState("bottom")
    const [allContacts, setAllContacts] = useState([]);
    const previousChats = useSelector((state) => state.chat.previousChats);
    const [prevChatIds, setPrevChatIds] = useState([]);
    const user = useSelector((state) => state.auth.user);

    const dispatch = useDispatch();

    const handleContactSelected = (contact) => {
        dispatch(setPartner(contact))

        dispatch(addPreviousChat(contact));

        socket.emit("join_room", { contactId: contact.id })
    }

    const handleChatClick = (chat) => {
        dispatch(setPartner(chat))

        socket.emit("join_room", { contactId: chat.id })
    }

    const handleContactDropdownOpen = (open) => {
        if (open && allContacts.length === 0) {
            socket.emit("get_contacts");
        }
    }

    useEffect(() => {
        socket.io.on("error", (error) => {
            console.log(error);
        });

        socket.on('connected', () => {
            socket.emit("previous_chats");
        })

        socket.on("reconnect", () => {
            console.log("reconnect")
        })

        socket.on("joined_room", (room) => {
            dispatch(setRoom(room))

            socket.emit("get_messages", { room: room })
        })

        socket.on("receive_messages", (data) => {
            console.log(data);
            dispatch(setMessages(data));
        })

        socket.on('all_contacts', async (data) => {
            // console.log(data);
            setAllContacts(data);
        })

        socket.on('got_previous_chats', async (data) => {
            console.log(data);
            dispatch(setPreviousChats(data))
        })
    },)

    useEffect(() => {
        setPrevChatIds(previousChats.map((chat) => chat.id))
    }, [previousChats])

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <MessageCircleMore />
                        <span className="">Chats</span>
                    </div>

                    <DropdownMenu onOpenChange={(open) => handleContactDropdownOpen(open)}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="shadow-none">
                                <Plus />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>All contacts</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {
                                allContacts.map((contact, index) => {
                                    if (!prevChatIds.includes(contact.id)) {
                                        return <DropdownMenuItem value={contact.id}
                                            onSelect={() => handleContactSelected(contact)} key={index}>
                                            <Avatar>
                                                <AvatarImage src={contact.profile?.avatar} />
                                                <AvatarFallback className={"bg-blue-500 text-white font-bold"}>{getInitials(contact.profile?.firstName + ' ' + contact.profile?.lastName)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p>{contact.profile?.firstName + ' ' + contact.profile?.lastName}</p>
                                                <p className="text-sm italic text-gray-400">{contact.profile.professional?.profession.title || 'Client'}</p>
                                            </div>
                                        </DropdownMenuItem>
                                    }
                                })
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input type="text" placeholder="Search chats..." className="text-sm shadow-none" />
                    <Button variant="outline" size="icon" className="shadow-none">
                        <Search />
                    </Button>
                </div>
            </SidebarHeader>
            <SidebarContent>

                <SidebarMenu>
                    {
                        previousChats.map((chat, index) => <SidebarMenuItem className='px-1 py-2 relative' key={index}>
                            <SidebarMenuButton className='h-11 justify-between items-center' onClick={() => handleChatClick(chat)}>
                                <div className="flex items-center space-x-2">
                                    <Avatar>
                                        <AvatarImage src={chat.profile?.avatar} />
                                        <AvatarFallback className={"bg-blue-500 text-white font-bold"}>{getInitials(chat.profile?.firstName + ' ' + chat.profile?.lastName)}</AvatarFallback>
                                    </Avatar>

                                    <span>{chat.profile?.firstName + ' ' + chat.profile?.lastName}</span>
                                </div>

                                <p className={`h-2 w-2 rounded-full ${chat.onlineUser?.isOnline ? 'bg-red-500' : ''}`}></p>
                            </SidebarMenuButton>
                        </SidebarMenuItem>)
                    }
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <div className='flex items-center gap-3'>
                    <Avatar className={"w-10 h-10 aspect-square"}>
                        <AvatarImage src={user.profile.avatar} />
                        <AvatarFallback className={"bg-purple-600 text-white font-bold"}>{getInitials(user?.profile.firstName + ' ' + user?.profile.lastName)}</AvatarFallback>
                    </Avatar>

                    <div>
                        <h2 className='font-semibold'>{user?.profile.firstName + ' ' + user?.profile.lastName}</h2>
                        <p className='text-gray-500 text-sm'>{user?.email}</p>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
