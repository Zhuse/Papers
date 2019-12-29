const io = require('socket.io');

module.exports.initializeSocketService = function(server) {
    const newIO = io(server);
    newIO.on('connection', (socket) => {
        socket.on('textUpdate', (data) => {
            socket.broadcast.emit('textUpdate', data);
        })
    })

}