const chatModel = require('../models/chats');

const chatCleaner = async() => {
    const fecha = new Date();
    if(fecha.getHours == 0){
        await chatModel.remove({});
    }
}

module.exports = (chatCleaner);