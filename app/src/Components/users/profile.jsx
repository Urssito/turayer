import React, { useEffect, useState } from 'react'
import { useSocket } from '../../Contexts/socket.jsx';
import {useUser} from '../../Contexts/user.jsx'
import Loading from '../partials/loading.jsx';
import Publication from '../publications/publication.jsx'
import {getUser} from '../../modules/getUsers.jsx';
import { getPubs } from '../../modules/getPubs.jsx';
import {useTheme} from "../../Contexts/theme.jsx";
import Schema from '../main/schema.jsx';
import { useMobile } from '../../Contexts/mobile.jsx';
import { Link } from "react-router-dom"

function Profile() {
    return(
        <Schema Content={ProfileContent} />
    )
}

function ProfileContent() {
    const {theme} = useTheme();
    const {socket} = useSocket();
    const {isMobile} = useMobile();
    const {userState, token, setUserState} = useUser();
    const [user, setUser] = useState(null);
    const [pubs, setPubs] = useState(null)
    const [loading, setLoading] = useState(true)
    const [followed, setFollowed] = useState(null);
    const [errors, setErrors] = useState(null);
    const [openLogout, setOpenLogout] = useState(false);

    const gettingUser = async () => {
        const result = await getUser(window.location.pathname);
        if(result.errors){
            setErrors(result.errors);
        }else{
            setUser(result);
            setPubs(await getPubs(result.id));
        };
    }

    const getFollowers = async() => {
        const res = await fetch('/api/getFollow',{
            method: 'GET',
            headers: {
                'auth-token':token,
                'user': user.user
            }
        });
        const data = await res.json();
        setFollowed(data.followed);
    }

    const follow = async () => {
            const res = await fetch('/api/follow', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({
                    user: user.user
                })
            });
            const data = await res.json();
            setFollowed(data.followed);
            if(data && !followed){
                setUserState({...userState, follows: [...userState.follows, data.userToFollow]})
                const notiData = {
                    transmitter: userState.user+'-'+userState.profilePic,
                    title: 'follow',
                    description: `${userState.user} te siguió!`,
                    receiver: user.id,
                    link: '/user/'+userState.user
                }
                fetch('/api/newNoti', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'auth-token': token
                    },
                    body: JSON.stringify(notiData)
                })
                .then(resNoti => resNoti.json())
                .then(dataNoti => {
                    if(dataNoti)socket.emit('notification', notiData);
                })
            }else {

            } //setUserState({...userState, follows: userState.follows.slice(0,-1)})
            
    };

    useEffect(async() => {
        if(!user)await gettingUser();
        if(followed === null && user !== null && userState){
            await getFollowers();
            setLoading(false);
        }
    }, [user, userState])

    if(!loading){
        return (
            <>
                {openLogout ? <Logout setOpenLogout={setOpenLogout} /> : ''}
                <div className={isMobile ? 'mobile-top-bar' : 'top-bar'}>
                    <div className="back-btn-div" onClick={()=>{window.history.back()}}>
                        <span className="back-btn material-icons notranslate">
                            arrow_back
                        </span>
                    </div>
                    <span className='top-bar-title'>Perfil de {user.user}</span>
                </div>
                <div className="top-bar-space" />
                <div className="profile-header">
    
                    <div className="profile-header-div">
                        <img className="profilePic" src={user ? user.profilePic : ''} alt={user.user} />
                        <div id="profile-header-data">
                            <div className={isMobile ? "mobile-username-text username-text" : "username-text"}>
                                {user.user}
                                <div id={isMobile ? 'mobile-profile-opts':'profile-opts'}>
                                    {user.user === userState.user ? 
                                    <Link to="/profile/edit" id={isMobile ? 'mobile-edit-profile-button' : 'edit-profile-button'} className="mobile-profile-btn a-normalize">
                                        {!isMobile ? 'Editar perfil' :
                                        <span className='material-icons gicon notranslate'>
                                            settings
                                        </span>
                                        }
                                    </Link> : <Follow follow={follow} followed={followed} />}
                                    {user.user === userState.user && isMobile ? 
                                        <a id='mobile-logout' onClick={()=>{setOpenLogout(true)}} className="mobile-profile-btn a-normalize">
                                            <span className='material-icons gicon notranslate'>
                                                logout
                                            </span>
                                        </a>:''
                                    }
                                </div>
                            </div>
                            <div style={isMobile ? {maxWidth: '260px'}: {maxWidth: '375px'}} className="profile-description">
                                {user.description}
                            </div>
                        </div>
                    </div>
                </div>
                            {/*<!-- user's publications -->*/}
                <div className="publications-div">
                    {pubs ? 
                        <Publication pubs={pubs} /> :
                        <div className="card mx-auto">
                            <div className="card-body">
                                <p className="lead">No publicaste nada :(</p>
                                <Link to="/upload" className="btn btn-success btn-block">Publica algo!</Link>
                            </div>
                        </div>
                    }
                </div>
                {isMobile ? <div id="bottom-bar-space" /> : ''}
            </>
        )
    }else{
        return <Loading />
    }
}

const Follow = ({follow, followed}) => {
    const {isMobile} = useMobile();
    const {theme} = useTheme();

    if(!followed){
        return(
            <button onClick={follow} type="button" className={`a-normalize ${isMobile ? 'mobile-':''}follow-btn`} id='follow'>
                <span className="material-icons notranslate">
                    person_add
                </span>
                Seguir
            </button>
        )
    }else{
        return(
            <button onClick={follow} type="button" className={`a-normalize ${isMobile ? 'mobile-':''}follow-btn`} id='followed'>
                <span className="material-icons notranslate">
                    done
                </span>
                siguiendo
            </button>
        )
    }
}

const Logout = ({setOpenLogout}) => {
    const {socket} = useSocket();
    const {userState, token} = useUser();
    const {theme} = useTheme();

    const logout = () => {
        socket.emit('disconnected', userState.user)
        document.cookie.split(';').map(c => {
            if(c.indexOf('auth-token') !== -1){
                document.cookie = 'auth-token=;max-age=0;path=/';
                localStorage.removeItem('user')
            }
        });
        window.location.pathname='/'
    };

    useEffect(() => {
        window.addEventListener('click', (e) => {
            e.preventDefault();
            if(e.target.id === 'login-form-bg')setOpenLogout(false);
        })
    }, [])

    return(
        <div id='login-form-bg'>
            <div id="mobile-logout-menu" className={theme === 'light' ? 'bg-light' : 'bg-dark'}>
                ¿Seguro que desea cerrar sesión?
                <div id="mobile-logout-opts">
                    <div id="mobile-logout-cancel" onClick={()=>{setOpenLogout(false)}}>
                        Cancelar
                    </div>
                    <div id="mobile-logout-confirm" onClick={logout}>
                        Cerrar Sesión
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile