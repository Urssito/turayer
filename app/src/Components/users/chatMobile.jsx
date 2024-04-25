import React, {useState} from "react";
import { useEffect } from "react";
import { useUser } from "../../Contexts/user.jsx";
import Chat from "./chat.jsx";
import {useTheme} from "../../Contexts/theme.jsx";
import Schema from "../main/schema.jsx";

const ChatPage = () => {
    return <Schema Content={ChatPageContent} />
}

const ChatPageContent = () => {
    const {theme} = useTheme();
    const {userState, token} = useUser();
    const [chats, setChats] = useState(null);

    const chatList = () => {
        if(userState?.followers){
            const res = userState.followers.filter(f => {
                return userState.follows.includes(f)
            });
            res?.slice(0,10);
            setChats(res);
        }
    }

    useEffect(() => {
        chatList();
    }, [userState]);

    return(
        <>
            <div className={`top-bar ${theme === 'light' ? 'bg-light' : 'bg-dark'}`}>
                <div className="back-btn-div" onClick={()=>{window.history.back()}} >
                    <span className="back-btn material-icons notranslate">arrow_back</span>
                </div>
                <div className="top-bar-title">Chats</div>
            </div>
            <div className="top-bar-space" />
            <div id="chats">
                {chats ? chats.map((chat, i) => (
                    <Chat key={'chat-'+i} chatid={chat} />
                )):''}
            </div>
        </>
    )
}

export default ChatPage