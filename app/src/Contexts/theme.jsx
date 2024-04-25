import React, {  useContext, useMemo, useState } from "react";

export const ThemeContext = React.createContext()

export function ThemeProvider(props) {
    const [theme, setTheme] = useState('light');

    const value = useMemo(() => {
        return({
            theme
        });
    }, [theme]);

    return <ThemeContext.Provider value={value}>
        {props.children}
    </ThemeContext.Provider>
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if(!context){
        throw new Error('useContext must be in Theme provider');
    }
    return context;
}