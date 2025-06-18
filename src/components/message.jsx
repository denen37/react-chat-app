import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { findTime, getInitials } from '@/utils/modules';

export const Sent = ({ user, msg }) => {
    return <div className='flex gap-2 items-end  w-fit py-2'>
        <Avatar className={"w-8 h-8 aspect-square"}>
            <AvatarImage src={user.profile.avatar} />
            <AvatarFallback className={"bg-purple-600 text-white font-bold"}>{getInitials(user?.profile.firstName + ' ' + user?.profile.lastName)}</AvatarFallback>
        </Avatar>

        <div className=''>
            <div className='bubble left'>
                {
                    msg.text.includes("<img>") && <img src={msg.text.split(">")[1]} alt="img" className='w-40' />
                }
                {
                    msg.text.includes("<img>") || msg.text.includes("<doc>") ?
                        <a className='text-sm text-blue-500 underline' href={msg.text.split(">")[1]} target="_blank">
                            {
                                msg.text.split("/")[msg.text.split("/").length - 1]
                            }
                        </a>
                        :
                        <p>
                            {msg.text}
                        </p>
                }
            </div>
            <p className='text-xs text-gray-500 text-end mr-8 mt-1'>{findTime(msg.timestamp)}</p>
        </div>
    </div>
}

export const Received = ({ partner, msg }) => {
    return <div className='flex gap-2 items-end w-fit ml-auto py-2'>
        <div>
            <div className='bubble right'>
                {
                    msg.text.includes("<img>") && <img src={msg.text.split(">")[1]} alt="img" className='w-40' />
                }
                {
                    msg.text.includes("<img>") || msg.text.includes("<doc>") ?
                        <a className='text-sm text-blue-500 underline' href={msg.text.split(">")[1]} target="_blank">
                            {
                                msg.text.split("/")[msg.text.split("/").length - 1]
                            }
                        </a>
                        :
                        <p>
                            {msg.text}
                        </p>
                }
            </div>

            <p className='text-xs text-gray-500 text-start ml-8 mt-1'>{findTime(msg.timestamp)}</p>
        </div>

        <Avatar className={"w-8 h-8 aspect-square"}>
            <AvatarImage src={partner.profile?.avatar} />
            <AvatarFallback className={"bg-blue-500 text-white font-bold"}>{getInitials(partner?.profile.firstName + ' ' + partner?.profile.lastName)}</AvatarFallback>
        </Avatar>
    </div>
}