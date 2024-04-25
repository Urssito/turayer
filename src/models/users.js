const mongo = require("mongoose"),
      { Schema } = mongo,
      bcrypt = require("bcryptjs")


// esquema de usuario

const usuario = new Schema({

    user: {type: String, required: true},
    password: {type:String, required: true},
    email: {type:String, required: true},
    date: {type: Date, default: Date.now},
    description: {type: String, required: true, default: "hola!"},
    followers: [{type: String, required: true, default: []}],
    follows: [{type: String, required: true, default: []}],
    profilePic: {type: String, required: true, default: '/uploads/profilePhotos/default.jpg'},
    likes: [{type: String, required: true, default: []}],
    viewedNotis: [{type: String, required: true, default: []}]
}, {
    collection: "users"
});

usuario.methods.encryptPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(password, salt);
    return hash
};

usuario.methods.matchPassword = function (password) {
    const pass = bcrypt.compare(password, this.password);
    return pass
};

module.exports = mongo.model("user", usuario);