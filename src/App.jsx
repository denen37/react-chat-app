import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Chat from "./pages/chat";
import AppSidebar from "./components/app-sidebar";
import NotFound from "./pages/notfound";
import ChatLayout from "./components/chat-layout";
//import VideoChat from "./pages/videochat";
import MediaChat from "./pages/MediaChat"
import VideoChat from "./pages/videochat";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<ChatLayout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
