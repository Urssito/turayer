import React, { useState } from 'react'
import { useEffect } from 'react';
import { useUser } from '../../Contexts/user.jsx'
import { useMobile } from '../../Contexts/mobile.jsx'
import Chat from '../users/chat.jsx';
import Loading from '../partials/loading.jsx';

function Aside() {
    const {userState, token} = useUser();
    const {isMobile} = useMobile();
    const [chats, setChats] = useState(null);
    const [timeOutID, setTimeOutID] = useState()

    useEffect(() => {
        if(userState){
            chatList();
        }
    }, [userState]);

    const chatList = () => {
        if(userState.followers){
            const res = userState.followers.filter(f => {
                return userState.follows.includes(f)
            });
            res?.slice(0,10);
            setChats(res);
        }
    }

    const searching = () => {
        fetch('/api/search', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                query: document.getElementById('search-input').value,
            })
        })
        .then((res) => (res.json()))
        .then(results => {
            const input = document.getElementById('search-input');
            const resultsDiv = document.getElementById('results');
            if(results){
                if(results.length != 0){
                    resultsDiv.setAttribute('style', 'border:1px solid #888;');
                }else{
                    resultsDiv.setAttribute('style', 'border:none;');
                }
                resultsDiv.innerHTML ='';
                results.map((resultRaw) => {
                    const [user, pic] = resultRaw.split('-');
                    const result = document.createElement('a');
                    result.classList.add('result')
                    result.classList.add('a-normalize')
                    result.setAttribute('href', '/user/'+user)
                    result.innerHTML = `
                    <img src=${pic} class="result-pic noti-pic">
                    <span>${user}</span>
                    `;
                    resultsDiv.appendChild(result)
                });
            }
        });
    }

    const sendData = () => {
        if(typeof timeOutID === "number"){
            window.clearTimeout(timeOutID);
            setTimeOutID(undefined);
        }
        setTimeOutID(window.setTimeout(()=>{searching()}, 300));
    }

    useEffect(() => {
        window.addEventListener('click', (e) => {
            const closeArr = ['search-div','search-input','search-input-div','results'];
            if(!closeArr.includes(e.target.id)){
                const resultsDiv = document.getElementById('results')
                if(resultsDiv){
                    resultsDiv?.setAttribute('style', 'border:none;')
                    resultsDiv.innerHTML = '';
                }
            }
        });
    }, []);
    if (!isMobile) {
        return (
            <div id="aside">
                <div id="aside-pos">
                        <div id="search-div">
                            <div id="search-input-div">
                                <span className='material-icons notranslate'>search</span>
                                <input onKeyUp={sendData} id="search-input" type="text" placeholder="Buscar"/>
                            </div>
                            <div id="results"></div>
                        </div>
                        <div id="chats">
                            {chats ? chats.map((chat, i) => (
                                <Chat key={'chat-'+i} chatid={chat} />
                            )):token ? <Loading /> : ''}
                        </div>
                </div>
            </div>
        )
    }else return '';
}

export default Aside