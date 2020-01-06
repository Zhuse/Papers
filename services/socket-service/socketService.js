const io = require('socket.io');
const Client = require('./HelperClasses/Client');
const Room = require('./HelperClasses/Room');

module.exports.initializeSocketService = function(server) {
    const newIO = io(server);
    newIO.on('connection', (socket) => {
        socket.on('createUser', (userId) => {
            const newUser = new Client(userId, 'waiting');
            waitingRoom.joinRoom(newUser.getUserId, newUser);
        })
        socket.on('joinWaitingRoom', () => {
            socket.join('waitingRoom');
        })
        socket.on('textUpdate', (data) => {
            socket.broadcast.emit('textUpdate', data);
        });
    })
}