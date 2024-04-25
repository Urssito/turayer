import React, {useEffect, useState} from "react";
import Publication from "./publication.jsx";
import Aside from "../main/aside.jsx";
import Header from "../main/Header.jsx";
import Loading from '../partials/loading.jsx'
import { useTheme } from "../../Contexts/theme.jsx";
import Schema from "../main/schema.jsx";

const PubPage = () => {
    return <Schema Content={PubPageContent} />
}

const PubPageContent = () => {
    const {theme} = useTheme();
    const [pub, setPub] = useState(null);
    const [loading, setLoading] = useState(true);

    const getPub = async() => {
        const pub = window.location.pathname.split('/').pop();
        const res = await fetch('/api/getPubs', {
            method: 'get',
            headers: {
                'content-type': 'application/json',
                'pub': `id-${pub}`
            }
        });
        const data = await res.json();
        if(data){
            setPub(data);
            setLoading(false);
            console.log(data)
        };
    };

    useEffect(() => {
        getPub();
        console.log(pub)
    }, [])
    
    if(!loading){
        return(
            <>
                <div className={`top-bar`}>
                    <div className="back-btn-div" onClick={()=>{window.history.back()}}>
                        <span className="back-btn material-icons notranslate">
                            arrow_back
                        </span>
                    </div>
                    <span className='top-bar-title'>publicacion de {pub[0]?.user}</span>
                </div>
                <div className="top-bar-space" />
                {pub ? <Publication pubs={pub} />:''}
            </>
        )
    }else{
        return <Loading />
    }
};

export default PubPage;