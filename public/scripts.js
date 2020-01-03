const socket = io('http://localhost:3000');
const userBox = document.getElementById("userInput");
const opponentBox = document.getElementById("opponentInput");

socket.on('connection', function(){
    socket.on('textUpdate', (data) => {
        socket.broadcast.emit('textUpdate', data);
    })
});

