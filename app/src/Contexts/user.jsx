import React, {useMemo, useContext, useState} from 'react';

const UserContext = React.createContext();

function UserProvider(props) {
    const [userState, setUserState] = useState(null);
    const [token, setToken] = useState('');

    const fetchUser = async() => {
        if(token && !userState){
            fetch('/api/authenticate',{
                headers: {
                    'auth-token': token,
                    'content-type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(data => {
                if(data.resUser) {
                    setUserState(data.resUser);
                }else{
                    document.cookie = 'auth-token=;secure;max-age=0;SameSite=None';
                }
            });
        }
           
    }

    const getToken = () => {
        const cookies = document.cookie.split(';');
        cookies.forEach(c => {
            if(c.includes('auth-token')){
                const auth = c.split('=').pop();
                setToken(auth);
            }
        })
    }


    const value = useMemo(() => {
        getToken();
        fetchUser();
        return ({
            userState,
            token,
            setUserState
        })
    }, [token, userState])

    return <UserContext.Provider value={value}>
        {props.children}
    </UserContext.Provider>

}

const useUser = () => {
    const context = useContext(UserContext);
    if(!context){
        throw new Error('useUser must be in UserContext provider');
    }
    return context;
}
export {useUser, UserProvider}