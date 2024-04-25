import React, { useState } from 'react';
import { useUser } from '../../Contexts/user.jsx';
import { useEffect } from 'react';
import Loading from '../partials/loading.jsx'
import {useTheme} from "../../Contexts/theme.jsx";
import Schema from '../main/schema.jsx';

function Notifications() {
    return <Schema Content={NotificationsContent} />
}

function NotificationsContent() {
    const {userState, token} = useUser();
    const [notifications, setNotifications] = useState(['']);
    const [loading, setLoading] = useState(true);
    
    const getNotis = async() => {
        const res = await fetch(`/api/getNotifications`,{
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'auth-token': token,
                'id': userState.id
            }
        });await res.json().
        then((data) => {
            setNotifications(data);
            setLoading(false);
        })
    }

    const sawNoti = async() => {
        fetch('/api/sawNoti', {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'auth-token': token,
            },
            body:JSON.stringify({
                user: userState.id
            }),
        });
    };

    useEffect(() => {
        if(userState){
            getNotis();
            sawNoti();
        }
        document.getElementById('new-notification-div')?.classList.add('disabled')
    }, [userState])

    if(!loading){
    return (
        <>
            <div className={`top-bar`}>
                <div className="back-btn-div" onClick={()=>{window.history.back()}}>
                    <span className="back-btn material-icons notranslate">
                        arrow_back
                    </span>
                </div>
                <span className='top-bar-title'>Notificaciones</span>
            </div>
            <div className="top-bar-space" />
            <div id="notifications">
                <Notification notifications={notifications}/>
            </div>
        </>
    )}else{
        return <Loading />
    }
}

const Notification = ({notifications}) => {

    const goNoti = (link) => {
        window.location = link
    };
    return(
        <div id='Notification'>
            {
                notifications.map((noti,i) => (
                    <div onClick={()=>{goNoti(noti.link)}} key={'noti'+i} className='noti-card'>
                        <div className="noti-content">
                            <div className="noti-title">
                                <span className="material-icons notranslate noti-icon">
                                    {noti.title === 'like' ? 'favorite': (noti.title === 'newPub' ? 'notifications': 'person_add')}
                                </span>
                                <a className='a-normalize underline notranslate' href={`/user/${noti.transmitter[0].split('-')[0]}`}>
                                    <img className='noti-pic' src={`${noti.transmitter[0].split('-')[1]}`} alt="" />
                                    {noti.transmitter[0].split('-')[0]}
                                </a>
                            </div>
                            <div className="noti-body">
                                {noti.description}
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default Notifications;