const socket = io('http://localhost:3000');
const userBox = document.getElementById("userInput");
const opponentBox = document.getElementById("opponentInput");

function notifyChanges() {
    console.log("fuck")
    socket.broadcast.emit('textUpdate', userBox.nodeValue);
}
socket.on('connection', function(){
    
});

socket.on('textUpdate', (data) => {
    alert(data)
    opponentBox.nodeValue = data;
})