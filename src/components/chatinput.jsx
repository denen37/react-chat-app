import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { SendHorizontal , Paperclip} from 'lucide-react';
import { Label } from "@/components/ui/label"

const ChatInput = ({ socket, userId, partnerId, room }) => {
    const [files, setFiles] = useState([]);
    const [msg, setMsg] = useState("");
    const formRef = useRef(null);

    function uploadImage() {
        if (!files.length) {
            alert("Please select an image.");
            return;
        }

        const file = files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            const arrayBuffer = event.target.result;

            // Send the image as a binary buffer via WebSocket
            socket.emit("upload_file", {
                image: new Uint8Array(arrayBuffer),
                fileName: file.name,
                from: userId,
                to: partnerId,
                room: room
            });
        };

        reader.readAsArrayBuffer(file);
    }


    const sendMessage = () => {
        // event.preventDefault();
        if (files.length > 0) {
            uploadImage();
        }

        if (msg.trim()) {
            let data = { text: msg, to: partnerId, from: userId, room }
            console.log(data)
            socket.emit("send_message", data);
            setMsg("")
        }

        formRef.current.reset();
    }

    const handleFile = (e) => {
        setFiles(e.target.files);
    }

    return (
        <footer className='px-4 py-4 flex gap-1 absolute bottom-0 left-0 right-0 bg-white z-10 shadow-md'>
            <form className='' ref={formRef} >
               
                <Label
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 size-9 shadow-none cursor-pointer"
                htmlFor="upload"
            >
                <Paperclip />
            </Label>
                
                <Input
                    type="file"
                    className="w-fit hidden"
                    id="upload"
                    onChange={(e) => handleFile(e)}
                />
            </form>
            <Input
                type="text"
                value={msg}
                placeholder="Type a message..."
                className='flex-1'
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
                variant="outline"
                size="icon"
                className="shadow-none cursor-pointer"
                type="button"
                onClick={sendMessage}
            >
                <SendHorizontal />
            </Button>
        </footer>
    )
}

export default ChatInput
