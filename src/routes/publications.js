const express = require("express");
const { isAuthenticated } = require("../helpers/auth");
const router = express.Router();
const jwt = require('jsonwebtoken')

const modelPub = require("../models/publications");
const modelUser = require("../models/users");
const modelNoti = require("../models/notifications");

router.get('/api/getPubs', async (req, res) => {
    const pub = req.get('pub');
    if(pub !== 'undefined'){
        if(pub.split('-')[0] === 'id'){
            const results = await modelPub.findById(pub.split('-')[1]).sort({date: "desc"});
            res.status(200).json([results])
        }else{
            const results = await modelPub.find({userId: pub}).sort({date: "desc"});
            res.status(200).json(results)
        }
    }else{
        const results = await modelPub.find().lean().sort({date: "desc"});
        res.status(200).json(results)
    }
});

router.post("/api/upload", isAuthenticated, async(req, res) => {

    let {publication} = req.body;
    let errors = [];
    if(!publication || publication.replace(/ /g, '') === ''){
        errors.push("la publicacion no puede estar vacia.");
    };
    if(publication.length > 1000){
        errors.push('su publicacion es demasiado larga')
    }
    if(errors.length > 0)
    {
        res.json({errors});
    }else{
        const userdb = await modelUser.findById(req.user);
        
        const newPublication = new modelPub({
            publication,
            userId: userdb.id,
            user: userdb.user,
            profilePic: userdb.profilePic,
        });
        newPublication.save()
        .then(() => {

            const newNoti = new modelNoti({
                transmitter: userdb.user+'-'+userdb.profilePic,
                title: 'newPub',
                description: publication,
                receiver: userdb.followers,
                link: '/publication/'+ newPublication.id
            });
            newNoti.save();
        })

        res.status(203).json({pubID: newPublication.id});
    };
    
});

router.put("/api/editSuccess/:id", async(req, res) => {

    const {publication } = req.body;
    console.log(req.body);
    console.log(req.headers);
    await modelPub.findByIdAndUpdate(req.params.id, {publication});
    res.redirect("/");

});

router.delete("/api/delete/:id", async(req,res) => {

    await modelPub.findByIdAndDelete(req.params.id);
    res.redirect(`/`)

});

router.post('/api/like', isAuthenticated, async(req, res) => {
    const publication = await modelPub.findOne({_id: req.body.pubID});
    const userdb = await modelUser.findById(req.user);

    if(!publication.likes) publication.likes = [];
    if(!userdb.likes) userdb.likes = [];
    const userLikes = userdb.likes;
    const likes = publication.likes;

    if(!likes.includes(req.user)){
        likes.push(req.user);
        userLikes.push(req.body.pubID);
    }else{
        for(let i = 0;i<likes.length;i++){
            if(likes[i] == req.user){
                likes.splice(i,1);
            }
        }
        for(let i = 0; i<userLikes.length;i++){
            if(userLikes[i] == req.body.pubID){
                userLikes.splice(i,1);
            }
        }
    }
    publication.likes = likes;
    userdb.likes = userLikes;
    await modelPub.findOneAndUpdate({_id:req.body.pubID},publication);
    await modelUser.findByIdAndUpdate(req.user, userdb)
    res.json({totalLikes: likes});
});

module.exports = router;