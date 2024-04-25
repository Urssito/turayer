import React, { useEffect, useState } from "react";
import { useUser } from "../../Contexts/user.jsx";
import ErrorMsg from './error.jsx';
import { useTheme } from "../../Contexts/theme.jsx";
import { useMobile } from "../../Contexts/mobile.jsx";

const Unlogged = () => {
    const [form, setForm] = useState('none')

    useEffect(() => {
        window.addEventListener('click', (e) => {
            console.log(e.target)
            if(e.target.id === 'login-form-bg'){
                setForm('none');
            }
        })
    }, [])

    if(form == 'none'){
    return(
        <div id='login-bar'>
            <span className="notranslate" id="login-bar-title">
                Luccagram
            </span>
            <div id="login-bar-btns">
                <span onClick={() => {setForm('login');}} id="login-btn">
                    Iniciar Sesión
                </span>
                <span onClick={() => {setForm('signup')}} id="signup-btn">
                    Registrarse
                </span>
            </div>
        </div>
    )}else{
        return (
            <div id='login-form-bg'>
                <Form form={form} setForm={setForm}/>
            </div>
        )
    }
}

const Form = ({form, setForm}) => {
    const {isMobile} = useMobile(); 
    const {theme} = useTheme();
    const {userState} = useUser();
    const [errors, setErrors] = useState([])

    useEffect(() => {
        if(userState && userState.errors) setErrors(userState.errors);
    }, [userState]);

    return (
        <div id={!isMobile ? "login-form-div" : "mobile-login-form-div"}>
            {errors ? <ErrorMsg errors={errors} /> : '' }
                {!isMobile ? <div className="notranslate" id="title">Luccagram</div>:
                <>
                    <div className="notranslate" id="title">Luccagram</div>
                    <span onClick={() => {setForm('none')}} id="mobile-close-btn" className="material-icons notranslate">close</span>
                </>
            }
            {(() => {
                console.log(form)
                switch(form){
                    case 'login':
                        return <Login setErrors={setErrors} />
                    case 'signup':
                        return <SingUp setErrors={setErrors} />
                    case 'forgetPass':
                        return <ForgetPass setErrors={setErrors} />

                }
            })()}
        </div>
    )
}

const Login = ({setErrors}) => {
    const {isMobile} = useMobile(); 

    async function logging(e){
        e.preventDefault()

        const remember = document.getElementsByName('remember')[0];
        const user = document.getElementsByName('user')[0].value;
        const password = document.getElementsByName('password')[0].value;

        const res = await fetch(`/api/login`,{
            method: 'POST',
            body: JSON.stringify({
                user,
                password
            }),
            headers: {
                'content-type': 'application/json'
            }
        })
        const data = await res.json();
            if (data.errors){
                setErrors(data.errors)
            }else{
                console.log(remember.checked)
                if(!remember.checked){
                    document.cookie += `auth-token=${data.token}; path=/`
                }else{
                    document.cookie += `auth-token=${data.token}; max-age=${60*60*24*365}; path=/`
                }
                window.location.reload();
            }
    }

    return (
           
        <div id="login-form">
            <input type="text" placeholder="usuario" name="user" id="username" className={!isMobile ? 'form-input': 'mobile-form-input'} autoFocus />
            <input type="password" placeholder="contraseña" name="password" id="password" className={!isMobile ? 'form-input': 'mobile-form-input'} />
            <input onClick={logging} type="submit" value="Ingresar" id="submit" className={!isMobile ? 'form-input': 'mobile-form-input'} />
            <span id="remember-div" className={!isMobile ? 'form-input': 'mobile-form-input'} >
                <input type="checkbox" name="remember" id="remember" />
                <label htmlFor="remember"> Mantener sesión iniciada </label>
            </span>
            <span id="forgetPass" onClick={() => {/*setForgetPass(!forgetPass)*/}} className="a-normalize">¿Olvidaste tu contraseña?</span>
        </div>


    )

}

