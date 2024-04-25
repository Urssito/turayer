import React, { useEffect, useState } from "react";
import { NewPub } from "../publications/newPublications.jsx";
import Publication from "../publications/publication.jsx";
import Header from './Header.jsx'
import "regenerator-runtime";
import Aside from "./aside.jsx";
import Loading from "../partials/loading.jsx";
import { useUser } from "../../Contexts/user.jsx";
import {getPubs} from "../../modules/getPubs.jsx";
import {useTheme} from "../../Contexts/theme.jsx";
import {useMobile} from "../../Contexts/mobile.jsx";
import Schema from "./schema.jsx";

function Home() {

    return(
        <Schema Content={HomeContent} />
    )
        
}

const HomeContent = () => {
    const {userState, token} = useUser();
    const [pubs, setPubs] = useState();
    const [loading, setLoading] = useState(true);
    const {isMobile} = useMobile();

    useEffect(async() => {
        setPubs(await getPubs());
    }, [userState]);

    useEffect(async() => {
        if(pubs){
            setLoading(false);
        }
    }, [pubs])

    if(!loading){
        return (
            <>
                <div className={isMobile ? 'mobile-top-bar top-bar' : 'top-bar'}>
                    {token ? 'Inicio': <div className="notranslate" id='title'>Luccagram</div>}
                </div>
                <div className="top-bar-space" />
                <div id="home-body">
                    <NewPub setPubs={setPubs} />
                    <Publication pubs={pubs}/>
                </div>
                <div id="bottom-bar-space" />
            </>
        )
    }else{
        return <Loading />
    }

}

export default Home