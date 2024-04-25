import React, { useState } from 'react'
import ErrorMsg from '../partials/error.jsx';

function SignUp() {
    const [errors, setErrors] = useState([])

    const signUp = async (e) => {
        e.preventDefault()
        
        setErrors([])
        const {user, password, confirmPassword, email} = document.forms[0];

        const res = await fetch(`/api/signup`,{
            method: 'POST',
            body: JSON.stringify({
                user: user.value, 
                password: password.value,
                confirmPassword: confirmPassword.value,
                email: email.value
            }),
            headers: {
                'content-type': 'application/json'
            }
        });
        const data = await res.json();

        if(data.errors){
            setErrors(data.errors);
        }else{
            document.cookie = "auth-token=" + data.token + ";SameSite=None";
            window.location.href = process.env.REACT_APP_HOST;
        }

    }

    return (
        <div className="row">
            {errors ? <ErrorMsg errors={errors} /> : '' }
            <div className="col-md-4 mx-auto">
                <div className="card">
                    <div className="card-header">
                        Registro
                    </div>
                    <div className="card-body">
                        <form>
                            <div className="form-group">
                                <input type="text" name="user" className="form-control" placeholder="usuario" />
                            </div>
                            <div className="form-group">
                                <input type="password" name="password" className="form-control" placeholder="contraseña"/>
                            </div>
                            <div className="form-group">
                                <input type="password" name="confirmPassword" className="form-control" placeholder="confirme su contraseña"/>
                            </div>
                            <div className="form-group">
                                <input type="email" name="email" className="form-control" placeholder="correo" />
                            </div>
                            <div className="form-group">
                                <button onClick={signUp} type="submit" className="btn btn-primary btn-block">
                                    Registrarse
                                </button>
                            </div>
                        </form>
                        <div id="signup-op-divisor">
                            <div className='signup-op-line'></div>
                            <div>o</div>
                            <div className='signup-op-line'></div>
                        </div>
                    </div>
                    <div id='signup-op-div'>
                        <button>Gluglu</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp