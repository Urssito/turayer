const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../helpers/auth");
const sendMail = require('../helpers/email');

const pubModel = require("../models/publications");
const userModel = require("../models/users");
const notiModel = require("../models/notifications");

router.get("/api/home", async(req, res) => {
    if(req.user){
    const publications = await pubModel.find().lean().sort({date: "desc"});
    let user = null
    
    return res.json({ publications });
    }else{
        return res.json({});
    }
});

router.post('/api/home', async (req,res) => {

    // Search Querie|
    if(req.body.query){
        searchQ = req.body.query.toLowerCase();
    }

    if(req.body.query && searchQ.length > 0){
        let hint = ''
        let result = ''

        userModel.find((err,results) => {
            if(err) console.error;

            let limit = 0
            results.forEach((result)=>{
                if(result.user.indexOf(searchQ) != -1 && limit < 5){
                    hint = hint + `<a class="a-normalize searchResult" href="/user/${result.user}">${result.user}</a>\n`
                    limit += 1;
                }

            });
            if(hint == ''){
                result = 'usuario no encontrado';
            }else{
                result = hint;
            }

            res.json({response: result});

        });
    }

    // Likes count
    if(req.body.user){
        const publication = await pubModel.findOne({_id: req.body.pubID});
        if(!publication.likes){
            publication.likes = [];
        }
        const likes = publication.likes;
        if(!likes.includes(req.body.user)){
            likes.push(req.body.user);
        }else{
            for(let i = 0;i<likes.length;i++){
                if(likes[i] == req.body.user){
                    likes.splice(i,1);
                    break;
                }
            }
        }
        publication.likes = likes
        await pubModel.findOneAndUpdate({_id:req.body.pubID},publication);
        res.json({totalLikes: likes})
        console.log(likes)
    }else{
        res.json({nombre: 'lucca'})
    }
});

router.get("/api/authenticate", isAuthenticated, async (req, res) => {
    const userdb = await userModel.findById(req.user);
    let resUser = null;
    if(userdb){
        resUser = await JSON.parse(JSON.stringify(userdb));
        delete resUser['password'];
        delete resUser['_id']
        delete resUser['Google']
        resUser.id = userdb.id

        res.json({resUser});
    }
    else res.json({});
});

let codes = []

router.post('/api/recoverPass', async(req, res) => {
    const {email} = req.body;

    const emaildb = await userModel.findOne({email});
    if(emaildb){
        const code = Math.floor(Math.random() * (10000 - 1000) + 1000)
        const options = {
            to: email,
            subject: 'Cambio de contraseña <No responder>',
            html: `
                <p>Se solicitó un cambio de contraseña para ${emaildb.user}, de ser así
                copie y pegue el siguiente código en el formulario de la pagina</p>\n
                <p>codigo: <b>${code}</b></p>
                si usted no solicito este cambio, ignore este correo electrónico.
            `,
            textEncoding: 'base64',
            headers: [
              { key: 'X-Application-Developer', value: 'Lucca Urso' },
              { key: 'X-Application-Version', value: 'v1.0.0.2' },
            ],
        }

        const messageId = await sendMail(options);
        console.log(messageId)
        if(messageId){
            codes = [...codes, [email, code]];
            res.status(200).json({})
        }else{res.status(401).json({errors: ['hubo un error inseperado, intente de nuevo']})}
    }else{
        res.status(404).json({errors: ['este correo no pertenece a ningun usuario']})
    }
});

router.post('/api/confirmCode', (req, res) => {
    const {code, email} = req.body;

    const codeVerify = codes.filter(codeArr => email == codeArr[0] && code == codeArr[1]);
    console.log(codeVerify)
    if(codeVerify){
        res.status(200).json({});
    }else{
        res.status(404).json({errors: ['Codigo inválido']});
    };
});

router.post('/api/changePassword', async(req, res) => {
    const {password, confirmPassword, email, code} = req.body;
    const codeVerify = codes.filter(codeArr => email == codeArr[0] && code == codeArr[1]);

    console.log(password, email, code, codeVerify)
    if(password == confirmPassword && codeVerify){
        const userdb = await userModel.findOne({email});
        if(userdb){
            console.log(userdb);
            userdb.password = await userdb.encryptPassword(password);
            await userdb.save();
            codes = codes.filter(codeArr => userdb.email == codeArr[0]);
            res.status(200).json({});
        }else{
            res.json(401).json({errors: ['Hubo un error inesperado, intente de nuevo']})
        }
    }else{
        res.json(404).json({errors: ['hubo un problema, recargue la pagina e intente de nuevo']})
    }
});

router.post('/api/search', async(req,res) => {
    const {query} = req.body;
    let results = [];
    let users = []

    if(query){
        users = await userModel.find({
            user: {
                $regex: new RegExp(`^${query}.*`,'i')
            }
        }).exec();
    }
    users.slice(0,5).map(user => {
        results.push(`${user.user}-${user.profilePic}`);
    });
    console.log(results)
    res.status(200).json(results);
})

module.exports = router;
