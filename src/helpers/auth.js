const helpers = {}
const jwt = require("jsonwebtoken");

helpers.isAuthenticated = async(req,res, next) =>{
    const token = req.get('auth-token');

    try{
        const user = jwt.verify(token, 'banana123');
        req.user = user.auth;
        next();
    }catch(err){
        if(!token) {
            return res.status(400).json({status: 'error', error: 'no se encontró un token, pruebe logueandose de nuevo.'});
        }
        else{
            return res.status(400).json({status: 'error', error: 'token inválido'});
        }
    }
};

module.exports = helpers;