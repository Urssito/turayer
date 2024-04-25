import React, {useState, useRef, useEffect} from "react";
import { useUser } from "../../Contexts/user.jsx";
import { useSocket } from "../../Contexts/socket.jsx";
import { getUser } from "../../modules/getUsers.jsx";
import { useMobile } from "../../Contexts/mobile.jsx"

const Chat = ({chatid}) => {
    const [active, setActive] = useState(false);
    const [user, setUser] = useState(null);
    const {token, userState} = useUser();
    const [chat, setChat] = useState([]);
    const [lastMsg, setLastMsg] = useState('');
    const [see, setSee] = useState(true)
    const {socket} = useSocket();
    const {isMobile} = useMobile();
    
    useEffect(async() => {
        if(chatid){
            const userObj = await getUser('id-'+chatid);
            setUser(userObj);
        }
    }, [userState]);

    const getChat = async() => {
        if(user && userState){
            const res = await fetch('/api/getChat', {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                    'userA': user.id,
                    'userB': userState.id,
                    'auth-token': token
                }
            });
            const data = await res.json();
            if(data){
                setChat(data.chat)

                if(data.chat[data.chat.length-1][1].length < 30){
                    setLastMsg(data.chat[data.chat.length-1][1]);
                }else{
                    setLastMsg(data.chat[data.chat.length-1][1]?.slice(0,30)+'...');
                }
                
                if(data.chat[data.chat.length-1][0] !== userState.id){
                    setSee(data.see)
                }
            }else{
                setLastMsg('Comienza tu chat con '+ user.user+ '!')
            }
        }
    }

    const switchActive = () => {
        if(chat && chat.length > 0){
            if(chat[chat.length-1][1].length < 30){
                setLastMsg(chat[chat.length-1][1]);
            }else{
                setLastMsg(chat[chat.length-1][1]?.slice(0,30)+'...');
            }
            setSee(true);
        }
        setActive(false);
    }

    useEffect(() => {
        getChat();
    }, [user])
    
    useEffect(() => {
        const bottomBar = document.getElementById('bottom-bar-space')
        if(active){
            const chats = document.getElementsByClassName('chat');
            for (let i of chats){
                i.classList.add('disabled')
            }
            if(isMobile){
                if(bottomBar) bottomBar.style.height = '132px';
            }
        }else{
            const chats = document.getElementsByClassName('chat');
            for (let i of chats){
                i.classList.remove('disabled')
            }

        }
    },[active]);

    useEffect(() => {
        socket.on('newMsg', (data) => {
            if(data[0] === chatid){
                setLastMsg(data[1]);
                setChat(chat => [...chat, data]);
                if(!document.getElementById('active-chat-body')){
                    setSee(false);
                }else{
                    setSee(true);
                    fetch('/api/chatSee', {
                        method: 'PUT',
                        headers: {
                            'content-type': 'application/json',
                            'auth-token': token
                        },
                        body: JSON.stringify({
                            see: Boolean(document.getElementById('active-chat-body')),
                            userA: userState.id,
                            userB: chatid
                        })
                    })
                }
            }
        })
    }, [])

    const msgEnd = useRef(null);
    useEffect(() => {
        if(active) msgEnd.current.scrollIntoView({});
    }, [chat, active]);

    if(active){
        return <ChatActive
            user={user}
            setActive={setActive}
            switchActive={switchActive}
            chat={chat}
            setChat={setChat}
            msgEnd={msgEnd}
            chatid={chatid}
        />
    }else{
        return <ChatNotActive
            user={user}
            setActive={setActive}
            lastMsg={lastMsg}
            see={see}
            setSee={setSee}
        />
    }

};

