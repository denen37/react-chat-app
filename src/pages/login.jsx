import { Card, CardContent } from '@/components/ui/card'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from 'react'
import axios from 'axios';
import { Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { setUser, setToken } from '@/store/authSlice';
import { useDispatch } from 'react-redux';

const State = {
    INITIAL: 'initial',
    PENDING: 'pending',
    SUCCESS: 'success',
    ERROR: 'error'
}


const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [state, setState] = useState(State.INITIAL)
    const [error, setError] = useState('')

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const sendLoginDetails = async (email, password) => {
        try {
            setState(State.PENDING)
            setError('')
            const result = await axios.post(`${import.meta.env.VITE_AUTH_URL}/api/auth/login`, { email, password })

            setState(State.SUCCESS)

            dispatch(setUser(result.data.data.user))

            dispatch(setToken(result.data.data.token))

            navigate("/chat")
        } catch (error) {
            setState(State.ERROR)

            if (error.code === 'ERR_NETWORK') {

                setError(error.message)
            } else if (error.code === 'ERR_BAD_REQUEST') {

                setError(error.response.data.message)
            }
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-100">
            <h1 className='font-bold text-4xl mb-8'>Welcome to Acepick Chat</h1>

            <Card className="w-full max-w-md px-4 py-6 shadow-lg">
                <CardContent>
                    {
                        error && <div className='text-red-500 text-sm py-2'>
                            <p className='text-center'>{error}</p>
                        </div>
                    }
                    <div className="flex flex-col space-y-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button className='cursor-pointer'
                            onClick={() => sendLoginDetails(email, password)}
                            disabled={!email.trim() || !password.trim() || state === State.PENDING}>
                            {
                                state === State.PENDING && <Loader2 className="animate-spin" />
                            }
                            {
                                state === State.PENDING ? "Processing..." : "Login"
                            }
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Login
