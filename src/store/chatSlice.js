
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    messages: [],
    socket: null,
    room: '',
    partner: null,
    previousChats: []
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addMessage(state, action) {
            state.messages.push(action.payload);
        },

        setMessages(state, action) {
            state.messages = action.payload;
        },

        addSocket(state, action) {
            state.socket = action.payload;
        },

        setPartner(state, action) {
            state.partner = action.payload;
        },

        setRoom(state, action) {
            state.room = action.payload;
        },

        addPreviousChat(state, action) {
            state.previousChats.push(action.payload);
        },

        setPreviousChats(state, action) {
            state.previousChats = action.payload;
        }
    },
});

export const { addMessage, addSocket, setPartner, addPreviousChat, setPreviousChats, setRoom, setMessages } = chatSlice.actions;
export default chatSlice.reducer;
