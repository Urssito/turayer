const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const { isAuthenticated } = require("../helpers/auth");

const userModel = require("../models/users");
const pubModel = require("../models/publications");
const notiModel = require("../models/notifications");
const chatModel = require("../models/chats");
const multer = require("multer");
const storage = require("../config/diskStorage");
const upload = multer({storage: storage});

router.post("/api/signup", async (req, res) => {

    const { user, password, confirmPassword, email } = req.body;
    const errors = []
    if(password && confirmPassword && password != confirmPassword){
        errors.push("las contraseñas no coinciden");
    }
    if(password && password.length < 4){
        errors.push("la contraseña debe tener mas de 4 caracteres");
    }
    if(!user){
        errors.push("debe ingresar un usuario");
    }
    if(!password){
        errors.push("debe ingresar una contraseña");
    }
    if(password && !confirmPassword){
        errors.push("debe confirmar su contraseña");
    }
    if(!email){
        errors.push("debe ingresar un correo");
    }
    if(errors.length > 0){
        res.status(401).json({errors});
    }else{
        const errors = [];
        let err = false;
        const emailUser = await userModel.findOne({email:email});
        const userUser = await userModel.findOne({user:user});
        if(emailUser || userUser){
            if(emailUser) errors.push("el email ya está en uso");
            if(userUser) errors.push("el nombre de usuario ya esta en uso");
            if(user.length > 16) errors.push('su usuario no debe tener mas de 16 caracteres')
            else if(description.length > 160) errors.push('su descripcion no debe tener mas de 160 caracteres')
            res.status(401).json({errors})
            err = true;
        }
        if(!err){
            const newUser = await new userModel({user: user.toLowerCase(), password, email}).save();
            newUser.password = await newUser.encryptPassword(password);
            newUser.save();
            let resUser = await JSON.parse(JSON.stringify(newUser));
            delete resUser['password'];
            const token = jwt.sign({
                auth: newUser.id,
            },'banana123',{expiresIn:'24h'})

            res.status(201).json({
                msg: 'usuario creado correctamente!',
                token
            });
        }
    }

});

router.post('/api/login', async (req, res) => {
    let {user, password} = req.body;
    const errors = [];
    user = user.toLowerCase();
    user = user.replace(/ /g, '')

    const userdb = await userModel.findOne({user: user.toLowerCase()});
    let resUser = null;
    let match = null;

    if(userdb){

        resUser = await JSON.parse(JSON.stringify(userdb));
        delete resUser['password'];
        delete resUser['_id'];
        resUser.id = userdb.id
        match = await bcrypt.compare(password, userdb.password);
    
    }else{
        errors.push('usuario o correo inexistente');
    }
    if(userdb && !match){
        errors.push('contraseña incorrecta');
    }
    
    if(errors.length > 0){
        res.json({errors})
    }
    else{

        const token = jwt.sign({
            auth: userdb.id
        },'banana123',{expiresIn:'24h'})

        res.json({status: 'ok', user: resUser, token})
    }

});

router.put("/api/profile/editsuccess", isAuthenticated, upload.single("image"), async (req,res) => {

    const { user, description, imgDim} = req.body;
    const errors = [];
    const userModel = require("../models/users");
    const publications = require("../models/publications");
    const actualUser = await userModel.findOne({id: req.user});
    let profilePic = actualUser.profilePhoto || '';

    // Profile Photo

    if(req.file && req.file.originalname !== '') {
        const ext = req.file.filename.split('.').pop();
        const originalFile = path.join(__dirname,'..','public','uploads','profilePhotos', req.file.filename);

        //save and crop image
        if(ext === 'jpg' || ext === 'jpeg' || ext === 'png'){
            if(fs.existsSync(originalFile)){
                console.log('cortando...')
                const rawData = imgDim.split(",");
                const data = rawData.map(elem => parseInt(elem,10));
                const outputImg = `profile${req.user}.${ext}`
                const imgDir = path.join(__dirname,'..','public','uploads','profilePhotos', outputImg);
                await sharp(originalFile).extract({left: data[0], top: data[1], width: data[2], height: data[2]}).toFile(imgDir)
                    .then(async() =>{
                        fs.unlinkSync(originalFile);
                        console.log("imagen cortada!");
                        profilePic = '/uploads/profilePhotos/'+outputImg;
                        await userModel.findByIdAndUpdate(req.user, {user, description, profilePic});
                        await publications.updateMany({userId: req.user},{user, profilePic});
                    }).catch(err => {
                        console.log(err);
                        errors.push('intente recortar dentro de la imagen');
                    });
    
            }
        }else{
            errors.push("El formato de imagen debe ser .jpg, .jpeg o .png");
            fs.unlinkSync(originalFile);
        }
    }else{
        if(user.indexOf(' ') === -1){
            if(user.length > 16) errors.push('su usuario no debe tener mas de 16 caracteres')
            else if(description.length > 160) errors.push('su descripcion no debe tener mas de 160 caracteres')
            else{
                await userModel.findByIdAndUpdate(req.user, {user, description});
                await publications.updateMany({userId: req.user},{user});
            }
        }
        else{
            errors.push('el usuario no debe contener espacios')
        }
    }

    
    if(errors.length > 0){
        res.json({errors})
    }else{
        res.json({user, description, profilePic})
    }
});

