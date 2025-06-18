import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"

const invoiceItems = [
    { description: "Item 1", price: 20, quantity: 5 },
    { description: "Item 2", price: 20, quantity: 5, },
]

let item = { description: '', price: 0, quantity: 0, }

const InvoiceDialog = ({ socket }) => {
    const [items, setItems] = useState(invoiceItems)
    const [isAdd, setIsAdd] = useState(false)
    const [amount, setAmount] = useState('')

    const saveItem = () => {
        setItems([...items, item])
        item = {};
        setAmount('');
        setIsAdd(false);
    }

    const handleOnClick = (event, prop) => {
        item[prop] = event.target.value
        if (prop === 'quantity') {
            setAmount(item[prop] * item.price || 0)
        }

        if (prop === 'price') {
            setAmount(item[prop] * item.quantity || 0)
        }
    }

    const postItems = () => {

    }

    return <DialogContent>
        <DialogHeader>
            <DialogTitle>INVOICE</DialogTitle>
            <DialogDescription>
                Date issued: 2023-01-01
            </DialogDescription>
        </DialogHeader>

        <div>
            <div className='py-1'>
                <p className='text-sm'><span className='font-bold'>From: </span> your@email.com</p>
                <p className='text-sm'><span className='font-bold'>Address: </span> your address</p>
            </div>
            <hr />
            <div className='py-1'>
                <p className='text-sm'><span className='font-bold'>To: </span> client@email.com</p>
                <p className='text-sm'><span className='font-bold'>Address: </span> your address</p>
            </div>
            <table className='border-collapse  text-left mt-2'>
                <thead className='font-bold capitalize text-gray-900'>
                    <tr>
                        <th className='p-1 border border-gray-300'>Description</th>
                        <th className='p-1 border border-gray-300'>Unit Cost</th>
                        <th className='p-1 border border-gray-300'>Qty/hr rate</th>
                        <th className='p-1 border border-gray-300'>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        items.map((item, index) => <tr key={index}>
                            <td className='p-1 border border-gray-300'>
                                <p className='text-sm'>{item.description}</p>
                            </td>
                            <td className='p-1 border border-gray-300'>${item.price}</td>
                            <td className='p-1 border border-gray-300'>{item.quantity}</td>
                            <td className='p-1 border border-gray-300'>${item.price * item.quantity}</td>
                        </tr>)
                    }

                    {
                        isAdd && <tr>
                            <td className='border border-gray-300'>
                                <input className='min-w-0 w-full block px-1 py-1 my-0.5' placeholder='Description' name='desc' onChange={(e) => handleOnClick(e, 'description')} />
                            </td>
                            <td className='border border-gray-300'>
                                <input className='min-w-0 w-full h-full px-1 py-1' placeholder='Unit cost' type='number' name='unit' onChange={(e) => handleOnClick(e, 'price')} />
                            </td>
                            <td className='border border-gray-300'>
                                <input className='min-w-0 w-full h-full px-1 py-1' placeholder='Qty' type='number' name='qty' onChange={(e) => handleOnClick(e, 'quantity')} />
                            </td>
                            <td className='border border-gray-300'>
                                <input className='min-w-0 w-full h-full px-1 py-1' placeholder='Amount' type='number' disabled value={amount} />
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>

        <DialogFooter className="sm:justify-start">
            <Button type='button' className='bg-green-400 text-white' onClick={(e) => setIsAdd(true)}>
                Add
            </Button>
            <Button type='button' className='bg-blue-400 text-white' onClick={(e) => saveItem()}>
                Save
            </Button>
            <Button type='button' className='bg-blue-400 text-white' onClick={(e) => postItems()}>
                Post
            </Button>
            <DialogClose asChild>
                <Button type="button" variant="secondary">
                    Close
                </Button>
            </DialogClose>
        </DialogFooter>
    </DialogContent>

}

export default InvoiceDialog
