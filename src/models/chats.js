const mongo = require("mongoose");
const { Schema } = mongo;

const chats = new Schema({

    users: [],
    chat: [],
    see: {type: Boolean, required:true, default: true}

});

module.exports = mongo.model("chats", chats);