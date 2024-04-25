import React from "react";
import {useMobile} from '../../Contexts/mobile.jsx'
import {useUser} from '../../Contexts/user.jsx'
import Header from "./Header.jsx"
import Aside from "./aside.jsx"
import Unlogged from "../partials/unlogged.jsx";
import { useState } from "react";

const Schema = ({Content}) => {
    const {isMobile, widthS} = useMobile();
    const {token} = useUser();

    return(
        <div id="app-body">
            {!isMobile ? 
                <header id={widthS === 'large' ? '' : 'medium'}>
                    <Header />
                </header>
                :''
            }
        <div id={isMobile ? 'mobile-content' : 'content'}>
            <div id="content-pos">
                <div id="center">
                    <Content />
                </div>
            </div>
        </div>
        {(() => {
            if(!isMobile){
                if(widthS !== 'mediumS'){
                    return(
                        <footer>
                            <Aside />
                        </footer>
                    )
                }else{
                    return <footer id='void'><div id="aside" /></footer>
                }
            }
        })()}
        {(() => {
            if(token && isMobile){
                return(
                    <div id="mobile-header">
                        <Header />
                    </div>
                )
            }
        })()}
        {!token ? <Unlogged /> : ''}
        </div>
    )
}

export default Schema;