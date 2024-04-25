const mongo = require("mongoose");
const { Schema } = mongo;

const publicacion = new Schema({

    publication: {type:String, required: true},
    date: {type: Date, default: Date.now},
    userId: {type: String, required: true},
    user: {type: String, required: true},
    profilePic: {type: String, required: false},
    likes: [String]

});

module.exports = mongo.model("publication", publicacion);