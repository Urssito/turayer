const mongo = require("mongoose");
const { Schema } = mongo;

const notification = new Schema({

    transmitter: [{type:String, required:true}],
    title: {type:String, required:true},
    description: {type:String, required:true},
    receiver: [{type:String, required:true, default: []}],
    see: [{type:String, required:true, default: []}],
    link: {type:String},
    date: {type: Date, default: Date.now},
});

module.exports = mongo.model("notification", notification);