const SingUp = ({setErrors}) => {
    const {isMobile} = useMobile(); 

    const signUp = async (e) => {
        e.preventDefault();
        
        setErrors([]);
        
        const user = document.getElementsByName('user')[0].value;
        const password = document.getElementsByName('password')[0].value;
        const confirmPassword = document.getElementsByName('confirm-password')[0].value;
        const email = document.getElementsByName('email')[0].value;

        const res = await fetch(`/api/signup`,{
            method: 'POST',
            body: JSON.stringify({
                user, 
                password,
                confirmPassword,
                email
            }),
            headers: {
                'content-type': 'application/json'
            }
        });
        const data = await res.json();

        if(data.errors){
            setErrors(data.errors);
        }else{
            document.cookie += `auth-token=${data.token}; max-age=${60*60*24*365}; secure`;
            window.location.href = '/';
        }

    }

    return (
        <div id="login-form">
            <input type="text" placeholder="usuario" name="user" id="username" className={!isMobile ? 'form-input': 'mobile-form-input'} autoFocus />
            <input type="password" placeholder="contraseña" name="password" id="password" className={!isMobile ? 'form-input': 'mobile-form-input'} />
            <input type="password" placeholder="confirmar contraseña" name="confirm-password" id="confirm-password" className={!isMobile ? 'form-input': 'mobile-form-input'} />
            <input type="text" placeholder="e-mail" name="email" id="email" className={!isMobile ? 'form-input': 'mobile-form-input'} />
            <input onClick={signUp} type="submit" value="Registrarse" id="submit" className={!isMobile ? 'form-input': 'mobile-form-input'} />
        </div>
    )
}

const ForgetPass = () => {
    const {isMobile} = useMobile(); 
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState([]);
    const [email, setEmail] = useState([]);
    const [changePassword, setChangePassword] = useState(false);
    const [code, setCode] = useState(null)

    const recoverPass = async(e) => {
        e.preventDefault();

        const email = document.getElementsByName('recover-pass')[0].value;

        const res = await fetch('/api/recoverPass', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({email})
        });
        const data = await res.json();
        if(!data.errors){
            alert('listo pa')
            setSuccess(true)
            setEmail(email);
        }else{
            setErrors(data.errors)
        }
    }

    const confirmCode = async(e) => {
        e.preventDefault();
        const code = document.getElementById('code').value;
        const res = await fetch('/api/confirmCode', {
            method: 'post',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({code, email}),
        });
        const data = await res.json();
        if(!data.errors){
            setCode(code)
            setChangePassword(true)
        }else{
            setErrors(data.errors)
        }
    }

    const confirmPassword = async(e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const res = await fetch('/api/changePassword', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                password,
                confirmPassword,
                email,
                code
            })
        });
        const data = await res.json();
        if(!data.errors){
            window.location.href = '/';
        }else{
            setErrors(data.errors)
        }
    }

    return (
            <div id="login-form">
                {errors ? <ErrorMsg errors={errors} /> : '' }
                {!success ? 
                    <>
                        <span id="recover-text">Para recuperarla necesitamos tu email</span>
                        <input type="text" name="recover-pass" className={!isMobile ? 'form-input': 'mobile-form-input'} placeholder="email" />
                        <input onClick={recoverPass} type="submit" id="submit" className={!isMobile ? 'form-input': 'mobile-form-input'} value="Enviar" />
                    </>: !changePassword ?
                    <>
                        <span id="success-text">Se envió un correo a {email}, revisa tu casilla de correo y escribe el codigo que se te envio abajo</span>
                        <input type="text" defaultValue={''} id="code" name="recover-pass" className={!isMobile ? 'form-input': 'mobile-form-input'} placeholder="Código" autoFocus/>
                        <input onClick={confirmCode} type="submit" id="submit" className={!isMobile ? 'form-input': 'mobile-form-input'} value="Enviar" />
                    </>:
                    <>
                        <input type="password" id="password" className={!isMobile ? 'form-input': 'mobile-form-input'} placeholder="contraseña nueva" />
                        <input type="password" id="confirm-password" className={!isMobile ? 'form-input': 'mobile-form-input'} placeholder="confirmar contraseña" />
                        <input onClick={confirmPassword} type="submit" id="submit" className={!isMobile ? 'form-input': 'mobile-form-input'} value="Enviar" />
                    </>
                }
            </div>
    )
} 

export default Unlogged;