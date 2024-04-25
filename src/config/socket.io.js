const chatModel= require('../models/chats');

let onlineUsers = []

module.exports = (io) => {
    io.on('connection', (socket) => {

        socket.on('connected', (data) => {
            const isAlready = onlineUsers.filter(uSearch => uSearch[0] === data.id);
            if(!isAlready.length){
                console.log(data.user, 'is connected')
                onlineUsers.push([
                    data.id,
                    socket.id
                ]);
            }
        });

        socket.on('notification', async(data) => {
            if(data.receiver.length === 1){
                const [user] = onlineUsers.filter(userid => data.receiver === userid[0]);
                if(user)io.to(user[1]).emit('newNotification', data);
            }else{
                socket.broadcast.emit('newNotification', data);
            }
        });

        socket.on('chat', (data) => {
            const [user] = onlineUsers.filter(userid => data.receiver === userid[0]);
            //chatModel.updateOne({users: {$all: [data.transmitter, data.receiver]}},{see:false})
            if(user)io.to(user[1]).emit('newMsg', [data.transmitter, data.msg]);
        })

        socket.on('disconnect', () => {
            onlineUsers = onlineUsers.filter((id) => id[1] !== socket.id);
        })

    });
    io.listen(8081);
};