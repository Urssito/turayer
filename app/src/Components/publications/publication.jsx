import React, { useEffect, useState } from 'react'
import "regenerator-runtime";
import { useUser } from '../../Contexts/user.jsx';
import {useSocket} from '../../Contexts/socket.jsx'
import {useTheme} from '../../Contexts/theme.jsx'

function Publication ({pubs}){
    const {theme} = useTheme();
    const {userState, token} = useUser();

    if(pubs.length >= 1){
        return (
            <div id="div-publication">
                {
                    pubs.map((pub, i) => (
                        <div className='card-publication' key={pub._id}>
                            <h5 className="publication-header">
                                <div>
                                    <a href={'/user/' + pub.user} className={`user notranslate `}>
                                        <img className="profilePhoto" src={pub.profilePic} alt={pub.user} />
                                        {pub.user}
                                    </a>
                                </div>
                            </h5>
                            <div className="div-content">
                                <p className="publication-body">
                                    {pub.publication}
                                </p>
                            </div>
                            <div id="interactions">
                                <Like
                                i={i}
                                user={userState}
                                pubID={pub._id} 
                                likesArray={pub.likes}
                                usersPub={pub.userId}
                                token={token} />
                            </div>
                        </div>
                    ))
                }
            </div>
        )
    }else{
        return (
            <>
                <div id="no-pub">
                    <img id="no-pub-icon" href="/icons/save.svg"/>
                    No hay publicaciones para mostrar {':('}
                </div>
            </>
        )
    }
}

function Like({i, user, pubID, likesArray, token, usersPub}) {
    const {theme} = useTheme();
    const [liked, setLiked] = useState(null);
    const [likes, setLikes] = useState(likesArray.length);
    const {socket} = useSocket();

    const likeCheckPost = async () => {
            if(token){
            setLiked(!liked)
            liked ? setLikes(likes - 1) : setLikes(likes+1);
            const res = await fetch('/api/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({
                    pubID
                })
            });
            const data = await res.json();
            if(data.totalLikes.length > likes){
                setLikes(likes+1);
                setLiked(true);
                if(usersPub !== user.id){
                    const data = {
                        transmitter: user.user+'-'+user.profilePic,
                        title: 'like',
                        description: `${user.user} le dió like a una publicación tuya`,
                        receiver: usersPub,
                        link: `/publication/${pubID}`
                    }
                    fetch('/api/newNoti', {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                            'auth-token': token
                        },
                        body: JSON.stringify(data)
                    })
                    .then(res => res.json())
                    .then(resData => {
                        if(resData.status === 'ok'){
                            socket.emit('notification', data);
                        }
                    });
                }
            }else if(data.totalLikes.length < likes){
                setLikes(likes-1);
                setLiked(false);
            }
        }
    }

    const getLikes = () => {
        if(token && user?.likes){
            if(user.likes.includes(pubID)){
                setLiked(true)
            }else{
                setLiked(false)
            }
        }
    }
    
    useEffect(() => {
        if(liked === null)getLikes();
    }, [likes, liked, likesArray, user]);

    return(
        <div className="div-like">
            <input id={'likeBtn'+ i}
            className="likeBtn"
            name="like"
            type='checkbox'
            onClick={likeCheckPost}
            defaultChecked={liked}
            />
            <label htmlFor={'likeBtn'+i}>
                <i
                className={`material-icons notranslate disable-select heart-icon`}
                style={
                    liked
                    ? {color: '#f00'}
                    : theme === 'light' ? {color:'rgba(0,0,0,.5)'} : {color:'rgba(255,255,255,.5)'}
                }
                id={'heart-icon'+ i}
                >
                    {
                        liked ? 'favorite' : 'favorite_border'
                    }
                </i>
                <span
                    className='interaction-text disable-select'
                    id={'likeText'+ i}>{likes}
                </span>
            </label>
        </div>
    )
}

export default Publication