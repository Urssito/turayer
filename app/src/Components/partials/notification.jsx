import React, {useState} from "react";
import {useTheme} from "../../Contexts/theme.jsx";

export default function Notification ({notification}) {
    const {theme} = useTheme();

    const close = () => {
        document.getElementById('notify-position').classList.add('disabled');
    }


    if(notification){
        return(
            <div className="" onAnimationEnd={close} id='notify-position'>
                <div id="notify">
                    <div id='notify-container'>
                        <a className="a-normalize underline" href={notification.link}>
                            <div id="notify-content">
                                <div id="notify-title">
                                    <img id="notify-photo" src={notification.profilePic} alt="user" />
                                    {notification.transmitter}
                                </div>
                                <div id="notify-body">
                                    {notification.description.length > 42 ? 
                                    notification.description?.slice(0,42)+'...' :
                                    notification.description}
                                </div>
                            </div>
                        </a>
                        <div id="notify-close" onClick={close}>
                            <img src="/img/main/close.svg" alt="" srcset="" />
                        </div>
                    </div>
                    <span id="notify-timing"></span>
                </div>
            </div>
        )
    }else{
        return <div id="notify-position" className="disabled"></div>
    }
    

}