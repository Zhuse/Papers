const io = require('socket.io');

module.exports.initializeSocketService = function(server) {
    const newIO = io(server);
    newIO.on('connection', () => {
        console.log("Yeah buddy!");
    })

    newIO.on('textUpdate', (data) => {
        console.log(data)
    })
}