router.get("/api/users", async(req, res) => {

    const getUser = req.get('get-user');
    let resUser = null

    let urlParse = getUser.split("/");
    if(urlParse.length == 5){
        urlParse = urlParse.pop();
        const {user,description,profilePic,id} = await userModel.findById(userId);
        const resUser = {
            user: user.user,
            description: user.description,
            profilePic,
            id
        }
    }

    if(user){

        const pubs = await pubModel.find({ user: urlParse}).lean().sort({date: "desc"});
        res.json({ pubs, user });
    }else res.json({errors: "Usuario no encontrado."})
});

router.post('/api/follow', isAuthenticated, async (req,res) => {
    const {user} = req.body;
    let followed = null;

    const userdb = await userModel.findById(req.user);
    const userToFollow = await userModel.findOne({user});
    let follower = userToFollow.followers;
    let follow = userdb.follows;

    if(follow.includes(userToFollow.id)){
        for(let i = 0;i<follow.length;i++){
            if(follow[i] === userToFollow.id){
                follow.splice(i,1);
                break;
            }
        }
        for(let i = 0;i<follower.length;i++){
            if(follower[i] === req.user){
                follower.splice(i,1);
                break;
            }
        }
        followed = false;
    }else{
        follow.push(userToFollow.id);
        follower.push(req.user);
        followed = true;
    }

    userdb.follows = follow;
    userToFollow.followers = follower;
    userdb.save();
    userToFollow.save();

    res.json({followed, userToFollow: userToFollow.id})
})

router.get('/api/getFollow', isAuthenticated, async (req, res) => {
    const userdb = await userModel.findById(req.user);
    const user = req.get('user');
    const userToFollow = await userModel.findOne({user});
    
    if(userToFollow){
        if(userdb.follows.includes(userToFollow.id)){
            res.json({followed: true})
        }else{
            res.json({followed: false})
        }
    }
});

router.get('/api/verifyNewNotifications', isAuthenticated, async(req, res) => {
    const notidb = await notiModel.find({
        receiver: {$all: [req.user]},
        see: {$nin: [req.user]}
    });
    console.log(notidb)
    res.status(200).json({newNotis: notidb.length})
})

router.get('/api/getNotifications', isAuthenticated, async (req, res) => {
    notiModel.find({ receiver: {$all: [req.user]}}).sort({'date': -1}).limit(20).then(notis => {
        notis ? res.status(200).json(notis) : res.status(200).json(null);
    })
})

router.put('/api/sawNoti', isAuthenticated, async(req, res) => {
    const {user} = req.body;
    await notiModel.updateMany(
        {
            $and:[ {
                receiver: {$all: [user]}},
                {see: {$nin: [req.user]}}
            ]
        },
        {
            $push: {see: user}
        }
    );
    res.status(200).json({});
});

router.post('/api/newNoti', isAuthenticated, async(req, res) => {
    console.log('nueva notificacion')
    const newNoti = new notiModel(req.body);
    newNoti.save().then(() => {
        res.status(203).json({status: 'ok'})
    })
});

router.get('/api/getUser', async(req, res) => {
    let userId = req.get('user');
    let data = null;
    if(userId.split('-')[0] == 'id'){
        data = await userModel.findById(userId.split('-')[1]);
    }else{
        data = await userModel.findOne({user: userId});
    }
    if(data){
        const resUser = {
            user: data.user,
            description: data.description,
            profilePic: data.profilePic,
            id: data.id
        }
    
        res.status(200).json(resUser);
    }else{
        res.status(404).json({errors: ['usuario no encontrado']})
    }
});

router.get('/api/getChat',isAuthenticated, async(req, res) => {
    const userA = req.get('userA');
    const userB = req.get('userB');
    
    const chat = await chatModel.findOne({users: {$all: [userA, userB]}});

    chat ? res.status(200).json(chat) : res.status(404).json(null)
});

router.post('/api/sendMsg', isAuthenticated, async(req, res) => {
    const {users, msg, see} = req.body;
    const chatdb = await chatModel.findOne({users: {$all:users}});
    let newChat = null
    if(chatdb){
        chatdb.chat.push(msg);
        chatdb.see = see
        chatdb.save();
    }else{
        newChat = new chatModel({
            users,
            chat: [[...msg]],
        });
        newChat.save();
    };
    (newChat || chatdb) && res.status(200).json({})
});

router.put('/api/chatSee', isAuthenticated, async(req, res) => {
    const {see, userA, userB} = req.body;

    await chatModel.updateOne({users: {$all: [userA, userB]}},{see});
    res.json({})
})

module.exports = (router);