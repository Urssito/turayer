import React, {  useContext, useMemo, useState } from "react";
import { useEffect } from "react";

export const MobileContext = React.createContext()

export function MobileProvider(props) {
    const [isMobile, setIsMobile] = useState(null);
    const [widthS, setWidthS] = useState('')

    useEffect(() => {
        const widthObs = new ResizeObserver((entries) => {
            if(entries[0].contentRect.width < 770)setWidthS('mobile')
            else {
                if(entries[0].contentRect.width < 1300){
                    if(entries[0].contentRect.width > 1100) setWidthS('mediumL')
                    else setWidthS('mediumS');
                }
                else setWidthS('large')
            }
        });
        widthObs.observe(document.body)
    }, [])


    const value = useMemo(() => {

        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if(/windows phone/i.test(userAgent)) setIsMobile(true);
        else if(/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) setIsMobile(true);
        else if(/android/i.test(userAgent))setIsMobile(true);
        else if(widthS === 'mobile') setIsMobile(true)
        else setIsMobile(false)
        
        return({
            isMobile,
            widthS
        });
    }, [isMobile, widthS]);

    return <MobileContext.Provider value={value}>
        {props.children}
    </MobileContext.Provider>
}

export const useMobile = () => {
    const context = useContext(MobileContext);
    if(!context){
        throw new Error('useContext must be in MobileContext provider');
    }
    return context;
}