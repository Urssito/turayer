import React, { useState } from "react";
import { useSocket } from "../../Contexts/socket.jsx";
import { useUser } from "../../Contexts/user.jsx";
import ErrorMsg from "../partials/error.jsx";
import {getPubs} from "../../modules/getPubs.jsx";
import Picker from "emoji-picker-react";
import { useMobile } from "../../Contexts/mobile.jsx";

function NewPub({setPubs}) {
    const {isMobile} = useMobile();
    const {userState, token} = useUser();
    const {socket} = useSocket();
    const [errors, setErrors] = useState(null);

    const sendPub = async () => {
        const {publication} = document.forms[0];
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'auth-token': token
            },
            body: JSON.stringify({
                publication: publication.value
            })
        });
        res.json().then(async(data) => {
            if(data.errors){
                setErrors(data.errors);
            }else{
                socket.emit('notification', {
                    transmitter: userState.user+'-'+userState.profilePic,
                    title: 'newPub',
                    description: publication.value,
                    receiver: userState.followers,
                    link: '/publication/'+data.pubID
                });
                document.getElementById('textareaNewPub').value = '';
                setPubs(await getPubs());
            }
        })
    }

    const emojiActive = (e, emojiObj) => {
        document.querySelector('textarea').value += emojiObj.emoji;
    };
    
    const emojiActivated = () => {
        document.getElementsByClassName('skin-tones-list')[0].remove();
        const emojiDisplay = document.getElementById('emoji-display');
        emojiDisplay.classList.toggle('disabled');
        const emojiDim = document.getElementById('emoji-trigger').getBoundingClientRect();
        const emojiPos = document.getElementsByClassName('emoji-picker-react')[0];
        emojiPos.style.top =  emojiDim.top+'px'
        emojiPos.style.left =  emojiDim.left+'px'
    }

    const emojiDisable = (e) => {
        console.log(e.target.id)
        if(e.target.id === 'emoji-display' || e.target.id === 'aside')document.getElementById('emoji-display').classList.add('disabled')
    }

    const limitText = () => {
        const text = document.getElementById('textareaNewPub');
        const limit = 1000
        if(text.value.length > limit){
            setErrors(['tu publicación es demasiado larga'])
            text.value = text.value.slice(0,limit)
        }
    }
    if(token){
        return(
            <div id="new-pub">
                {errors ? <ErrorMsg errors={errors} /> : ''}
                <form>
                    <div id="header-new-pub">
                        <div id="prof-pic-new-pub">
                            <img className="profilePhoto" src={userState ? userState.profilePic : ''} alt="urssito"></img>
                        </div>
                        <div id="textarea-new-pub">
                            <textarea onChange={limitText} placeholder="¿Qué estás pensando?" name="publication" id="textareaNewPub"></textarea>
                        </div>
                    </div>
                    <div id="nav-new-pub-div">
                        <div id="nav-new-pub">
                            <div id="btn-new-pub">
                                { !isMobile ?
                                    <button type="button" id="emoji-trigger" className="btnNewPub" onClick={emojiActivated}>
                                        <span className="material-icons notranslate">
                                            emoji_emotions
                                        </span>
                                    </button> :''
                                }
                            </div>
                            <div id="emoji-display" onClick={emojiDisable} className="disabled"><Picker onEmojiClick={emojiActive} /></div>
                            <div id="sbmt-new-pub">
                                <div id="sbmtNewPub" onClick={sendPub} >
                                    Subir
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <script type="module" src="/javascript/emojiBtn.js"></script>
            </div>
        )
    }else{return ''}
}

export {NewPub}