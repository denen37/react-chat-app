import React, { } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Mic, Volume2 } from 'lucide-react';
import avatar from "../assets/images/avatar.jpg"


function CallChat() {

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center py-4 px-8 bg-gray-200">
            <div className="text-center">
                <Avatar className={"w-48 h-48 aspect-square"}>
                    <AvatarImage src={avatar} />
                    <AvatarFallback className={"bg-blue-500 text-white font-bold"}>FB</AvatarFallback>
                </Avatar>

                <p className="uppercase text-lg font-bold mt-4">Calling...</p>
                <h2 className="text-xl pt-2">Oluwadamilola Samuel</h2>
                <p className="text-sm mt-1"><MapPin className="text-red-400 inline-block" /> Aba North, Abia State</p>
            </div>

            <div className="flex justify-between items-center gap-32 mt-10">
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

            <div className="flex items-center mt-16 gap-32">
                <div className="flex justify-center items-center w-fit aspect-square bg-green-600 p-4 rounded-full text-white cursor-pointer transition-transform duration-300 active:scale-90">
                    <Phone />
                </div>

                <div className="flex justify-center items-center w-fit aspect-square bg-red-600 p-4 rounded-full text-white cursor-pointer transition-transform duration-300 active:scale-90">
                    <Phone />
                </div>
            </div>
        </div>
    );
}

export default CallChat;