const ChatActive = ({user, switchActive, chat, setChat, msgEnd, chatid}) => {
    const {isMobile} = useMobile();
    const {userState, token} = useUser();
    const {socket} = useSocket();

    const scroll = () => {
        const chatBody = document.getElementById('active-chat-body');
        if(chatBody)chatBody.scrollTop = chatBody.scrollTopMax;
    }

    const submit = (e) => {
        if(e.key === 'Enter' && !e.shiftKey){
            send(e).then(() => {
                scroll();
            })
        }
    };

    useEffect(() => {
        let observer = null
        const chatBody = document.getElementById('active-chat-body');
        if(!isMobile && chatBody){
            observer = new ResizeObserver(entries => {
                chatBody.style.height = entries[0].target.clientHeight-180+'px'
            });
            observer.observe(document.body)
        }
    }, []);

    const send = async(e) => {
        const chatText = document.getElementById('chat-text');
        if(chatText.value.replace(/\n/g, '') !== ''  && chatText.value.replace(/ /g, '') !== ''){
            e.preventDefault();
            socket.emit('chat', {transmitter: userState.id, receiver: chatid, msg: chatText.value});
            setChat([...chat, [userState.id, chatText.value]]);
            fetch('/api/sendMsg', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'auth-token': token,
                },
                body: JSON.stringify({
                    msg: [userState.id, chatText.value],
                    users: [user.id, userState.id],
                    see: false
                })
            });
        }
        chatText.value = '';
        chatText.focus();
    }

    return (user ? 
        <>
            <div id="active-chat">
                <div id="chat-top-bar" className={`top-bar`}>
                    <button onClick={switchActive} id="chat-back-btn" className="back-btn" type="button">
                        <span id="chat-back-btn" className="material-icons notranslate">arrow_back</span>
                    </button>
                    <a id="chat-header" className="a-normalize underline" href={user ? '/user/'+user.user : ''}>
                        <div className="active-chat-photo">
                            <img id="active-chat-pic" src={user.profilePic} alt={user.user} />
                        </div>
                        <div className="chat-user notranslate">
                            {user?.user}
                        </div>
                    </a>
                </div>
                <div className="top-bar-space" />
                <div id="active-chat-body" style={{'height': document.body.clientHeight-185+'px'}}>
                    <div id="msgs">
                        {
                            chat[0] ? chat.map((msg, i) => {
                                return(<div key={'msg-box-'+i} className={msg[0] === user.id ? 'msg-boxA' : 'msg-boxB'}>
                                    <div key={'msg-'+i} className={msg[0] === user.id ? 'userA msg-text' : 'userB msg-text'}>
                                        {msg[1]}
                                    </div>
                                </div>)
                            }):''
                        }
                    </div>
                    <div ref={msgEnd} />
                    {isMobile ? 
                        <div id="mobile-chat-input">
                            <textarea onKeyDown={submit} id="chat-text" type="text" placeholder="Escribe un mensaje" />
                            <button onClick={send} id="chat-send" type="button"><span className="material-icons notranslate">send</span></button>
                        </div>:''
                    }
                </div>
            </div>
            {!isMobile ? 
                <div id='chat-input-space'/>
            : ''
            }
                <div id="chat-input-div">
                    {!isMobile ? 
                        <div id="chat-input">
                            <textarea onKeyDown={submit} id="chat-text" type="text" placeholder="Escribe un mensaje" />
                            <button onClick={send} id="chat-send" type="button"><span className="material-icons notranslate">send</span></button>
                        </div>:''
                    }
                </div>
            {isMobile ? '':''}
        </>
    : '')

}

const ChatNotActive = ({user, setActive, lastMsg, see, setSee}) => {
    const {userState, token} = useUser();

    const openChat = () => {
        setActive(true);
        fetch('/api/chatSee', {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'auth-token': token
            },
            body: JSON.stringify({
                see: true,
                userA: userState.id,
                userB: user.id
            })
        })
    }

    return(
        <div className="chat" onClick={openChat}>
            <a href={user ? '/user/'+user.user : ''}>
                <div className="chat-photo">
                    <img className="chat-pic" src={user?.profilePic} alt={user?.user} />
                </div>
            </a>
            <div className="chat-body">
                <a className="a-normalize underline" href={user ? '/user/'+user.user : ''}>
                    <div className={`chat-user notranslate`}>
                        {user?.user}{!see ? <span className="new-msg" />: ''}
                    </div>
                </a>
                <div className={`chat-preview`}>
                    {lastMsg}
                </div>
            </div>
        </div>
    )

}

export default Chat;