import React, { useEffect, useState } from 'react'
import { useUser } from '../../Contexts/user.jsx'
import Aside from '../main/aside.jsx'
import Header from '../main/Header.jsx'
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import ErrorMsg from '../partials/error.jsx';
import {useTheme} from "../../Contexts/theme.jsx";
import Schema from '../main/schema.jsx';
import {useMobile} from '../../Contexts/mobile.jsx'

function EditProfile() {
    return <Schema Content={EditProfileContent} />
}

function EditProfileContent() {
    const {theme} = useTheme();
    const {isMobile} = useMobile();
    const {userState, token} = useUser();
    const [dim, setDim] = useState([]);
    const [cropper, setCropper] = useState();
    const [image, setImage] = useState();
    const [errors, setErrors] = useState([]);
    const [save, setSave] = useState(false);

    const getData = () => {
        if(document.getElementById('file').files.length){
            const cropSize = Math.round(cropper.cropper.cropBoxData.width);
            const percentSize = (cropSize * 100)/ cropper.cropper.containerData.width;
            const cropTop = Math.round(cropper.cropper.cropBoxData.top);
            const percentTop = (cropTop *100)/cropper.cropper.containerData.height;
            const cropLeft = Math.round(cropper.cropper.cropBoxData.left);
            const percentLeft = (cropLeft *100)/cropper.cropper.containerData.width;
            const imgDim = [
                Math.round(cropper.width*(percentLeft/100)),
                Math.round(cropper.height*(percentTop/100)),
                Math.round(cropper.width*(percentSize/100))
            ]
            setDim(imgDim)
        }
    }

    const change = (e) => {
        e.preventDefault();
        let files;
        if (e.dataTransfer) {
        files = e.dataTransfer.files;
        } else if (e.target) {
        files = e.target.files;
        }
        const reader = new FileReader();
        reader.onload = () => {
        setImage(reader.result);
        };
        reader.readAsDataURL(files[0]);
        const editor = document.getElementById('editor');
        editor.firstChild.setAttribute('id', 'cropper');
        editor.classList.remove('disabled');
        document.getElementById('cropper-save').classList.remove('disabled');
        document.getElementById('cropper-delete').classList.remove('disabled');
        editor.classList.remove('disabled');
        document.getElementById('cropper-save').classList.remove('disabled');
        document.getElementById('cropper-delete').classList.remove('disabled');
        getData();
    };

    const sendCropData = async (e) => {
        e.preventDefault();
        const form = document.forms[0];
        const formData = new FormData(form);
        console.log(form)
        if(save){
            formData.append('imgDim', dim);
        }else{
            document.getElementById('file')?.remove();
        }

        const saveLogo = document.querySelector('.loading-btn');
        saveLogo.setAttribute('id', 'loading');
        saveLogo.innerHTML = '';
        saveLogo.style.height = '20px';
        saveLogo.style.width = '20px';
        saveLogo.style['border-top'] = '4px solid #000';

        const res = await fetch('/api/profile/editsuccess',{
            method: 'PUT',
            body: formData,
            headers:{
                'auth-token': token
            }
        });
        const data = await res.json();
        if(data.errors) {
            setErrors([...data.errors]);
            saveLogo.removeAttribute('id');
            saveLogo.innerHTML = 'save';
            saveLogo.style['border-top'] = 'none';
            saveLogo.style.width = '24px';
        }
        else {
            const oldUser = await JSON.parse(JSON.stringify(userState));
            oldUser.user = data.user;
            oldUser.description = data.description;
            if(data.profilePicId)oldUser.profilePicId = data.profilePicId;
            window.location.pathname = `user/${data.user}`
        }
    }

    const cropperHide = (e) => {
        document.getElementById('editor').classList.add('disabled');
        document.getElementById('cropper-delete').classList.add('disabled');
        e.target.classList.add('disabled');
        setSave(true);
    }

    const cropperRemove = (e) => {
        document.getElementById('cropper-save').classList.add('disabled');
        document.getElementById('editor').classList.add('disabled');
        e.target.classList.add('disabled');
        document.getElementById('file').value = ''
        setSave(false);
    }

    useEffect(() => {

    })

    return(
        <>
            {errors.length ? <ErrorMsg errors={errors} />: ''}
            <div className={isMobile ? 'mobile-top-bar' : 'top-bar'}>
                <span className="back-btn material-icons notranslate" onClick={()=>{window.history.back()}}>
                    arrow_back
                </span>
                Editar perfil
            </div>
            <div className='top-bar-space' />
            <div className={`edit-profile-div `}>

                <form id="formFile">

                    <div className="form-group edit-profile-group">
                        <span className="edit-profile-element">Cambiar nombre de usuario</span>
                        <input type="text" name="user" placeholder="usuario" defaultValue={userState?.user} />
                    </div>

                    <div className="form-group edit-profile-group">
                        <div className="edit-profile-file-form">
                            {/*<!-- cut image scripts -->*/}

                            <link href="/css/cropper.css" type='text/css' rel="stylesheet" />
                            <script src="/javascript/cropper.js" />
                            {/*<!-- input -->*/}
                            <span className="edit-profile-element" id="edit-profile-title-porfilePic">Cambiar foto de Perfil</span>
                            <div className="preview-div">
                                {/*<!-- Preview -->*/}
                                <div id="editor" className='disabled' onClick={getData}>
                                    <Cropper
                                        src={image}
                                        style={{ height: '100%', maxWidth: '100%' }}
                                        // Cropper.js options
                                        guides={false}
                                        aspectRatio={1}
                                        autoCropArea={0}
                                        toggleDragModeOnDblclick={false}
                                        zoomOnWheel={false}
                                        background={false}
                                        ref={instance => {
                                            setCropper(instance)
                                        }}
                                    />
                                </div>
                                <input onChange={change} id="file" className="edit-profile-element" accept="image/*" type="file" name="image" />
                                <div id="div-editor-buttons">
                                    <input value='Guardar' type='button' id='cropper-save' className={`disabled edit-profile-btn-body `} onClick={cropperHide} />
                                    <label id='cropper-search' htmlFor="file" className={`editor-btn `}>
                                        <div className="edit-profile-btn-body">
                                            <span className="material-icons notranslate">
                                                file_upload
                                            </span>
                                            Examinar
                                        </div>
                                    </label>
                                    <input value='Borrar' type='button' id='cropper-delete' className={`disabled edit-profile-btn-body `} onClick={cropperRemove} />
                                </div>
                                
                            </div>
                        </div>
                    </div>

                    <div className="form-group edit-profile-group">
                        <span className="edit-profile-element">Descripción</span>
                        <textarea className="edit-profile-element" name="description" defaultValue={userState?.description} cols="60" rows="5" placeholder="Cuentanos de ti..."/>
                    </div>

                    <div onMouseEnter={() => {
                        if(dim.length === 0 && document.querySelector('#file').files.length)getData();
                    }} onClick={sendCropData} className="form-group edit-profile-btn-div">
                        <div className="edit-profile-btn-body">
                            <span className="loading-btn material-icons notranslate">
                                save
                            </span>
                            Guardar
                        </div>
                    </div>

                </form>

            </div>
        </>
    )
}

export default EditProfile