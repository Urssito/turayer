const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const objUser = require("../models/users");

passport.use(new LocalStrategy({
    usernameField: 'user',
},
    async(username, password, done) => {
        const user =  await objUser.findOne({user: username});
        if(!user ) {
            return done(null, false, {message: "usuario incorrecto o inexistente"});
        }else {
            const match = await user.matchPassword(password);
            if(match) {
            return done(null, user);
            } else {
            return done(null, false, {message: "Contraseña incorrecta"})
            }
        }

    }
));

passport.serializeUser(function (user, done) {
    done(null , user.id)
});

passport.deserializeUser((id, done) => {

    objUser.findById(id, (err, user) => {
        done(err, user);
    });

});

