const io = require('socket.io');
const { autoMatch, textUpdate, disconnect, matchDisconnect, userConnect } = require('./handlers');

function addHandler(socket, io, event, { noMatch=false, noUser=false, user=false, match=false }, callback) {
    socket.on(event, async (...args) => {
        try {
            if (noUser === true && socket.user) throw new Error('already connected')
            if (user === true && !socket.user) throw new Error('must connect')
            if (noMatch === true && socket.match) throw new Error('user is in a match')
            if (match === true && !socket.match) throw new Error('user is not in a match')
            const newArgs = [].slice.call(args);
            newArgs.push(io);
            callback.call(socket, ...newArgs);
        } catch (error) {
            console.log(error)
            socket.emit('error', event, error.message);
        }
    })
}

module.exports.initializeSocketService = function (server) {
    newIO = io(server);
    newIO.on('connection', (socket) => {
        addHandler(socket, newIO, 'userConnect', { noUser: true }, userConnect)
        addHandler(socket, newIO, 'autoMatch', { user: true }, autoMatch);
        addHandler(socket, newIO, 'textUpdate', { match: true, user: true }, textUpdate);
        addHandler(socket, newIO, 'matchDisconnect', { match: true, user: true }, matchDisconnect)
        addHandler(socket, newIO, 'disconnect', {}, disconnect);
    })
}